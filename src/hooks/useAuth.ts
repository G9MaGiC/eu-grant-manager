import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Signed in successfully');
      return { data, error: null };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      return { data: null, error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: { full_name?: string; organization?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      toast.success('Account created successfully! Please check your email to verify.');
      return { data, error: null };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
      return { data: null, error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset email sent');
      return { error: null };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
      return { error };
    }
  }, []);

  const updateProfile = useCallback(async (updates: { full_name?: string; organization?: string; avatar_url?: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      // Also update profiles table
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: updates.full_name,
            organization: updates.organization,
            avatar_url: updates.avatar_url,
            updated_at: new Date().toISOString(),
          } as any);
      }

      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
      return { error };
    }
  }, [user]);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };
};
