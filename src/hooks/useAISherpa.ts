import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AIConversation, AIMessage, SherpaResponse } from '@/types/ai-sherpa';
import { detectCrisis } from '@/lib/crisis-keywords';
import { toast } from 'sonner';

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

      // Insert user message optimistically
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('ai_messages').insert({
        conversation_id: convId,
        role: 'user',
        content: message,
        crisis_detected: crisisDetected,
      } as any);

      // Call edge function
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      // Build payload matching Edge Function's expected field names
      const payload = {
        message,
        conversation_id: convId!,
        user_context: {
          treatment_stage: profile?.treatment_stage ?? undefined,
          state: profile?.state ?? undefined,
          diagnosis: profile?.diagnosis ?? undefined,
          priority_categories: profile?.priority_categories ?? undefined,
        },
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-sherpa`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get response from Hope');
      }

      const sherpaResponse: SherpaResponse = await response.json();

      // Insert assistant message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('ai_messages').insert({
        conversation_id: convId,
        role: 'assistant',
        content: sherpaResponse.reply,
        suggested_prompts: sherpaResponse.suggestedPrompts ?? [],
        crisis_detected: sherpaResponse.crisisDetected ?? false,
        resource_ids: sherpaResponse.referencedResources?.map(r => r.id) ?? [],
        metadata: { referenced_resources: sherpaResponse.referencedResources ?? [] },
      } as any);

      return { ...sherpaResponse, conversation_id: convId, crisis_detected_client: crisisDetected };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-messages', data.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
    onError: (error) => {
      toast.error('Hope is temporarily unavailable', {
        description: error instanceof Error ? error.message : 'Please try again in a moment.',
      });
    },
  });

  return { sendMessage };
}
