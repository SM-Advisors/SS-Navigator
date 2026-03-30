import { useState } from 'react';
import { Mail, Copy, Send, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EmailDraftProps {
  onBack: () => void;
  initialContext?: string;
}

export default function EmailDraft({ onBack, initialContext = '' }: EmailDraftProps) {
  const { profile } = useAuth();
  const [context, setContext] = useState(initialContext);
  const [recipient, setRecipient] = useState('');
  const [subjectHint, setSubjectHint] = useState('');
  const [tone, setTone] = useState<'warm' | 'formal' | 'urgent'>('warm');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string; summary: string } | null>(null);

  const generateDraft = async () => {
    if (!context.trim()) {
      toast.error('Please describe what the email should be about');
      return;
    }

    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/draft-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            context,
            recipient,
            subject_hint: subjectHint,
            user_name: profile?.display_name || '',
            user_email: '',
            tone,
          }),
        }
      );

      if (!res.ok) throw new Error('Failed to generate email');
      const data = await res.json();
      setDraft(data);
    } catch (e) {
      toast.error('Failed to generate email', { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!draft) return;
    const text = `Subject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(text);
    toast.success('Email copied to clipboard');
  };

  const openInMailClient = () => {
    if (!draft) return;
    const mailto = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    window.open(mailto, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-card shrink-0">
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Mail className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Draft an Email</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!draft ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs">What should this email say?</Label>
              <Textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="e.g., I need to request an insurance appeal for my child's treatment denial..."
                className="text-sm min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Recipient (optional)</Label>
              <Input
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="e.g., insurance@company.com"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Subject hint (optional)</Label>
              <Input
                value={subjectHint}
                onChange={e => setSubjectHint(e.target.value)}
                placeholder="e.g., Appeal for treatment authorization"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Tone</Label>
              <Select value={tone} onValueChange={v => setTone(v as typeof tone)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm">Warm & compassionate</SelectItem>
                  <SelectItem value="formal">Formal & professional</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateDraft} disabled={loading || !context.trim()} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {loading ? 'Generating...' : 'Generate Draft'}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input
                value={draft.subject}
                onChange={e => setDraft({ ...draft, subject: e.target.value })}
                className="text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Body</Label>
              <Textarea
                value={draft.body}
                onChange={e => setDraft({ ...draft, body: e.target.value })}
                className="text-sm min-h-[200px]"
              />
            </div>
            <p className="text-xs text-muted-foreground italic">{draft.summary}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1 gap-1 text-xs">
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              {recipient && (
                <Button size="sm" onClick={openInMailClient} className="flex-1 gap-1 text-xs">
                  <Send className="h-3.5 w-3.5" /> Open in Mail
                </Button>
              )}
            </div>
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setDraft(null)}>
              ← Edit & Regenerate
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
