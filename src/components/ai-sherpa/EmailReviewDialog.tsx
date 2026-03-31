import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DraftEmail } from '@/types/ai-sherpa';

interface EmailReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: DraftEmail;
}

export default function EmailReviewDialog({ open, onOpenChange, draft }: EmailReviewDialogProps) {
  const { user, profile } = useAuth();
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const userEmail = user?.email ?? '';
  const userName = profile?.display_name ?? 'A family member';

  const handleSend = async () => {
    setSending(true);
    try {
      const fullMessage = `${body}\n\n---\nPlease reply to: ${userEmail}\nSent via Hope AI Navigator on behalf of ${userName}`;

      const { error } = await supabase.from('contact_submissions').insert({
        name: userName,
        email: userEmail,
        subject: subject,
        message: fullMessage,
        submission_type: 'navigator_referral',
        user_id: user?.id ?? null,
      });

      if (error) throw error;

      setSent(true);
      toast.success('Message sent to the Navigator team!', {
        description: 'They'll review your request and reach out to you.',
      });
    } catch (err) {
      console.error('Failed to send:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setSent(false);
      setSubject(draft.subject);
      setBody(draft.body);
    }, 300);
  };

  if (sent) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <DialogTitle>Message Sent!</DialogTitle>
            <DialogDescription>
              Your message has been delivered to the Navigator team. They'll review it and reach out to you at <strong>{userEmail}</strong>.
            </DialogDescription>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Message to Navigator Team</DialogTitle>
          <DialogDescription>
            Edit the message below, then send it directly to the Sebastian Strong Navigator team. They'll reply to <strong>{userEmail}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-body">Message</Label>
            <Textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="resize-y"
            />
          </div>

          <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <strong>Your email:</strong> {userEmail} — the Navigator team will reply to this address.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending || !subject.trim() || !body.trim()} className="gap-1.5">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? 'Sending...' : 'Send to Navigator Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
