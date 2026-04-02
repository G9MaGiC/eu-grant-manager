# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Enter project details:
   - Name: `eu-grant-manager`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users (e.g., `West Europe` for EU)
5. Click "Create New Project"

## 2. Get Your API Keys

Once your project is created:

1. Go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`)
   - **anon public** API key (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

## 4. Run the Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/schema.sql`
4. Paste and click **Run**

This will create all tables, indexes, RLS policies, and triggers.

## 5. Enable Authentication (Optional)

If you want email/password authentication:

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure settings:
   - Confirm email: (recommended for production)
   - Secure email change: Enabled
   - Secure password change: Enabled

## 6. Test the Connection

Run your app locally:
```bash
npm run dev
```

Check browser console for any connection errors.

## Database Schema Overview

| Table | Description |
|-------|-------------|
| `grants` | Main grants/applications |
| `tasks` | Tasks for each grant |
| `documents` | Uploaded documents |
| `notes` | Notes and comments |
| `timeline_events` | Deadlines and milestones |
| `submissions` | Submitted applications |
| `profiles` | User profile data |

## Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- View their own data
- Create/update/delete their own data

## Troubleshooting

### "Failed to fetch" error
- Check that `VITE_SUPABASE_URL` is correct
- Check that `VITE_SUPABASE_ANON_KEY` is correct

### RLS policy errors
- Make sure the SQL schema was executed successfully
- Check that user is authenticated before making requests

### CORS errors
- Add your app domain to **Authentication** → **URL Configuration** → **Site URL**
- For local dev, add `http://localhost:5173`

## Free Tier Limits

- Database: 500MB
- Storage: 1GB
- Bandwidth: 2GB/month
- Auth Users: Unlimited
- Real-time: 200 concurrent connections
