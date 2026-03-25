import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KBDocument {
  document_id: string;
  document_title: string;
  program: string | null;
  resource_type: string | null;
  category: string | null;
  source_url: string | null;
  applicable_states: string[];
  tags: string[];
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface KBChunk {
  id: string;
  document_id: string;
  document_title: string;
  chunk_index: number;
  content: string;
  program: string | null;
  resource_type: string | null;
  category: string | null;
  source_url: string | null;
  similarity?: number;
}

export function useKBDocuments() {
  return useQuery({
    queryKey: ['knowledge-base-documents'],
    queryFn: async (): Promise<KBDocument[]> => {
      // Aggregate by document_id to get unique documents with chunk counts
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('document_id, document_title, program, resource_type, category, source_url, applicable_states, tags, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by document_id
      const map = new Map<string, KBDocument>();
      for (const row of data ?? []) {
        if (map.has(row.document_id)) {
          map.get(row.document_id)!.chunk_count++;
        } else {
          map.set(row.document_id, {
            document_id: row.document_id,
            document_title: row.document_title,
            program: row.program,
            resource_type: row.resource_type,
            category: row.category,
            source_url: row.source_url,
            applicable_states: row.applicable_states ?? [],
            tags: row.tags ?? [],
            chunk_count: 1,
            created_at: row.created_at ?? '',
            updated_at: row.updated_at ?? '',
          });
        }
      }
      return Array.from(map.values());
    },
  });
}

export function useDeleteKBDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (document_id: string) => {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('document_id', document_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-base-documents'] });
      toast.success('Document deleted from knowledge base');
    },
    onError: (e) => toast.error('Delete failed', { description: (e as Error).message }),
  });
}

export function useIngestDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      document_id: string;
      document_title: string;
      content: string;
      program?: string;
      resource_type?: string;
      category?: string;
      source_url?: string;
      applicable_states?: string[];
      tags?: string[];
      replace_existing?: boolean;
    }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ingestion failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['knowledge-base-documents'] });
      toast.success(`Ingested "${data.document_id}"`, {
        description: `${data.chunks_created} chunks created`,
      });
    },
    onError: (e) => toast.error('Ingestion failed', { description: (e as Error).message }),
  });
}
