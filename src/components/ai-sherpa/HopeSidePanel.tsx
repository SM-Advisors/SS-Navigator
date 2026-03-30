import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SherpaChatMessage from './SherpaChatMessage';
import SherpaChatInput from './SherpaChatInput';
import { useConversationMessages, useAISherpa } from '@/hooks/useAISherpa';
import { useAuth } from '@/contexts/AuthContext';

const QUICK_PROMPTS = [
  'What financial assistance is available?',
  'How do I talk to my child about cancer?',
  'What emotional support resources are there?',
];

interface HopeSidePanelProps {
  open: boolean;
  onClose: () => void;
}

export default function HopeSidePanel({ open, onClose }: HopeSidePanelProps) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: loadingMessages } = useConversationMessages(conversationId);
  const { sendMessage } = useAISherpa(conversationId, setConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (message: string) => {
    if (!user) return;
    sendMessage.mutate(message);
  };

  if (!open) return null;

  const panelWidth = expanded ? 'w-[560px]' : 'w-[380px]';

  return (
    <div className={`fixed bottom-0 right-0 top-0 z-50 ${panelWidth} flex flex-col bg-background border-l shadow-2xl transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <div className="h-8 w-8 rounded-full bg-ss-teal flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-ss-navy">Hope</p>
          <p className="text-xs text-muted-foreground truncate">AI Navigator · Not a medical professional</p>
        </div>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setExpanded(!expanded)}>
          {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loadingMessages ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !messages?.length ? (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="inline-flex h-12 w-12 rounded-full bg-ss-teal/20 items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-ss-teal" />
              </div>
              <h2 className="text-sm font-bold text-ss-navy mb-1">Hi, I'm Hope</h2>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                I'm here to help you navigate resources and answer questions. How can I help?
              </p>
            </div>
            <div className="space-y-2">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left text-xs bg-card border hover:border-ss-navy/30 hover:shadow-sm rounded-lg px-3 py-2.5 transition-all text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(message => (
              <SherpaChatMessage
                key={message.id}
                message={message}
                onSuggestedPrompt={handleSend}
              />
            ))}
            {sendMessage.isPending && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-ss-teal flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <SherpaChatInput onSend={handleSend} disabled={sendMessage.isPending || !user} />
    </div>
  );
}
