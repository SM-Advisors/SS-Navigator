import { useState, useCallback, useRef } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, MapPin, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';

// Simple zip-to-state lookup (first 2 digits of zip → state)
const ZIP_PREFIX_TO_STATE: Record<string, string> = {
  '00': 'PR', '01': 'MA', '02': 'MA', '03': 'NH', '04': 'ME', '05': 'VT',
  '06': 'CT', '07': 'NJ', '08': 'NJ', '09': 'PR', '10': 'NY', '11': 'NY',
  '12': 'NY', '13': 'NY', '14': 'NY', '15': 'PA', '16': 'PA', '17': 'PA',
  '18': 'PA', '19': 'PA', '20': 'DC', '21': 'MD', '22': 'VA', '23': 'VA',
  '24': 'VA', '25': 'WV', '26': 'WV', '27': 'NC', '28': 'NC', '29': 'SC',
  '30': 'GA', '31': 'GA', '32': 'FL', '33': 'FL', '34': 'FL', '35': 'AL',
  '36': 'AL', '37': 'TN', '38': 'TN', '39': 'MS', '40': 'KY', '41': 'KY',
  '42': 'KY', '43': 'OH', '44': 'OH', '45': 'OH', '46': 'IN', '47': 'IN',
  '48': 'MI', '49': 'MI', '50': 'IA', '51': 'IA', '52': 'IA', '53': 'WI',
  '54': 'WI', '55': 'MN', '56': 'MN', '57': 'SD', '58': 'ND', '59': 'MT',
  '60': 'IL', '61': 'IL', '62': 'IL', '63': 'MO', '64': 'MO', '65': 'MO',
  '66': 'KS', '67': 'KS', '68': 'NE', '69': 'NE', '70': 'LA', '71': 'LA',
  '72': 'AR', '73': 'OK', '74': 'OK', '75': 'TX', '76': 'TX', '77': 'TX',
  '78': 'TX', '79': 'TX', '80': 'CO', '81': 'CO', '82': 'WY', '83': 'ID',
  '84': 'UT', '85': 'AZ', '86': 'AZ', '87': 'NM', '88': 'NM', '89': 'NV',
  '90': 'CA', '91': 'CA', '92': 'CA', '93': 'CA', '94': 'CA', '95': 'CA',
  '96': 'HI', '97': 'OR', '98': 'WA', '99': 'WA',
};

const RADIUS_OPTIONS = [
  { value: '25', label: '25 miles' },
  { value: '50', label: '50 miles' },
  { value: '200', label: '200 miles' },
  { value: '250', label: '250 miles' },
];

function zipToState(zip: string): string | null {
  const prefix = zip.trim().slice(0, 2);
  return ZIP_PREFIX_TO_STATE[prefix] ?? null;
}

async function geocodeZip(zip: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) return null;
    return { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
  } catch {
    return null;
  }
}

