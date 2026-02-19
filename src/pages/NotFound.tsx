import { Link } from 'react-router-dom';
import { Home, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ss-cream flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-ss-navy/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-ss-navy mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          We couldn't find the page you're looking for. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-ss-navy hover:bg-ss-navy/90">
            <Link to="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/resources">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Resources
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
