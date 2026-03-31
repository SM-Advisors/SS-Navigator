import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Resource, ResourceFilters } from '@/types/resources';
import { RESOURCES_PER_PAGE } from '@/lib/constants';

export function useResources(filters: ResourceFilters = {}, page = 1) {
  return useQuery({
    queryKey: ['resources', filters, page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      // If radius filter is active with coordinates, use the distance function
      if (filters.radiusMiles && filters.userLat && filters.userLng) {
        // First get IDs within radius
        const { data: nearby, error: rpcError } = await supabase.rpc(
          'resources_within_radius' as any,
          {
            user_lat: filters.userLat,
            user_lng: filters.userLng,
            radius_miles: filters.radiusMiles,
            fallback_state: filters.state ?? null,
          }
        );
        if (rpcError) throw rpcError;

        const nearbyIds = (nearby as any[] ?? []).map((r: any) => r.resource_id);
        if (nearbyIds.length === 0) {
          return { resources: [] as Resource[], total: 0 };
        }

        let query = supabase
          .from('resources')
          .select('*', { count: 'exact' })
          .in('id', nearbyIds)
          .eq('is_active', true)
          .order('priority_order', { ascending: false })
          .range((page - 1) * RESOURCES_PER_PAGE, page * RESOURCES_PER_PAGE - 1);

        if (filters.search) {
          query = query.textSearch('search_vector', filters.search, { type: 'websearch' });
        }
        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category as Exclude<typeof filters.category, 'all'>);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { resources: (data ?? []) as Resource[], total: count ?? 0 };
      }

      // Standard query (no radius)
      let query = supabase
        .from('resources')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('priority_order', { ascending: false })
        .range((page - 1) * RESOURCES_PER_PAGE, page * RESOURCES_PER_PAGE - 1);

      if (filters.search) {
        query = query.textSearch('search_vector', filters.search, { type: 'websearch' });
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category as Exclude<typeof filters.category, 'all'>);
      }
      if (filters.state) {
        if (filters.excludeNational) {
          query = query.contains('applicable_states', [filters.state]);
        } else {
          query = query.or(`applicable_states.cs.{${filters.state}},applicable_states.eq.{}`);
        }
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { resources: (data ?? []) as Resource[], total: count ?? 0 };
    },
  });
}

export function useFeaturedResources() {
  return useQuery({
    queryKey: ['resources', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('priority_order', { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as Resource[];
    },
  });
}

export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: ['resource', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Resource;
    },
  });
}

export function useToggleSave(resourceId: string) {
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('saved_resources')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ user_id: userId, resource_id: resourceId } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-resources'] });
    },
  });

  const unsave = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('saved_resources')
        .delete()
        .eq('user_id', userId)
        .eq('resource_id', resourceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-resources'] });
    },
  });

  return { save, unsave };
}
