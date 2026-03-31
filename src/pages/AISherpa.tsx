import { useState, useEffect, useRef } from 'react';
import { Sparkles, Plus, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SherpaChatMessage from '@/components/ai-sherpa/SherpaChatMessage';
import SherpaChatInput from '@/components/ai-sherpa/SherpaChatInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useConversationHistory, useConversationMessages, useAISherpa, useDeleteConversation } from '@/hooks/useAISherpa';
import { formatRelativeTime } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const QUICK_PROMPTS = [
  'What financial assistance is available for us?',
  'How do I talk to my child about cancer?',
  'What emotional support resources are there?',
  'Can you help me understand treatment terms?',
  'What should I bring to the hospital?',
  'Are there support groups for siblings?',
];

export default function AISherpa() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useConversationHistory();
  const { data: messages, isLoading: loadingMessages } = useConversationMessages(conversationId);
  const { sendMessage } = useAISherpa(conversationId, setConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (message: string) => {
    sendMessage.mutate(message);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  const handleNewConversation = () => {
    setConversationId(null);
    if (isMobile) setShowSidebar(false);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-10rem)] flex gap-4" data-tour="sherpa-chat">
      {/* Conversation sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform ${
                showSidebar ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'w-64 shrink-0'
        } flex flex-col border rounded-xl overflow-hidden`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <span className="text-sm font-semibold text-ss-navy">Conversations</span>
          <Button size="sm" variant="ghost" onClick={handleNewConversation} className="h-7 w-7 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations?.map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  setConversationId(conv.id);
                  if (isMobile) setShowSidebar(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  conversationId === conv.id
                    ? 'bg-ss-navy text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <p className="font-medium truncate text-xs">{conv.title || 'New conversation'}</p>
                <p className={`text-xs mt-0.5 ${conversationId === conv.id ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {formatRelativeTime(conv.updated_at ?? conv.created_at ?? new Date().toISOString())}
                </p>
              </button>
            ))}
            {!conversations?.length && (
              <p className="text-xs text-muted-foreground text-center py-4 px-2">
                No conversations yet. Start by asking Hope a question!
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-gray-50">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
          {isMobile && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
          <div className="h-8 w-8 rounded-full bg-ss-teal flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-ss-navy">Hope</p>
            <p className="text-xs text-muted-foreground">AI Navigator · Not a medical professional</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" message="Loading conversation..." />
            </div>
          ) : !conversationId || !messages?.length ? (
            <div className="space-y-6">
              {/* Welcome */}
              <div className="text-center py-6">
                <div className="inline-flex h-16 w-16 rounded-full bg-ss-teal/20 items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-ss-teal" />
                </div>
                <h2 className="text-lg font-bold text-ss-navy mb-2">Hi, I'm Hope</h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  I'm here to help you navigate resources, answer questions, and point you in the
                  right direction. I'm not a medical professional, but I'm here to support you.
                </p>
              </div>

              {/* Quick prompts */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center mb-3">
                  Common questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="text-left text-sm bg-white border border-gray-200 hover:border-ss-navy/30 hover:shadow-sm rounded-xl px-4 py-3 transition-all text-gray-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <SherpaChatMessage
                  key={message.id}
                  message={message}
                  onSuggestedPrompt={handleSuggestedPrompt}
                />
              ))}
              {sendMessage.isPending && (
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-ss-teal flex items-center justify-center shrink-0">
                     <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <SherpaChatInput onSend={handleSend} disabled={sendMessage.isPending} />
      </div>

      {/* Mobile overlay */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}
