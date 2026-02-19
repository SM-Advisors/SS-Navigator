import { useState, useRef, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SherpaChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function SherpaChatInput({ onSend, disabled }: SherpaChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const msg = value.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setValue('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end p-4 border-t bg-white" data-tour="sherpa-input">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Hope anything... (Enter to send, Shift+Enter for new line)"
        disabled={disabled}
        rows={1}
        className="resize-none min-h-[44px] max-h-32 flex-1"
      />
      <Button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        size="icon"
        className="bg-ss-navy hover:bg-ss-navy/90 shrink-0 h-11 w-11"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
