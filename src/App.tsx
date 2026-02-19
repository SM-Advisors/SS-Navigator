import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { supabaseConfigured } from '@/integrations/supabase/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import GuidedTour from '@/components/tour/GuidedTour';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Resources from '@/pages/Resources';
import SavedResources from '@/pages/SavedResources';
import AISherpa from '@/pages/AISherpa';
import Community from '@/pages/Community';
import Contact from '@/pages/Contact';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function SetupRequired() {
  return (
    <div className="min-h-screen bg-[#F8F9F3] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex h-16 w-16 rounded-full bg-[#10233B] items-center justify-center mb-6">
          <span className="text-[#FEC415] font-bold text-2xl">SS</span>
        </div>
        <h1 className="text-2xl font-bold text-[#10233B] mb-3">SS Navigator</h1>
        <p className="text-gray-500 mb-6">Sebastian Strong Foundation</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
          <p className="text-amber-800 font-semibold text-sm mb-2">Supabase connection required</p>
          <p className="text-amber-700 text-sm">
            Set <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> in your
            environment variables to connect to your Supabase project.
          </p>
        </div>
        <p className="text-xs text-gray-400">
          In Lovable: Project Settings → Environment Variables
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!supabaseConfigured) {
    return <SetupRequired />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <SessionProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />

              {/* Onboarding (authenticated but pre-onboarding) */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute requireOnboarding={false}>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* Protected app routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/saved" element={<SavedResources />} />
                <Route path="/sherpa" element={<AISherpa />} />
                <Route path="/community" element={<Community />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Global guided tour */}
            <GuidedTour />

            <Toaster position="top-right" richColors />
          </SessionProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
