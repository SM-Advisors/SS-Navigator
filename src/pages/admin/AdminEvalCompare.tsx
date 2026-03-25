import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useEvalRuns, useEvalResults, EvalRun } from '@/hooks/useEval';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { GitCompare, TrendingUp, TrendingDown, Minus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface DeltaProps {
  base: number | null | undefined;
  comp: number | null | undefined;
  unit?: string;
  higherIsBetter?: boolean;
  format?: (v: number) => string;
}

function Delta({ base, comp, unit = '', higherIsBetter = true, format = (v) => v.toFixed(1) }: DeltaProps) {
  if (base == null || comp == null) return <span className="text-muted-foreground text-sm">—</span>;
  const delta = comp - base;
  const pct = base !== 0 ? (delta / base) * 100 : 0;
  if (Math.abs(delta) < 0.001) return (
    <span className="flex items-center gap-1 text-muted-foreground text-sm">
      <Minus className="h-3 w-3" /> No change
    </span>
  );
  const improved = higherIsBetter ? delta > 0 : delta < 0;
  const color = improved ? 'text-green-600' : 'text-red-600';
  const Icon = improved ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-1 text-sm font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {delta > 0 ? '+' : ''}{format(delta)}{unit} ({pct > 0 ? '+' : ''}{pct.toFixed(1)}%)
    </span>
  );
}

