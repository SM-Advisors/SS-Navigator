import ReactMarkdown from 'react-markdown';
import { ExternalLink, Mail, Send } from 'lucide-react';
import { AIMessage, DraftEmail } from '@/types/ai-sherpa';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import SherpaCrisisDetection from './SherpaCrisisDetection';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SherpaChatMessageProps {
  message: AIMessage;
  onSuggestedPrompt?: (prompt: string) => void;
}

export default function SherpaChatMessage({ message, onSuggestedPrompt }: SherpaChatMessageProps) {
  const { profile } = useAuth();
  const isUser = message.role === 'user';
  const meta = message.metadata as Record<string, unknown> | null;
  const referencedResources = meta?.referenced_resources as Array<{ id: string; title: string; organization_name: string; organization_url?: string }> | undefined;
  const draftEmail = meta?.draft_email as DraftEmail | undefined;

  const openDraftEmail = () => {
    if (!draftEmail) return;
    const displayName = profile?.display_name || '';
    const bodyWithName = displayName
      ? draftEmail.body.replace(/Warm regards$/, `Warm regards,\n${displayName}`)
      : draftEmail.body;
    const mailto = `mailto:${encodeURIComponent(draftEmail.to)}?subject=${encodeURIComponent(draftEmail.subject)}&body=${encodeURIComponent(bodyWithName)}`;
    window.open(mailto, '_blank');
    toast.success('Opening your email client...');
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarFallback className={isUser ? 'bg-ss-navy text-white text-xs' : 'bg-ss-gold text-ss-dark text-xs'}>
          {isUser ? getInitials(profile?.display_name || 'U') : 'H'}
        </AvatarFallback>
      </Avatar>

        <div className={`flex flex-col gap-2 max-w-[85%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed overflow-hidden ${
            isUser
              ? 'bg-ss-navy text-white rounded-tr-sm'
              : 'bg-card border shadow-sm rounded-tl-sm text-foreground'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 break-words [&_p]:break-words [&_li]:break-words">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {message.crisis_detected && <SherpaCrisisDetection />}

        {/* Referenced resources */}
        {!isUser && referencedResources && referencedResources.length > 0 && (
          <div className="w-full space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Relevant resources:</p>
            {referencedResources.map(resource => (
              <div key={resource.id} className="bg-card border rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-ss-navy leading-tight">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">{resource.organization_name}</p>
                </div>
                {resource.organization_url && (
                  <Button asChild size="sm" variant="ghost" className="h-7 text-xs shrink-0">
                    <a href={resource.organization_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Draft email card */}
        {!isUser && draftEmail && (
          <div className="w-full bg-card border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">Email draft ready for Navigator team</p>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{draftEmail.subject}</p>
            <Button size="sm" onClick={openDraftEmail} className="gap-1.5 text-xs">
              <Send className="h-3.5 w-3.5" /> Review & Send Email
            </Button>
          </div>
        )}

        {/* Suggested prompts */}
        {!isUser && message.suggested_prompts && message.suggested_prompts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.suggested_prompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => onSuggestedPrompt?.(prompt)}
                className="text-xs bg-ss-navy/5 hover:bg-ss-navy/10 text-ss-navy rounded-full px-3 py-1 border border-ss-navy/20 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(message.created_at ?? new Date().toISOString())}
        </span>
      </div>
    </div>
  );
}
