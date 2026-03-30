import { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ResourceSearch from '@/components/resources/ResourceSearch';
import ResourceCategoryNav from '@/components/resources/ResourceCategoryNav';
import ResourceCard from '@/components/resources/ResourceCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useResources } from '@/hooks/useResources';
import { useAuth } from '@/contexts/AuthContext';
import { US_STATES } from '@/types/profile';
import { RESOURCES_PER_PAGE } from '@/lib/constants';
import { ResourceFilters } from '@/types/resources';

export default function Resources() {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<ResourceFilters>({
    state: profile?.state || undefined,
  });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useResources(filters, page);
  const totalPages = Math.ceil((data?.total ?? 0) / RESOURCES_PER_PAGE);

  const updateFilter = (key: keyof ResourceFilters, value: string | null | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ss-navy flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Resource Directory
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vetted resources for financial assistance, medical support, emotional care, and more.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3" data-tour="resource-filters">
        <ResourceSearch
          value={filters.search ?? ''}
          onChange={v => updateFilter('search', v)}
        />
        <ResourceCategoryNav
          selected={filters.category ?? null}
          onChange={v => updateFilter('category', v)}
        />
        <div className="flex items-center gap-3">
          <Select
            value={filters.state ?? 'all'}
            onValueChange={v => updateFilter('state', v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-48 text-sm">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {US_STATES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filters.search || filters.category || filters.state) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => { setFilters({}); setPage(1); }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" message="Loading resources..." />
        </div>
      ) : !data?.resources.length ? (
        <EmptyState
          icon={BookOpen}
          title="No resources found"
          description="Try adjusting your search or filters."
          action={{ label: 'Clear Filters', onClick: () => { setFilters({}); setPage(1); } }}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {data.resources.length} of {data.total} resources
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.resources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
