import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Users, Phone, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FOUNDATION_NAME, CONTACT_PHONE } from '@/lib/constants';

const features = [
  {
    icon: BookOpen,
    title: 'Resource Directory',
    description: 'Browse hundreds of vetted resources for financial assistance, medical support, emotional care, and more — all in one place.',
  },
  {
    icon: Sparkles,
    title: 'Hope AI Sherpa',
    description: 'Our AI guide, Hope, helps you find relevant resources and answers your questions with compassion and care.',
  },
  {
    icon: Users,
    title: 'Community Hub',
    description: 'Connect with other families who truly understand. Share experiences, ask questions, and find your people.',
  },
  {
    icon: Phone,
    title: 'Navigator Support',
    description: 'Real nurse navigators are here for you — connect directly for personalized guidance through your journey.',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-ss-cream">
      {/* Header */}
      <header className="bg-ss-navy text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-ss-teal flex items-center justify-center">
            <span className="text-white font-bold">SS</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">SS Navigator</p>
            <p className="text-white/60 text-xs">{FOUNDATION_NAME}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-white hover:text-white hover:bg-white/10" size="sm">
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild className="bg-ss-teal text-ss-navy hover:bg-ss-teal/90 font-semibold" size="sm">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-ss-teal-light text-ss-navy px-6 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-ss-navy/10 text-ss-navy rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Heart className="h-4 w-4" />
            Hope Navigator Program
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            You Don't Have to Navigate This Alone
          </h1>
          <p className="text-ss-navy/70 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            SS Navigator connects families facing childhood cancer with the resources, community, and
            expert guidance they need — all in one place, completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-ss-navy text-white hover:bg-ss-navy/90 font-bold text-base">
              <Link to="/auth">Start Here — It's Free</Link>
            </Button>
            <Button asChild size="lg" className="bg-ss-navy text-white hover:bg-ss-navy/90 font-bold text-base">
              <a href={`tel:${CONTACT_PHONE}`}>Call a Navigator</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-ss-navy text-center mb-10">Everything You Need, In One Place</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-ss-teal/15 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-ss-navy" />
                </div>
                <h3 className="font-semibold text-ss-navy mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Privacy / Trust */}
      <section className="bg-white px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex h-12 w-12 rounded-full bg-ss-teal/15 items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-ss-navy" />
          </div>
          <h2 className="text-xl font-bold text-ss-navy mb-3">Your Privacy is Sacred</h2>
          <p className="text-muted-foreground leading-relaxed">
            We handle your family's information with the utmost care. Your data is encrypted, never sold,
            and only shared with your explicit consent. We follow HIPAA-aligned practices to protect
            your most sensitive information.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ss-navy text-white px-6 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to find your footing?</h2>
        <p className="text-white/70 mb-6">Join families who've found support through SS Navigator.</p>
        <Button asChild size="lg" className="bg-ss-teal text-ss-navy hover:bg-ss-teal/90 font-bold">
          <Link to="/auth">Create Your Free Account</Link>
        </Button>
      </section>

      <footer className="bg-ss-navy/90 text-white/50 text-xs text-center py-4 px-6">
        © {new Date().getFullYear()} {FOUNDATION_NAME}. All rights reserved. |{' '}
        <a href={`tel:${CONTACT_PHONE}`} className="hover:text-white">{CONTACT_PHONE}</a>
      </footer>
    </div>
  );
}
