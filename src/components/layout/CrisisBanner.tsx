import { Phone, MessageSquare } from 'lucide-react';

export default function CrisisBanner() {
  return (
    <div
      data-tour="crisis-banner"
      className="bg-red-700 text-white text-xs py-1.5 px-4 flex items-center justify-center gap-4 flex-wrap"
    >
      <span className="font-semibold">Crisis Support Available 24/7:</span>
      <a
        href="tel:988"
        className="flex items-center gap-1 hover:underline font-medium"
        aria-label="Call 988 Suicide and Crisis Lifeline"
      >
        <Phone className="h-3 w-3" />
        988 Lifeline
      </a>
      <span className="text-red-300">|</span>
      <a
        href="sms:741741?body=HELLO"
        className="flex items-center gap-1 hover:underline font-medium"
        aria-label="Text HOME to Crisis Text Line at 741741"
      >
        <MessageSquare className="h-3 w-3" />
        Text HOME to 741741
      </a>
    </div>
  );
}
