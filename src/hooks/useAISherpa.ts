import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AIConversation, AIMessage, SherpaResponse } from '@/types/ai-sherpa';
import { detectCrisis } from '@/lib/crisis-keywords';
import { toast } from 'sonner';

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      // Delete messages first, then conversation
      await supabase.from('ai_messages').delete().eq('conversation_id', conversationId);
      const { error } = await supabase.from('ai_conversations').delete().eq('id', conversationId);
      if (error) throw error;
      return conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      toast.success('Conversation deleted');
    },
    onError: () => {
      toast.error('Failed to delete conversation');
    },
  });
}

export function useConversationHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ai-conversations', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as AIConversation[];
    },
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['ai-messages', conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as AIMessage[];
    },
  });
}

export function useAISherpa(conversationId: string | null, setConversationId: (id: string) => void) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error('Not authenticated');

      // Client-side crisis detection
      const crisisDetected = detectCrisis(message);

      let convId = conversationId;

      // Create conversation if needed
      if (!convId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({ user_id: user.id, title: message.slice(0, 60) } as any)
          .select()
          .single();
        if (error) throw error;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        convId = (data as any).id;
        setConversationId(convId!);
      }

      // Optimistically add user message to cache
      const optimisticMsg: AIMessage = {
        id: `optimistic-${Date.now()}`,
        conversation_id: convId!,
        role: 'user',
        content: message,
        crisis_detected: crisisDetected,
        created_at: new Date().toISOString(),
        metadata: null,
        resource_ids: null,
        suggested_prompts: null,
      };
      queryClient.setQueryData<AIMessage[]>(['ai-messages', convId], (old) => [
        ...(old ?? []),
        optimisticMsg,
      ]);

      // Insert user message + call edge function in PARALLEL
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const requestBody = {
        message,
        conversation_id: convId,
        user_context: {
          treatment_stage: profile?.treatment_stage ?? undefined,
          state: profile?.state ?? undefined,
          diagnosis: profile?.diagnosis ?? undefined,
          priority_categories: profile?.priority_categories ?? undefined,
          child_first_name: profile?.child_first_name ?? undefined,
          additional_info: profile?.additional_info ?? undefined,
        },
      };

      const [, response] = await Promise.all([
        // Fire-and-forget user message insert
        supabase.from('ai_messages').insert({
          conversation_id: convId,
          role: 'user',
          content: message,
          crisis_detected: crisisDetected,
        } as any),
        // Call edge function simultaneously
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-sherpa`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        ),
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get response from Hope');
      }

      const sherpaResponse: SherpaResponse = await response.json();

      // Insert assistant message — filter resource_ids to valid UUIDs only
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validResourceIds = (sherpaResponse.referencedResources ?? [])
        .map(r => r.id)
        .filter(id => uuidRegex.test(id));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('ai_messages').insert({
        conversation_id: convId,
        role: 'assistant',
        content: sherpaResponse.reply,
        suggested_prompts: sherpaResponse.suggestedPrompts ?? [],
        crisis_detected: sherpaResponse.crisisDetected ?? false,
        resource_ids: validResourceIds,
        metadata: {
          referenced_resources: sherpaResponse.referencedResources ?? [],
          ...(sherpaResponse.draftEmail ? { draft_email: sherpaResponse.draftEmail } : {}),
        },
      } as any);

      return { ...sherpaResponse, conversation_id: convId, crisis_detected_client: crisisDetected };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-messages', data.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
    onError: (error) => {
      // Remove optimistic message on error
      if (conversationId) {
        queryClient.setQueryData<AIMessage[]>(['ai-messages', conversationId], (old) =>
          (old ?? []).filter(m => !m.id.startsWith('optimistic-'))
        );
      }
      toast.error('Hope is temporarily unavailable', {
        description: error instanceof Error ? error.message : 'Please try again in a moment.',
      });
    },
  });

  return { sendMessage };
}
