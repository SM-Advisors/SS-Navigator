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

export interface MessageWithProfile extends CommunityMessage {
  display_name: string | null;
  user_role: string | null;
}

export function useCommunityMessages(channelId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['community-messages', channelId],
    enabled: !!channelId,
    queryFn: async () => {
      // Fetch messages
      const { data: msgs, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('channel_id', channelId!)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      if (!msgs?.length) return [] as MessageWithProfile[];

      // Fetch profiles for all unique senders
      const uniqueUserIds = [...new Set(msgs.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name')
        .in('user_id', uniqueUserIds);

      // Fetch roles for all unique senders
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', uniqueUserIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p.display_name]));
      const roleMap = new Map((roles ?? []).map(r => [r.user_id, r.role]));

      return msgs.map(m => ({
        ...m,
        display_name: profileMap.get(m.user_id) ?? null,
        user_role: roleMap.get(m.user_id) ?? null,
      })) as MessageWithProfile[];
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
