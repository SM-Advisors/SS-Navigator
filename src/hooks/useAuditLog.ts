import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAuditLog() {
  const { user } = useAuth();

  const log = useCallback(
    async (
      action: string,
      resourceType?: string,
      resourceId?: string,
      metadata?: Record<string, unknown>
    ) => {
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata: metadata ?? {},
      } as any);
    },
    [user]
  );

  return { log };
}
