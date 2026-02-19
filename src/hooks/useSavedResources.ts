import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Resource } from '@/types/resources';

export function useSavedResources() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-resources', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_resources')
        .select('resource_id')
        .eq('user_id', user!.id);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new Set((data ?? []).map((r: any) => r.resource_id as string));
    },
  });
}

export function useSavedResourcesList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-resources-list', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_resources')
        .select('*, resources(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((r: any) => r.resources as Resource).filter(Boolean);
    },
  });
}
