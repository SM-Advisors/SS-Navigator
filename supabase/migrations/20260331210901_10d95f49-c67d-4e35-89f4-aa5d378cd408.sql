-- Allow users to delete their own conversations
CREATE POLICY "Users can delete their own conversations"
ON public.ai_conversations
FOR DELETE
TO public
USING (auth.uid() = user_id);

-- Allow users to delete messages in their conversations
CREATE POLICY "Users can delete messages in their conversations"
ON public.ai_messages
FOR DELETE
TO public
USING (EXISTS (
  SELECT 1 FROM ai_conversations ac
  WHERE ac.id = ai_messages.conversation_id AND ac.user_id = auth.uid()
));