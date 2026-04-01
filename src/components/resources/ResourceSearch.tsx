import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ResourceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ResourceSearch({
  value,
  onChange,
  placeholder = 'Search resources...',
}: ResourceSearchProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (localValue === value) return;

    const timer = setTimeout(() => {
      onChange(localValue);
    }, 350);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative" data-tour="resource-search">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={() => { setLocalValue(''); onChange(''); }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
