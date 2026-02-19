import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Users, Phone, Bookmark, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { TREATMENT_STAGE_LABELS } from '@/types/profile';

const quickActions = [
  {
    to: '/resources',
    icon: BookOpen,
    label: 'Find Resources',
    description: 'Search financial, medical, and emotional support',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
    tourId: 'dashboard-resources',
  },
  {
    to: '/sherpa',
    icon: Sparkles,
    label: 'Ask Hope',
    description: 'Get personalized guidance from our AI sherpa',
    color: 'bg-purple-50 text-purple-700 border-purple-100',
    tourId: 'dashboard-sherpa',
  },
  {
    to: '/community',
    icon: Users,
    label: 'Community',
    description: 'Connect with other families',
    color: 'bg-green-50 text-green-700 border-green-100',
    tourId: 'dashboard-community',
  },
  {
    to: '/resources/saved',
    icon: Bookmark,
    label: 'Saved Resources',
    description: 'Access your bookmarked resources',
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    tourId: 'dashboard-saved',
  },
];

export default function Dashboard() {
  const { profile } = useAuth();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const name = profile?.display_name || 'there';
  const stage = profile?.treatment_stage
    ? TREATMENT_STAGE_LABELS[profile.treatment_stage]
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-ss-navy">
          {greeting}, {name}
        </h1>
        {stage && (
          <p className="text-muted-foreground text-sm mt-1">
            We're here to support you through the {stage.toLowerCase()} stage.
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-tour="quick-actions">
          {quickActions.map(({ to, icon: Icon, label, description, color, tourId }) => (
            <Link
              key={to}
              to={to}
              data-tour={tourId}
              className={`group rounded-xl border p-4 transition-all hover:shadow-md ${color}`}
            >
              <Icon className="h-6 w-6 mb-3" />
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs opacity-70 mt-0.5 leading-tight">{description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigator CTA */}
      <Card className="border-ss-navy/20 bg-ss-navy text-white" data-tour="navigator-cta">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-ss-gold" />
            Talk to a Real Navigator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm mb-4">
            Our nurse navigators provide free, personalized support for your family. No appointment needed.
          </p>
          <Button asChild className="bg-ss-gold text-ss-dark hover:bg-ss-gold/90 font-semibold">
            <Link to="/contact">
              Contact a Navigator
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Profile completion prompt */}
      {profile && (!profile.diagnosis || !profile.state) && (
        <Card className="border-ss-gold/40 bg-ss-gold/10">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-ss-navy text-sm">Complete Your Profile</p>
              <p className="text-xs text-muted-foreground">
                Help us show you the most relevant resources for your family.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link to="/profile">Update Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
