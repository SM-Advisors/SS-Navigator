import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { TREATMENT_STAGE_LABELS, US_STATES, UserProfile } from '@/types/profile';
import { RESOURCE_CATEGORIES } from '@/lib/resource-categories';
import { toast } from 'sonner';

const TOTAL_STEPS = 5;

const childInfoSchema = z.object({
  child_first_name: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_stage: z.string().optional(),
});

const locationSchema = z.object({
  state: z.string().optional(),
  city: z.string().optional(),
});

type ChildInfoData = z.infer<typeof childInfoSchema>;
type LocationData = z.infer<typeof locationSchema>;

export default function Onboarding() {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [priorityCategories, setPriorityCategories] = useState<string[]>([]);

  const childForm = useForm<ChildInfoData>({ resolver: zodResolver(childInfoSchema) });
  const locationForm = useForm<LocationData>({ resolver: zodResolver(locationSchema) });

  const toggleCategory = (cat: string) => {
    setPriorityCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleFinish = async (startTour: boolean) => {
    const childData = childForm.getValues();
    const locationData = locationForm.getValues();

    const { error } = await updateProfile({
      ...childData,
      treatment_stage: childData.treatment_stage as UserProfile['treatment_stage'] | undefined,
      ...locationData,
      priority_categories: priorityCategories,
      onboarding_completed: true,
      tour_completed: !startTour,
    });

    if (error) {
      toast.error('Failed to save your profile. Please try again.');
      return;
    }

    navigate('/dashboard');
    if (startTour) {
      setTimeout(() => window.dispatchEvent(new CustomEvent('restart-tour')), 500);
    }
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-ss-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-full bg-ss-navy items-center justify-center mb-3">
            <span className="text-ss-gold font-bold">SS</span>
          </div>
          <h1 className="text-xl font-bold text-ss-navy">Welcome to SS Navigator</h1>
          <p className="text-sm text-muted-foreground mt-1">Step {step} of {TOTAL_STEPS}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-ss-gold transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ss-navy">You're not alone.</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                SS Navigator was built by Sebastian Strong Foundation to help families like yours find
                the support, resources, and community you need — all in one place.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We'll ask a few optional questions to personalize your experience. You can skip any
                question or update your information later.
              </p>
              <p className="text-xs text-muted-foreground bg-gray-50 rounded-lg p-3">
                🔒 Your information is private and never shared without your consent.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ss-navy">Tell us about your child</h2>
              <p className="text-sm text-muted-foreground">All fields are optional.</p>
              <div>
                <Label htmlFor="child_first_name">Child's first name</Label>
                <Input
                  id="child_first_name"
                  {...childForm.register('child_first_name')}
                  placeholder="E.g. Emma"
                />
              </div>
              <div>
                <Label htmlFor="diagnosis">Diagnosis (optional)</Label>
                <Input
                  id="diagnosis"
                  {...childForm.register('diagnosis')}
                  placeholder="E.g. ALL, Wilms tumor..."
                />
              </div>
              <div>
                <Label>Where are you in the journey?</Label>
                <Select onValueChange={v => childForm.setValue('treatment_stage', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TREATMENT_STAGE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ss-navy">Where are you located?</h2>
              <p className="text-sm text-muted-foreground">
                This helps us show you state-specific resources and programs.
              </p>
              <div>
                <Label>State</Label>
                <Select onValueChange={v => locationForm.setValue('state', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City (optional)</Label>
                <Input
                  id="city"
                  {...locationForm.register('city')}
                  placeholder="Your city"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ss-navy">What matters most right now?</h2>
              <p className="text-sm text-muted-foreground">
                Select all that apply. We'll show you relevant resources first.
              </p>
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
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-ss-navy border-ss-navy' : 'border-gray-300'}`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-xs leading-tight">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ss-navy">You're all set!</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your profile is ready. Would you like a quick tour of SS Navigator to see everything
                available to you?
              </p>
              <div className="space-y-3 pt-2">
                <Button
                  className="w-full bg-ss-gold text-ss-dark hover:bg-ss-gold/90 font-semibold"
                  onClick={() => handleFinish(true)}
                >
                  Yes, show me around!
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => handleFinish(false)}
                >
                  Skip tour, take me to the dashboard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {step < 5 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={() => setStep(s => Math.min(TOTAL_STEPS, s + 1))}
              className="bg-ss-navy hover:bg-ss-navy/90"
            >
              {step === TOTAL_STEPS - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
