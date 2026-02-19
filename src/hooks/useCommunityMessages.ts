import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityChannel, CommunityMessage } from '@/types/community';

export function useCommunityChannels() {
  return useQuery({
    queryKey: ['community-channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_channels')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as CommunityChannel[];
    },
  });
}

export function useCommunityMessages(channelId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['community-messages', channelId],
    enabled: !!channelId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          *,
          user_profiles!user_id (
            display_name,
            role
          )
        `)
        .eq('channel_id', channelId!)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as (CommunityMessage & { user_profiles: { display_name: string; role: string } | null })[];
    },
  });

  // Supabase Realtime subscription
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`community:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['community-messages', channelId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);

  return query;
}

export function useSendMessage(channelId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!user || !channelId) throw new Error('Not ready');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('community_messages').insert({
        channel_id: channelId,
        user_id: user.id,
        content,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-messages', channelId] });
    },
  });
}
