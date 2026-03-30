import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EvalSuite } from '@/data/eval-prompts';
import { toast } from 'sonner';
import { useRef, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EvalRunConfig {
  suite: EvalSuite;
  model?: string;
  prompt_version?: string;
  kb_version?: string;
  retrieval_threshold?: number;
  retrieval_count?: number;
  notes?: string;
}

export interface EvalRun {
  id: string;
  suite_id: string;
  suite_name: string;
  model: string;
  prompt_version: string;
  kb_version: string | null;
  retrieval_threshold: number;
  retrieval_count: number;
  notes: string | null;
  run_by: string | null;
  started_at: string;
  completed_at: string | null;
  total_prompts: number;
  success_count: number;
  error_count: number;
  grounded_count: number;
  avg_latency_ms: number | null;
  avg_response_length: number | null;
  unique_sources_used: number;
  status: 'running' | 'completed' | 'failed';
  created_at: string;
}

export interface EvalResult {
  id: string;
  run_id: string;
  prompt_id: string;
  category: string;
  prompt_text: string;
  status: 'pending' | 'success' | 'error';
  reply: string | null;
  sources: Array<{ title: string; document_id: string; program?: string }>;
  suggested_prompts: string[] | null;
  grounded_in_sources: boolean | null;
  retrieved_chunks: Array<{
    id: string; document_title: string; content: string; similarity: number;
  }>;
  error_message: string | null;
  latency_ms: number | null;
  response_length: number | null;
  created_at: string;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useEvalRuns() {
  return useQuery({
    queryKey: ['eval-runs'],
    queryFn: async (): Promise<EvalRun[]> => {
      const { data, error } = await supabase
        .from('eval_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as EvalRun[];
    },
  });
}

export function useEvalResults(runId: string | null) {
  return useQuery({
    queryKey: ['eval-results', runId],
    enabled: !!runId,
    queryFn: async (): Promise<EvalResult[]> => {
      const { data, error } = await supabase
        .from('eval_results')
        .select('*')
        .eq('run_id', runId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(r => ({
        ...r,
        sources: (r.sources as unknown as EvalResult['sources']) ?? [],
        retrieved_chunks: (r.retrieved_chunks as unknown as EvalResult['retrieved_chunks']) ?? [],
      })) as EvalResult[];
    },
  });
}

// ── Stop a running eval ──────────────────────────────────────────────────────

export function useStopEval() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (runId: string) => {
      // Update the run status to failed so the loop checks it
      await supabase.from('eval_runs').update({
        status: 'failed' as const,
        completed_at: new Date().toISOString(),
      }).eq('id', runId);

      qc.invalidateQueries({ queryKey: ['eval-runs'] });
      return runId;
    },
    onSuccess: () => toast.info('Eval run stopped'),
    onError: (e) => toast.error('Failed to stop run', { description: (e as Error).message }),
  });
}

// ── Batch Eval Mutation ───────────────────────────────────────────────────────

export function useRunEval() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const mutation = useMutation({
    mutationFn: async (config: EvalRunConfig) => {
      const controller = new AbortController();
      abortRef.current = controller;

      const {
        suite,
        model = 'claude-sonnet-4-5-20250929',
        prompt_version = 'v1',
        kb_version,
        retrieval_threshold = 0.5,
        retrieval_count = 8,
        notes,
      } = config;

      // Create the run record
      const { data: runData, error: runErr } = await supabase
        .from('eval_runs')
        .insert({
          suite_id: suite.id,
          suite_name: suite.name,
          model,
          prompt_version,
          kb_version: kb_version ?? null,
          retrieval_threshold,
          retrieval_count,
          notes: notes ?? null,
          run_by: user?.id ?? null,
          total_prompts: suite.prompts.length,
          status: 'running',
        })
        .select()
        .single();

      if (runErr || !runData) throw new Error(runErr?.message ?? 'Failed to create run');
      const runId = (runData as EvalRun).id;

      qc.invalidateQueries({ queryKey: ['eval-runs'] });

      // Get auth token once
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      let successCount = 0;
      let errorCount = 0;
      let groundedCount = 0;
      let totalLatency = 0;
      let totalLength = 0;
      const allSources = new Set<string>();

      // Process prompts sequentially (no hammering the API)
      for (const prompt of suite.prompts) {
        // Check if aborted
        if (controller.signal.aborted) {
          break;
        }

        let result: Partial<EvalResult> = {
          run_id: runId,
          prompt_id: prompt.id,
          category: prompt.category,
          prompt_text: prompt.prompt,
          status: 'pending',
        };

        try {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/navigator-chat`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                message: prompt.prompt,
                retrieval_threshold,
                retrieval_count,
                model,
              }),
              signal: controller.signal,
            }
          );

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error ?? `HTTP ${res.status}`);
          }

          const data = await res.json();

          result = {
            ...result,
            status: 'success',
            reply: data.reply ?? null,
            sources: data.sources ?? [],
            suggested_prompts: data.suggestedPrompts ?? [],
            grounded_in_sources: data.groundedInSources ?? false,
            retrieved_chunks: data.retrievedChunks ?? [],
            latency_ms: data.latency_ms ?? null,
            response_length: data.reply?.length ?? null,
          };

          successCount++;
          if (data.groundedInSources) groundedCount++;
          if (data.latency_ms) totalLatency += data.latency_ms;
          if (data.reply) totalLength += data.reply.length;
          if (data.sources) {
            for (const s of data.sources) allSources.add(s.document_id ?? s.title);
          }

        } catch (e) {
          if ((e as Error).name === 'AbortError') break;
          result = {
            ...result,
            status: 'error',
            error_message: (e as Error).message,
          };
          errorCount++;
        }

        // Persist result
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from('eval_results').insert(result as any);
        qc.invalidateQueries({ queryKey: ['eval-results', runId] });

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
      }

      const completed = successCount + errorCount;
      const avgLatency = successCount > 0 ? totalLatency / successCount : null;
      const avgLength = successCount > 0 ? totalLength / successCount : null;
      const wasStopped = controller.signal.aborted;

      // Update run record with final metrics
      await supabase.from('eval_runs').update({
        status: wasStopped ? 'failed' : (errorCount === completed ? 'failed' : 'completed'),
        completed_at: new Date().toISOString(),
        success_count: successCount,
        error_count: errorCount,
        grounded_count: groundedCount,
        avg_latency_ms: avgLatency,
        avg_response_length: avgLength,
        unique_sources_used: allSources.size,
      }).eq('id', runId);

      qc.invalidateQueries({ queryKey: ['eval-runs'] });

      return runId;
    },
    onSuccess: () => toast.success('Eval run completed'),
    onError: (e) => {
      if ((e as Error).name !== 'AbortError') {
        toast.error('Eval run failed', { description: (e as Error).message });
      }
    },
  });

  return { ...mutation, abort };
}
