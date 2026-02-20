import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('email not confirmed')) {
          toast.error('Email not confirmed', { description: 'Please check your inbox for a confirmation link, or contact support.' });
        } else if (msg.includes('invalid')) {
          toast.error('Invalid credentials', { description: 'Please check your email and password.' });
        } else {
          toast.error('Sign in failed', { description: error.message });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error('Connection error', { description: 'Unable to reach the server. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" {...register('email')} placeholder="you@example.com" />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-ss-navy hover:bg-ss-navy/90" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { error } = await signUp(data.email, data.password, data.displayName);
      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('rate limit')) {
          toast.error('Too many attempts', { description: 'Please wait a few minutes before trying again.' });
        } else if (msg.includes('already registered') || msg.includes('already been registered')) {
          toast.error('Account already exists', { description: 'Try signing in instead.' });
        } else {
          toast.error('Registration failed', { description: error.message });
        }
      } else {
        toast.success('Account created successfully!');
        navigate('/onboarding');
      }
    } catch (err) {
      toast.error('Connection error', { description: 'Unable to reach the server. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="reg-name">Your Name</Label>
        <Input id="reg-name" {...register('displayName')} placeholder="Jane Smith" />
        {errors.displayName && <p className="text-xs text-red-500 mt-1">{errors.displayName.message}</p>}
      </div>
      <div>
        <Label htmlFor="reg-email">Email</Label>
        <Input id="reg-email" type="email" {...register('email')} placeholder="you@example.com" />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="reg-password">Password</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <Label htmlFor="reg-confirm">Confirm Password</Label>
        <Input
          id="reg-confirm"
          type="password"
          {...register('confirmPassword')}
          placeholder="••••••••"
        />
        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-ss-navy hover:bg-ss-navy/90" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}

export default function Auth() {
  return (
    <div className="min-h-screen bg-ss-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-full bg-ss-navy items-center justify-center mb-4">
            <span className="text-ss-teal font-bold text-xl">SS</span>
          </div>
          <h1 className="text-2xl font-bold text-ss-navy">SS Navigator</h1>
          <p className="text-muted-foreground text-sm mt-1">Sebastian Strong Foundation</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg">Welcome</CardTitle>
            <CardDescription className="text-center text-sm">
              Your guide through the childhood cancer journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="flex-1">Create Account</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your privacy is protected. We never share your information.
        </p>
      </div>
    </div>
  );
}
