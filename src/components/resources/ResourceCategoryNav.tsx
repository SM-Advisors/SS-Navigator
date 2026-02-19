import { CATEGORY_LIST } from '@/lib/resource-categories';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ResourceCategoryNavProps {
  selected: string | null;
  onChange: (category: string | null) => void;
}

export default function ResourceCategoryNav({ selected, onChange }: ResourceCategoryNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" data-tour="resource-categories">
      <Button
        variant={selected === null ? 'default' : 'outline'}
        size="sm"
        className={cn(
          'shrink-0 text-xs',
          selected === null && 'bg-ss-navy hover:bg-ss-navy/90'
        )}
        onClick={() => onChange(null)}
      >
        All Categories
      </Button>
      {CATEGORY_LIST.map(({ key, label, icon: Icon, color }) => (
        <Button
          key={key}
          variant={selected === key ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'shrink-0 text-xs flex items-center gap-1.5',
            selected === key && 'bg-ss-navy hover:bg-ss-navy/90'
          )}
          onClick={() => onChange(selected === key ? null : key)}
        >
          <Icon className={cn('h-3 w-3', selected !== key && color)} />
          {label}
        </Button>
      ))}
    </div>
  );
}