function RunSummaryCard({ run, label }: { run: EvalRun; label: string }) {
  const successRate = run.total_prompts > 0 ? (run.success_count / run.total_prompts) * 100 : 0;
  const groundingRate = run.success_count > 0 ? (run.grounded_count / run.success_count) * 100 : 0;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{label}</Badge>
          <CardTitle className="text-sm">{run.suite_name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Model</span><span className="font-mono font-medium">{run.model.split('-').slice(-2).join('-')}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Prompt Version</span><span>v{run.prompt_version}</span></div>
        {run.kb_version && <div className="flex justify-between"><span className="text-muted-foreground">KB Version</span><span>{run.kb_version}</span></div>}
        <div className="flex justify-between"><span className="text-muted-foreground">Threshold / Top-k</span><span>{run.retrieval_threshold} / {run.retrieval_count}</span></div>
        <Separator />
        <div className="flex justify-between"><span className="text-muted-foreground">Success Rate</span><span className="font-semibold text-green-700">{successRate.toFixed(1)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Grounding Rate</span><span className="font-semibold text-blue-700">{groundingRate.toFixed(1)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Avg Latency</span><span>{run.avg_latency_ms ? `${Math.round(run.avg_latency_ms)}ms` : '—'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Unique Sources</span><span>{run.unique_sources_used}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Errors</span><span className={run.error_count > 0 ? 'text-red-600' : ''}>{run.error_count}</span></div>
        <div className="flex justify-between text-muted-foreground text-xs mt-1"><span>Run</span><span>{formatRelativeTime(run.started_at)}</span></div>
        {run.notes && <p className="italic text-muted-foreground border-t pt-1">{run.notes}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminEvalCompare() {
  const { data: runs } = useEvalRuns();
  const [baseId, setBaseId] = useState<string | null>(null);
  const [compId, setCompId] = useState<string | null>(null);

  const { data: baseResults } = useEvalResults(baseId);
  const { data: compResults } = useEvalResults(compId);

  const baseRun = runs?.find(r => r.id === baseId);
  const compRun = runs?.find(r => r.id === compId);

  // Build prompt-level comparison map
  const promptIds = baseResults
    ? Array.from(new Set(baseResults.map(r => r.prompt_id)))
    : [];

  const promptComparisons = promptIds.map(pid => {
    const base = baseResults?.find(r => r.prompt_id === pid);
    const comp = compResults?.find(r => r.prompt_id === pid);
    const isRegression = base?.status === 'success' && comp?.status === 'error';
    const isImprovement = base?.status === 'error' && comp?.status === 'success';
    const groundingChanged = base?.grounded_in_sources !== comp?.grounded_in_sources;
    return { pid, base, comp, isRegression, isImprovement, groundingChanged };
  });

  const regressions = promptComparisons.filter(p => p.isRegression).length;
  const improvements = promptComparisons.filter(p => p.isImprovement).length;

  const completedRuns = runs?.filter(r => r.status === 'completed') ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-primary" />
            Run Comparison
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare two eval runs side by side. Understand exactly what changed and whether it was a regression or improvement.
          </p>
        </div>

        {/* Run selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Baseline Run (A)</label>
            <Select value={baseId ?? ''} onValueChange={setBaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select baseline run..." />
              </SelectTrigger>
              <SelectContent>
                {completedRuns.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.suite_name} · {r.model.split('-').slice(-2).join('-')} · {formatRelativeTime(r.started_at)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Comparison Run (B)</label>
            <Select value={compId ?? ''} onValueChange={setCompId}>
              <SelectTrigger>
                <SelectValue placeholder="Select comparison run..." />
              </SelectTrigger>
              <SelectContent>
                {completedRuns.filter(r => r.id !== baseId).map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.suite_name} · {r.model.split('-').slice(-2).join('-')} · {formatRelativeTime(r.started_at)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {baseRun && compRun && (
          <>
            {/* Run summaries */}
            <div className="grid grid-cols-2 gap-4">
              <RunSummaryCard run={baseRun} label="A — Baseline" />
              <RunSummaryCard run={compRun} label="B — Comparison" />
            </div>

            {/* What changed */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">What Changed Between Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Model', a: baseRun.model, b: compRun.model },
                    { label: 'Prompt Version', a: `v${baseRun.prompt_version}`, b: `v${compRun.prompt_version}` },
                    { label: 'KB Version', a: baseRun.kb_version ?? '—', b: compRun.kb_version ?? '—' },
                    { label: 'Retrieval Threshold', a: String(baseRun.retrieval_threshold), b: String(compRun.retrieval_threshold) },
                    { label: 'Top-k Chunks', a: String(baseRun.retrieval_count), b: String(compRun.retrieval_count) },
                  ].map(({ label, a, b }) => (
                    <div key={label} className="flex items-center justify-between border-b pb-1 last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={a !== b ? 'font-semibold text-amber-600' : 'text-muted-foreground'}>
                        {a !== b ? `${a} → ${b}` : a}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metric deltas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Metric Deltas (B vs A)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: 'Success Rate',
                      base: baseRun.total_prompts > 0 ? (baseRun.success_count / baseRun.total_prompts) * 100 : null,
                      comp: compRun.total_prompts > 0 ? (compRun.success_count / compRun.total_prompts) * 100 : null,
                      unit: '%', higherIsBetter: true,
                    },
                    {
                      label: 'Grounding Rate',
                      base: baseRun.success_count > 0 ? (baseRun.grounded_count / baseRun.success_count) * 100 : null,
                      comp: compRun.success_count > 0 ? (compRun.grounded_count / compRun.success_count) * 100 : null,
                      unit: '%', higherIsBetter: true,
                    },
                    {
                      label: 'Error Count',
                      base: baseRun.error_count,
                      comp: compRun.error_count,
                      unit: '', higherIsBetter: false, format: (v: number) => Math.abs(v).toFixed(0),
                    },
                    {
                      label: 'Avg Latency',
                      base: baseRun.avg_latency_ms,
                      comp: compRun.avg_latency_ms,
                      unit: 'ms', higherIsBetter: false,
                    },
                    {
                      label: 'Avg Response Length',
                      base: baseRun.avg_response_length,
                      comp: compRun.avg_response_length,
                      unit: ' chars', higherIsBetter: true,
                    },
                    {
                      label: 'Unique Sources',
                      base: baseRun.unique_sources_used,
                      comp: compRun.unique_sources_used,
                      unit: '', higherIsBetter: true, format: (v: number) => Math.abs(v).toFixed(0),
                    },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">{m.label}</span>
                      <Delta base={m.base} comp={m.comp} unit={m.unit} higherIsBetter={m.higherIsBetter} format={m.format} />
                    </div>
                  ))}
                </div>

                {(regressions > 0 || improvements > 0) && (
                  <div className="mt-4 flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    {regressions > 0 && (
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">{regressions} regression{regressions > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {improvements > 0 && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">{improvements} improvement{improvements > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Per-prompt comparison */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Per-Prompt Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {promptComparisons.map(({ pid, base, comp, isRegression, isImprovement, groundingChanged }) => (
                    <div key={pid} className={`border rounded-lg p-3 ${isRegression ? 'border-red-200 bg-red-50' : isImprovement ? 'border-green-200 bg-green-50' : ''}`}>
                      <div className="flex items-start gap-2 justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs shrink-0">{pid}</Badge>
                            {isRegression && <Badge className="text-xs bg-red-100 text-red-700 border-red-200">Regression</Badge>}
                            {isImprovement && <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Improvement</Badge>}
                            {groundingChanged && <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">Grounding changed</Badge>}
                          </div>
                          <p className="text-xs text-foreground truncate">{base?.prompt_text ?? comp?.prompt_text}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs">
                          <div className="text-center">
                            <p className="text-muted-foreground">A</p>
                            {base?.status === 'success'
                              ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                              : base?.status === 'error'
                              ? <AlertCircle className="h-4 w-4 text-red-600 mx-auto" />
                              : <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
                            }
                            {base?.grounded_in_sources && <span className="text-blue-600">G</span>}
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground">B</p>
                            {comp?.status === 'success'
                              ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                              : comp?.status === 'error'
                              ? <AlertCircle className="h-4 w-4 text-red-600 mx-auto" />
                              : <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
                            }
                            {comp?.grounded_in_sources && <span className="text-blue-600">G</span>}
                          </div>
                        </div>
                      </div>
                      {/* Latency delta */}
                      {base?.latency_ms && comp?.latency_ms && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>A: {base.latency_ms}ms</span>
                          <span>→</span>
                          <span className={comp.latency_ms < base.latency_ms ? 'text-green-600' : comp.latency_ms > base.latency_ms ? 'text-red-600' : ''}>
                            B: {comp.latency_ms}ms
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {(!baseRun || !compRun) && (
          <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
            <div className="text-center">
              <GitCompare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select two completed runs above to compare them</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
