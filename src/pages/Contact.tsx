import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, MapPin, Globe, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CONTACT_PHONE, CONTACT_EMAIL, CONTACT_ADDRESS } from '@/lib/constants';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Please provide more detail (at least 10 characters)'),
  submission_type: z.string(),
});

type ContactFormData = z.infer<typeof schema>;

const contactInfo = [
  { icon: Phone, label: 'Phone', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}` },
  { icon: Mail, label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: MapPin, label: 'Address', value: CONTACT_ADDRESS, href: undefined as string | undefined },
  { icon: Globe, label: 'Website', value: 'sebastianstrong.org', href: 'https://sebastianstrong.org' },
];

const submissionTypes = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'navigator_request', label: 'Request a Navigator' },
  { value: 'resource_suggestion', label: 'Suggest a Resource' },
  { value: 'community_issue', label: 'Community Issue' },
  { value: 'technical', label: 'Technical Support' },
];

export default function Contact() {
  const { user, profile } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: profile?.display_name || '',
      submission_type: 'general',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from('contact_submissions').insert({
      ...data,
      user_id: user?.id || null,
    } as any);

    if (error) {
      toast.error('Failed to send your message. Please try again or call us directly.');
      return;
    }

    toast.success("Message sent! We'll get back to you within 1-2 business days.");
    reset();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ss-navy">Contact a Navigator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Our nurse navigators provide free, personalized support. Reach out anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Send a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" {...register('name')} placeholder="Jane Smith" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="you@example.com" />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" type="tel" {...register('phone')} placeholder="(555) 555-5555" />
              </div>

              <div>
                <Label>Type of Request</Label>
                <Select defaultValue="general" onValueChange={v => setValue('submission_type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {submissionTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...register('subject')} placeholder="Brief subject line" />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  {...register('message')}
                  placeholder="Tell us how we can help..."
                  rows={5}
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-ss-navy hover:bg-ss-navy/90"
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact info */}
        <div className="space-y-4">
          <Card className="bg-ss-navy text-white border-0">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Hope Navigator Program</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Our nurse navigators are here to guide your family through every step of the childhood
                cancer journey. Services are completely free.
              </p>
              <div className="mt-4 space-y-3">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="h-4 w-4 text-ss-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-white/50 font-medium">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm text-white hover:text-ss-gold transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-white">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="font-semibold text-red-800 text-sm mb-1">Mental Health Crisis?</p>
              <p className="text-red-700 text-xs mb-3">
                If you or someone you know is in crisis, please reach out immediately:
              </p>
              <div className="space-y-2">
                <a href="tel:988" className="flex items-center gap-2 text-sm font-medium text-red-700 hover:underline">
                  <Phone className="h-4 w-4" />
                  988 Suicide &amp; Crisis Lifeline
                </a>
                <a href="sms:741741?body=HELLO" className="flex items-center gap-2 text-sm font-medium text-red-700 hover:underline">
                  <Send className="h-4 w-4" />
                  Crisis Text Line: Text HOME to 741741
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
