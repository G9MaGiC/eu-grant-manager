-- EU Grant Manager Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grants table
CREATE TABLE IF NOT EXISTS public.grants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    program TEXT NOT NULL,
    deadline DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'submitted', 'won', 'archived')),
    estimated_value INTEGER NOT NULL DEFAULT 0,
    fit_score INTEGER NOT NULL DEFAULT 0 CHECK (fit_score >= 0 AND fit_score <= 100),
    owner_id UUID NOT NULL,
    owner_name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    type TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    storage_path TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline events table
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('milestone', 'deadline', 'review')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
    grant_name TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    format TEXT NOT NULL CHECK (format IN ('PDF', 'Word', 'CSV')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    organization TEXT,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grants
CREATE POLICY "Users can view own grants" ON public.grants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grants" ON public.grants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grants" ON public.grants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grants" ON public.grants
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notes
CREATE POLICY "Users can view own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for timeline events
CREATE POLICY "Users can view own timeline events" ON public.timeline_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline events" ON public.timeline_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline events" ON public.timeline_events
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for submissions
CREATE POLICY "Users can view own submissions" ON public.submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" ON public.submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_grants_updated_at BEFORE UPDATE ON public.grants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comments for documentation
COMMENT ON TABLE public.grants IS 'Stores grant applications and opportunities';
COMMENT ON TABLE public.tasks IS 'Tasks associated with grants';
COMMENT ON TABLE public.documents IS 'Documents uploaded for grants';
COMMENT ON TABLE public.notes IS 'Notes and comments on grants';
COMMENT ON TABLE public.timeline_events IS 'Timeline events and deadlines for grants';
COMMENT ON TABLE public.submissions IS 'Submitted grant applications';
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users';
