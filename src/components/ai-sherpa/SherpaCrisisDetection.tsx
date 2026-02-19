import { Phone, MessageSquare, ExternalLink, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CRISIS_RESOURCES } from '@/lib/constants';

export default function SherpaCrisisDetection() {
  return (
    <Card className="border-red-200 bg-red-50 my-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm mb-1">
              It sounds like you might need immediate support.
            </p>
            <p className="text-red-700 text-xs mb-3">
              Please reach out to one of these free, confidential crisis resources available 24/7:
            </p>
            <div className="space-y-2">
              {CRISIS_RESOURCES.map(resource => (
                <div key={resource.name} className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-red-800">{resource.name}:</span>
                  {resource.phone && (
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-100">
                      <a href={`tel:${resource.phone}`}>
                        <Phone className="h-3 w-3 mr-1" />
                        {resource.phone}
                      </a>
                    </Button>
                  )}
                  {resource.text && (
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-100">
                      <a href={`sms:${resource.textNumber}?body=${resource.text}`}>
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Text {resource.text}
                      </a>
                    </Button>
                  )}
                  {resource.url && (
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-100">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
