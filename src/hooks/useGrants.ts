import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Grant, GrantStatus, GrantProgram } from '@/types';
import { toast } from 'sonner';

export interface GrantWithRelations extends Grant {
  tasks: { id: string; title: string; completed: boolean; dueDate?: string }[];
  documents: { id: string; name: string; size: string; type: string; uploadedAt: string }[];
  notes: { id: string; content: string; createdAt: string; author: string }[];
  timeline: { id: string; date: string; title: string; type: 'milestone' | 'deadline' | 'review' }[];
}

export const useGrants = () => {
  const [grants, setGrants] = useState<GrantWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGrants([]);
        return;
      }

      // Fetch grants with related data
      const { data: grantsData, error: grantsError } = await supabase
        .from('grants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (grantsError) throw grantsError;

      // Fetch related data for each grant
      const grantIds = grantsData?.map(g => g.id) || [];

      const [{ data: tasks }, { data: documents }, { data: notes }, { data: timeline }] = await Promise.all([
        supabase.from('tasks').select('*').in('grant_id', grantIds),
        supabase.from('documents').select('*').in('grant_id', grantIds),
        supabase.from('notes').select('*').in('grant_id', grantIds),
        supabase.from('timeline_events').select('*').in('grant_id', grantIds),
      ]);

      // Transform to match our Grant type
      const transformedGrants: GrantWithRelations[] = (grantsData || []).map(grant => ({
        id: grant.id,
        name: grant.name,
        program: grant.program as GrantProgram,
        deadline: grant.deadline,
        status: grant.status as GrantStatus,
        estimatedValue: grant.estimated_value,
        fitScore: grant.fit_score,
        owner: {
          name: grant.owner_name,
        },
        description: grant.description || undefined,
        tasks: (tasks || [])
          .filter(t => t.grant_id === grant.id)
          .map(t => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            dueDate: t.due_date || undefined,
          })),
        documents: (documents || [])
          .filter(d => d.grant_id === grant.id)
          .map(d => ({
            id: d.id,
            name: d.name,
            size: d.size,
            type: d.type,
            uploadedAt: d.uploaded_at,
          })),
        notes: (notes || [])
          .filter(n => n.grant_id === grant.id)
          .map(n => ({
            id: n.id,
            content: n.content,
            createdAt: n.created_at,
            author: n.author,
          })),
        timeline: (timeline || [])
          .filter(t => t.grant_id === grant.id)
          .map(t => ({
            id: t.id,
            date: t.date,
            title: t.title,
            type: t.type,
          })),
      }));

      setGrants(transformedGrants);
    } catch (err) {
      console.error('Error fetching grants:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch grants');
      toast.error('Failed to load grants');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGrant = useCallback(async (grantData: Omit<Grant, 'id' | 'tasks' | 'documents' | 'notes' | 'timeline'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('grants')
        .insert({
          name: grantData.name,
          program: grantData.program,
          deadline: grantData.deadline,
          status: grantData.status,
          estimated_value: grantData.estimatedValue,
          fit_score: grantData.fitScore,
          owner_id: user.id,
          owner_name: grantData.owner.name,
          description: grantData.description,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Grant created successfully');
      await fetchGrants();
      return data;
    } catch (err) {
      console.error('Error creating grant:', err);
      toast.error('Failed to create grant');
      throw err;
    }
  }, [fetchGrants]);

  const updateGrant = useCallback(async (id: string, updates: Partial<Grant>) => {
    try {
      const { error } = await supabase
        .from('grants')
        .update({
          name: updates.name,
          program: updates.program,
          deadline: updates.deadline,
          status: updates.status,
          estimated_value: updates.estimatedValue,
          fit_score: updates.fitScore,
          description: updates.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Grant updated successfully');
      await fetchGrants();
    } catch (err) {
      console.error('Error updating grant:', err);
      toast.error('Failed to update grant');
      throw err;
    }
  }, [fetchGrants]);

  const deleteGrant = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('grants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Grant deleted successfully');
      await fetchGrants();
    } catch (err) {
      console.error('Error deleting grant:', err);
      toast.error('Failed to delete grant');
      throw err;
    }
  }, [fetchGrants]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  return {
    grants,
    loading,
    error,
    refetch: fetchGrants,
    createGrant,
    updateGrant,
    deleteGrant,
  };
};

export const useGrant = (grantId: string | null) => {
  const [grant, setGrant] = useState<GrantWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrant = useCallback(async () => {
    if (!grantId) {
      setGrant(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: grantData, error: grantError } = await supabase
        .from('grants')
        .select('*')
        .eq('id', grantId)
        .single();

      if (grantError) throw grantError;

      const [{ data: tasks }, { data: documents }, { data: notes }, { data: timeline }] = await Promise.all([
        supabase.from('tasks').select('*').eq('grant_id', grantId),
        supabase.from('documents').select('*').eq('grant_id', grantId),
        supabase.from('notes').select('*').eq('grant_id', grantId),
        supabase.from('timeline_events').select('*').eq('grant_id', grantId),
      ]);

      const transformedGrant: GrantWithRelations = {
        id: grantData.id,
        name: grantData.name,
        program: grantData.program as GrantProgram,
        deadline: grantData.deadline,
        status: grantData.status as GrantStatus,
        estimatedValue: grantData.estimated_value,
        fitScore: grantData.fit_score,
        owner: {
          name: grantData.owner_name,
        },
        description: grantData.description || undefined,
        tasks: (tasks || []).map(t => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
          dueDate: t.due_date || undefined,
        })),
        documents: (documents || []).map(d => ({
          id: d.id,
          name: d.name,
          size: d.size,
          type: d.type,
          uploadedAt: d.uploaded_at,
        })),
        notes: (notes || []).map(n => ({
          id: n.id,
          content: n.content,
          createdAt: n.created_at,
          author: n.author,
        })),
        timeline: (timeline || []).map(t => ({
          id: t.id,
          date: t.date,
          title: t.title,
          type: t.type,
        })),
      };

      setGrant(transformedGrant);
    } catch (err) {
      console.error('Error fetching grant:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch grant');
    } finally {
      setLoading(false);
    }
  }, [grantId]);

  useEffect(() => {
    fetchGrant();
  }, [fetchGrant]);

  return {
    grant,
    loading,
    error,
    refetch: fetchGrant,
  };
};