export default function Resources() {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<ResourceFilters>({
    state: profile?.state || undefined,
  });
  const [page, setPage] = useState(1);
  const [zipInput, setZipInput] = useState(profile?.zip_code || '');
  const [radiusValue, setRadiusValue] = useState<string>('none');
  const [geocoding, setGeocoding] = useState(false);

  const { data, isLoading, isFetching } = useResources(filters, page);
  const totalPages = Math.ceil((data?.total ?? 0) / RESOURCES_PER_PAGE);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateFilter = (key: keyof ResourceFilters, value: string | number | boolean | null | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value ?? undefined }));
    setPage(1);
  };

  const applyRadiusFilter = useCallback(async (zip: string, radius: string) => {
    if (radius === 'none' || zip.length < 5) {
      // Remove radius filter, keep state
      setFilters(prev => {
        const { radiusMiles, userLat, userLng, ...rest } = prev;
        return rest;
      });
      return;
    }

    setGeocoding(true);
    const coords = await geocodeZip(zip);
    setGeocoding(false);

    if (!coords) {
      toast.error('Could not locate that zip code. Try a different one.');
      return;
    }

    const state = zipToState(zip);
    setFilters(prev => ({
      ...prev,
      radiusMiles: parseInt(radius),
      userLat: coords.lat,
      userLng: coords.lng,
      state: state ?? prev.state,
    }));
    setPage(1);
  }, []);

  const handleZipChange = (zip: string) => {
    setZipInput(zip);
    if (zip.length >= 3) {
      const state = zipToState(zip);
      if (state) {
        updateFilter('state', state);
      }
    } else if (zip === '') {
      updateFilter('state', null);
    }
    // If radius is active and zip is complete, re-apply radius
    if (zip.length === 5 && radiusValue !== 'none') {
      applyRadiusFilter(zip, radiusValue);
    }
  };

  const handleRadiusChange = (value: string) => {
    setRadiusValue(value);
    if (value === 'none') {
      setFilters(prev => {
        const { radiusMiles, userLat, userLng, ...rest } = prev;
        return rest;
      });
      return;
    }
    if (zipInput.length === 5) {
      applyRadiusFilter(zipInput, value);
    } else {
      toast.info('Enter a 5-digit zip code to use the distance filter.');
    }
  };

  const hasFilters = filters.search || filters.category || filters.state || filters.excludeNational || filters.radiusMiles;

  const clearAll = () => {
    setFilters({});
    setPage(1);
    setZipInput('');
    setRadiusValue('none');
  };

  return (
    <div ref={contentRef} className="max-w-5xl mx-auto space-y-6">
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
        <div className="flex items-center gap-3 flex-wrap">
          {/* Zip code input */}
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={zipInput}
              onChange={e => handleZipChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="Zip code"
              className="w-28 pl-8 text-sm"
              maxLength={5}
            />
          </div>

          {/* Radius selector */}
          <Select value={radiusValue} onValueChange={handleRadiusChange}>
            <SelectTrigger className="w-36 text-sm">
              <div className="flex items-center gap-1.5">
                <Radar className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Distance" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Any distance</SelectItem>
              {RADIUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* State selector */}
          <Select
            value={filters.state ?? 'all'}
            onValueChange={v => {
              updateFilter('state', v === 'all' ? null : v);
              setZipInput('');
              // Clear radius when manually selecting state
              if (radiusValue !== 'none') {
                setRadiusValue('none');
                setFilters(prev => {
                  const { radiusMiles, userLat, userLng, ...rest } = prev;
                  return { ...rest, state: v === 'all' ? undefined : v };
                });
              }
            }}
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

          {/* Exclude national toggle */}
          {filters.state && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="exclude-national"
                checked={filters.excludeNational ?? false}
                onCheckedChange={v => updateFilter('excludeNational', v === true ? true : undefined)}
              />
              <Label htmlFor="exclude-national" className="text-xs text-muted-foreground cursor-pointer">
                Local only
              </Label>
            </div>
          )}

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={clearAll}
            >
              Clear filters
            </Button>
          )}
        </div>

        {geocoding && (
          <p className="text-xs text-muted-foreground animate-pulse">Locating zip code...</p>
        )}
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
          description={filters.radiusMiles
            ? `No resources found within ${filters.radiusMiles} miles. Try increasing the radius.`
            : 'Try adjusting your search or filters.'
          }
          action={{ label: 'Clear Filters', onClick: clearAll }}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {data.resources.length} of {data.total} resources
            {filters.radiusMiles && ` within ${filters.radiusMiles} miles`}
            {filters.state && !filters.radiusMiles && !filters.excludeNational && ' (including national resources)'}
            {filters.state && !filters.radiusMiles && filters.excludeNational && ` (${filters.state} only)`}
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
                disabled={page <= 1 || isFetching}
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  contentRef.current?.closest('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
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
                disabled={page >= totalPages || isFetching}
                onClick={() => {
                  setPage(p => p + 1);
                  contentRef.current?.closest('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
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
