import { Link } from 'react-router-dom';
import { Bookmark, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResourceCard from '@/components/resources/ResourceCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useSavedResourcesList } from '@/hooks/useSavedResources';

export default function SavedResources() {
  const { data: resources, isLoading } = useSavedResourcesList();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ss-navy flex items-center gap-2">
          <Bookmark className="h-6 w-6" />
          Saved Resources
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your bookmarked resources, all in one place.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" message="Loading saved resources..." />
        </div>
      ) : !resources?.length ? (
        <EmptyState
          icon={Bookmark}
          title="No saved resources yet"
          description="Browse the resource directory and click the bookmark icon to save resources for easy access."
          action={{ label: 'Browse Resources', onClick: () => {} }}
        >
          <Button asChild className="bg-ss-navy hover:bg-ss-navy/90 mt-4">
            <Link to="/resources">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Resources
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
