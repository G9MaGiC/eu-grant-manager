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
      const grantIds = (grantsData as any[])?.map(g => g.id) || [];
      
      if (grantIds.length === 0) {
        setGrants([]);
        setLoading(false);
        return;
      }

      const [{ data: tasks }, { data: documents }, { data: notes }, { data: timeline }] = await Promise.all([
        supabase.from('tasks').select('*').in('grant_id', grantIds),
        supabase.from('documents').select('*').in('grant_id', grantIds),
        supabase.from('notes').select('*').in('grant_id', grantIds),
        supabase.from('timeline_events').select('*').in('grant_id', grantIds),
      ]);

      // Transform to match our Grant type
      const grantsArr = grantsData as any[] || [];
      const tasksArr = tasks as any[] || [];
      const documentsArr = documents as any[] || [];
      const notesArr = notes as any[] || [];
      const timelineArr = timeline as any[] || [];
      
      const transformedGrants: GrantWithRelations[] = grantsArr.map(grant => ({
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
        tasks: tasksArr
          .filter((t: any) => t.grant_id === grant.id)
          .map((t: any) => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            dueDate: t.due_date || undefined,
          })),
        documents: documentsArr
          .filter((d: any) => d.grant_id === grant.id)
          .map((d: any) => ({
            id: d.id,
            name: d.name,
            size: d.size,
            type: d.type,
            uploadedAt: d.uploaded_at,
          })),
        notes: notesArr
          .filter((n: any) => n.grant_id === grant.id)
          .map((n: any) => ({
            id: n.id,
            content: n.content,
            createdAt: n.created_at,
            author: n.author,
          })),
        timeline: timelineArr
          .filter((t: any) => t.grant_id === grant.id)
          .map((t: any) => ({
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
        } as any)
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
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.program !== undefined) updateData.program = updates.program;
      if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.estimatedValue !== undefined) updateData.estimated_value = updates.estimatedValue;
      if (updates.fitScore !== undefined) updateData.fit_score = updates.fitScore;
      if (updates.description !== undefined) updateData.description = updates.description;
      
      const { error } = await (supabase as any)
        .from('grants')
        .update(updateData)
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

  // Real-time subscriptions
  useEffect(() => {
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to grants changes
      const grantsSubscription = supabase
        .channel('grants_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'grants',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchGrants();
          }
        )
        .subscribe();

      // Subscribe to tasks changes
      const tasksSubscription = supabase
        .channel('tasks_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
          },
          () => {
            fetchGrants();
          }
        )
        .subscribe();

      // Subscribe to notes changes
      const notesSubscription = supabase
        .channel('notes_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notes',
          },
          () => {
            fetchGrants();
          }
        )
        .subscribe();

      return () => {
        grantsSubscription.unsubscribe();
        tasksSubscription.unsubscribe();
        notesSubscription.unsubscribe();
      };
    };

    const cleanup = setupSubscriptions();
    return () => {
      cleanup.then((unsubscribe) => unsubscribe?.());
    };
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

      const grantDataAny = grantData as any;
      const tasksArr = tasks as any[] || [];
      const documentsArr = documents as any[] || [];
      const notesArr = notes as any[] || [];
      const timelineArr = timeline as any[] || [];
      
      const transformedGrant: GrantWithRelations = {
        id: grantDataAny.id,
        name: grantDataAny.name,
        program: grantDataAny.program as GrantProgram,
        deadline: grantDataAny.deadline,
        status: grantDataAny.status as GrantStatus,
        estimatedValue: grantDataAny.estimated_value,
        fitScore: grantDataAny.fit_score,
        owner: {
          name: grantDataAny.owner_name,
        },
        description: grantDataAny.description || undefined,
        tasks: tasksArr.map((t: any) => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
          dueDate: t.due_date || undefined,
        })),
        documents: documentsArr.map((d: any) => ({
          id: d.id,
          name: d.name,
          size: d.size,
          type: d.type,
          uploadedAt: d.uploaded_at,
        })),
        notes: notesArr.map((n: any) => ({
          id: n.id,
          content: n.content,
          createdAt: n.created_at,
          author: n.author,
        })),
        timeline: timelineArr.map((t: any) => ({
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

  // Real-time subscription for single grant
  useEffect(() => {
    if (!grantId) return;

    const subscription = supabase
      .channel(`grant_${grantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grants',
          filter: `id=eq.${grantId}`,
        },
        () => {
          fetchGrant();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `grant_id=eq.${grantId}`,
        },
        () => {
          fetchGrant();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `grant_id=eq.${grantId}`,
        },
        () => {
          fetchGrant();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [grantId, fetchGrant]);

  return {
    grant,
    loading,
    error,
    refetch: fetchGrant,
  };
};
