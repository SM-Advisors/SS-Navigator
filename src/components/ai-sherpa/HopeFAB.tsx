import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HopeFABProps {
  onClick: () => void;
}

export default function HopeFAB({ onClick }: HopeFABProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-20 md:bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-ss-teal hover:bg-ss-teal/90 shadow-lg shadow-ss-teal/30 p-0"
      aria-label="Open Hope AI Assistant"
    >
      <Sparkles className="h-6 w-6 text-white" />
    </Button>
  );
}
