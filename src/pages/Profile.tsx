import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, RotateCcw, Save, Check, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { TREATMENT_STAGE_LABELS, US_STATES, UserProfile } from '@/types/profile';
import { RESOURCE_CATEGORIES } from '@/lib/resource-categories';
import { toast } from 'sonner';

const schema = z.object({
  display_name: z.string().min(2, 'Name is required'),
  child_first_name: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_stage: z.string().optional(),
  treatment_center: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zip_code: z.string().optional(),
  additional_info: z.string().optional(),
});

type ProfileFormData = z.infer<typeof schema>;

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const [priorityCategories, setPriorityCategories] = useState<string[]>(
    profile?.priority_categories ?? []
  );
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .rpc('has_any_role', { _user_id: user.id, _roles: ['admin', 'navigator'] })
      .then(({ data }) => { if (data) setIsAdmin(true); });
  }, [user]);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: profile?.display_name || '',
      child_first_name: profile?.child_first_name || '',
      diagnosis: profile?.diagnosis || '',
      treatment_stage: profile?.treatment_stage || undefined,
      treatment_center: profile?.treatment_center || '',
      state: profile?.state || undefined,
      city: profile?.city || '',
      zip_code: profile?.zip_code || '',
      additional_info: profile?.additional_info || '',
    },
  });

  const toggleCategory = (cat: string) => {
    setPriorityCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const onSubmit = async (data: ProfileFormData) => {
    const { error } = await updateProfile({
      ...data,
      treatment_stage: data.treatment_stage as UserProfile['treatment_stage'] | undefined,
      priority_categories: priorityCategories,
    });
    if (error) {
      toast.error('Failed to save profile. Please try again.');
    } else {
      toast.success('Profile updated!');
    }
  };

  const handleReplayTour = () => {
    window.dispatchEvent(new CustomEvent('restart-tour'));
    toast.info('Tour starting...');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ss-navy flex items-center gap-2">
          <User className="h-6 w-6" />
          My Profile
        </h1>
        <Button variant="outline" size="sm" onClick={handleReplayTour}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Replay Tour
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="display_name">Your Name</Label>
              <Input id="display_name" {...register('display_name')} />
              {errors.display_name && <p className="text-xs text-destructive mt-1">{errors.display_name.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Child info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Child's Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="child_first_name">Child's First Name</Label>
              <Input id="child_first_name" {...register('child_first_name')} placeholder="Optional" />
            </div>
            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input id="diagnosis" {...register('diagnosis')} placeholder="E.g. ALL, neuroblastoma..." />
            </div>
            <div>
              <Label>Treatment Stage</Label>
              <Select
                defaultValue={profile?.treatment_stage || undefined}
                onValueChange={v => setValue('treatment_stage', v, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TREATMENT_STAGE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="treatment_center">Treatment Center</Label>
              <Input id="treatment_center" {...register('treatment_center')} placeholder="Hospital name" />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>State</Label>
              <Select
                defaultValue={profile?.state || undefined}
                onValueChange={v => setValue('state', v, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} placeholder="Your city" />
              </div>
              <div>
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input id="zip_code" {...register('zip_code')} placeholder="12345" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Priority Support Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(RESOURCE_CATEGORIES).map(([key, { label, icon: Icon, color }]) => {
                const isSelected = priorityCategories.includes(key);
                return (
                  <div
                    key={key}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleCategory(key)}
                    onClick={() => toggleCategory(key)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-ss-navy bg-ss-navy/5 font-medium text-ss-navy'
                        : 'border-border hover:border-muted-foreground/40'
                    }`}
                  >
                    <div className={`h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-ss-navy border-ss-navy' : 'border-muted-foreground/40'}`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-xs leading-tight">{label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Context for Hope (AI assistant) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Context for Hope</CardTitle>
            <CardDescription className="text-sm">
              Share anything that helps our AI assistant give you better, more personalized guidance.
              This is private and only used to improve your experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="additional_info"
              {...register('additional_info')}
              placeholder={`Examples:\n• "We've already applied for St. Baldrick's and Alex's Lemonade Stand"\n• "Our biggest challenge right now is covering lodging near the hospital"\n• "Emma is 7 years old with relapsed ALL, in a Phase I trial at CHOP"\n• "We're a single-parent household with two other kids at home"`}
              rows={6}
              className="text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              The more context you provide, the better Hope can guide you to the right resources.
            </p>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-ss-navy hover:bg-ss-navy/90"
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
}
