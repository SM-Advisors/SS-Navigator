import { ExternalLink, Bookmark, BookmarkCheck, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Resource } from '@/types/resources';
import { RESOURCE_CATEGORIES } from '@/lib/resource-categories';
import { truncate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedResources } from '@/hooks/useSavedResources';
import { useToggleSave } from '@/hooks/useResources';
import { toast } from 'sonner';


interface ResourceCardProps {
  resource: Resource;
  showSaveButton?: boolean;
}

export default function ResourceCard({ resource, showSaveButton = true }: ResourceCardProps) {
  const { user } = useAuth();
  const { data: savedSet } = useSavedResources();
  const { save, unsave } = useToggleSave(resource.id);
  const isSaved = savedSet?.has(resource.id) ?? false;
  const category = RESOURCE_CATEGORIES[resource.category as keyof typeof RESOURCE_CATEGORIES];

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to save resources');
      return;
    }
    if (isSaved) {
      await unsave.mutateAsync(user.id);
      toast.success('Resource removed from saved');
    } else {
      await save.mutateAsync(user.id);
      toast.success('Resource saved!');
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge
            variant="secondary"
            className={`text-xs shrink-0 ${category?.color ?? ''}`}
          >
            {category?.label ?? resource.category}
          </Badge>
          {resource.is_crisis_resource && (
            <Badge variant="destructive" className="text-xs">Crisis</Badge>
          )}
        </div>

        <h3 className="font-semibold text-ss-navy text-sm mb-1 leading-tight">
          {resource.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 font-medium">
          {resource.organization_name}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {truncate(resource.description, 120)}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {resource.organization_url && (
            <Button asChild size="sm" variant="outline" className="text-xs h-8">
              <a href={resource.organization_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Visit Site
              </a>
            </Button>
          )}
          {resource.organization_phone && (
            <Button asChild size="sm" variant="ghost" className="text-xs h-8">
              <a href={`tel:${resource.organization_phone}`}>
                <Phone className="h-3 w-3 mr-1" />
                {resource.organization_phone}
              </a>
            </Button>
          )}
          {showSaveButton && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-8 ml-auto"
              onClick={handleToggleSave}
              disabled={save.isPending || unsave.isPending}
            >
              {isSaved ? (
                <><BookmarkCheck className="h-3 w-3 mr-1 text-ss-navy" /> Saved</>
              ) : (
                <><Bookmark className="h-3 w-3 mr-1" /> Save</>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
