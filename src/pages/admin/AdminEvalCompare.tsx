import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useEvalRuns, useEvalResults, EvalRun, EvalResult } from '@/hooks/useEval';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitCompare, TrendingUp, TrendingDown, Minus, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Download, Save, History, Trash2, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatRelativeTime } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ── Delta display ────────────────────────────────────────────────────────────

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

// ── Run summary card ─────────────────────────────────────────────────────────

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
        <div className="flex justify-between"><span className="text-muted-foreground">Model</span><span className="font-mono font-medium">{run.model}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Prompt Version</span><span>v{run.prompt_version}</span></div>
        {run.kb_version && <div className="flex justify-between"><span className="text-muted-foreground">KB Version</span><span>{run.kb_version}</span></div>}
        <div className="flex justify-between"><span className="text-muted-foreground">Threshold / Top-k</span><span>{run.retrieval_threshold} / {run.retrieval_count}</span></div>
        <Separator />
        <div className="flex justify-between"><span className="text-muted-foreground">Success Rate</span><span className="font-semibold text-green-700">{successRate.toFixed(1)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Grounding Rate</span><span className="font-semibold text-blue-700">{groundingRate.toFixed(1)}%</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Avg Latency</span><span>{run.avg_latency_ms ? `${Math.round(run.avg_latency_ms)}ms` : '—'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Avg Response</span><span>{run.avg_response_length ? `${Math.round(run.avg_response_length)} chars` : '—'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Unique Sources</span><span>{run.unique_sources_used}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Errors</span><span className={run.error_count > 0 ? 'text-red-600' : ''}>{run.error_count}</span></div>
        <div className="flex justify-between text-muted-foreground text-xs mt-1"><span>Run</span><span>{formatRelativeTime(run.started_at)}</span></div>
        {run.notes && <p className="italic text-muted-foreground border-t pt-1">{run.notes}</p>}
      </CardContent>
    </Card>
  );
}

// ── Expandable prompt comparison row ─────────────────────────────────────────

function PromptCompareRow({ base, comp, isRegression, isImprovement, groundingChanged }: {
  base?: EvalResult;
  comp?: EvalResult;
  isRegression: boolean;
  isImprovement: boolean;
  groundingChanged: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const promptText = base?.prompt_text ?? comp?.prompt_text ?? '';
  const pid = base?.prompt_id ?? comp?.prompt_id ?? '';

  const bgClass = isRegression ? 'border-red-200 bg-red-50/50' : isImprovement ? 'border-green-200 bg-green-50/50' : '';

  return (
    <div className={`border rounded-lg overflow-hidden ${bgClass}`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/20 transition-colors text-left gap-2"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {base?.status === 'success' && comp?.status === 'success'
            ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            : isRegression
            ? <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            : isImprovement
            ? <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
            : <Minus className="h-4 w-4 text-muted-foreground shrink-0" />
          }
          <Badge variant="outline" className="text-xs shrink-0">{base?.category ?? comp?.category}</Badge>
          {isRegression && <Badge className="text-xs bg-red-100 text-red-700 border-red-200">Regression</Badge>}
          {isImprovement && <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Improved</Badge>}
          {groundingChanged && <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">Grounding Δ</Badge>}
          <p className="text-xs text-foreground truncate">{promptText}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs">
          {base?.latency_ms && comp?.latency_ms && (
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {base.latency_ms}→{comp.latency_ms}ms
            </span>
          )}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t p-4 space-y-3">
          <p className="text-xs text-muted-foreground font-medium">{pid}: {promptText}</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Run A response */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">A — Baseline</Badge>
                {base?.grounded_in_sources && <Badge className="text-xs bg-blue-100 text-blue-700">Grounded</Badge>}
                {base?.latency_ms && <span className="text-xs text-muted-foreground">{base.latency_ms}ms</span>}
                {base?.response_length != null && <span className="text-xs text-muted-foreground">{base.response_length} chars</span>}
              </div>
              {base?.status === 'error' ? (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">Error: {base.error_message}</p>
              ) : base?.reply ? (
                <ScrollArea className="h-48 rounded border bg-card p-2">
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{base.reply}</p>
                </ScrollArea>
              ) : (
                <p className="text-xs text-muted-foreground italic">No response</p>
              )}
              {base?.sources && (base.sources as Array<{ title: string }>).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(base.sources as Array<{ title: string; document_id: string }>).map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{s.title ?? s.document_id}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Run B response */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">B — Comparison</Badge>
                {comp?.grounded_in_sources && <Badge className="text-xs bg-blue-100 text-blue-700">Grounded</Badge>}
                {comp?.latency_ms && <span className="text-xs text-muted-foreground">{comp.latency_ms}ms</span>}
                {comp?.response_length != null && <span className="text-xs text-muted-foreground">{comp.response_length} chars</span>}
              </div>
              {comp?.status === 'error' ? (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">Error: {comp.error_message}</p>
              ) : comp?.reply ? (
                <ScrollArea className="h-48 rounded border bg-card p-2">
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{comp.reply}</p>
                </ScrollArea>
              ) : (
                <p className="text-xs text-muted-foreground italic">No matching prompt in this run</p>
              )}
              {comp?.sources && (comp.sources as Array<{ title: string }>).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(comp.sources as Array<{ title: string; document_id: string }>).map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{s.title ?? s.document_id}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AdminEvalCompare() {
  const { user } = useAuth();
  const { data: runs } = useEvalRuns();
  const queryClient = useQueryClient();
  const [baseId, setBaseId] = useState<string | null>(null);
  const [compId, setCompId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  // Load saved comparisons
  const { data: savedComparisons } = useQuery({
    queryKey: ['eval-comparisons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eval_comparisons')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []) as any[];
    },
  });

  const { data: baseResults } = useEvalResults(baseId);
  const { data: compResults } = useEvalResults(compId);

  const baseRun = runs?.find(r => r.id === baseId);
  const compRun = runs?.find(r => r.id === compId);

  // Build prompt-level comparisons
  const allPromptIds = new Set([
    ...(baseResults?.map(r => r.prompt_id) ?? []),
    ...(compResults?.map(r => r.prompt_id) ?? []),
  ]);

  const promptComparisons = Array.from(allPromptIds).map(pid => {
    const base = baseResults?.find(r => r.prompt_id === pid);
    const comp = compResults?.find(r => r.prompt_id === pid);
    const isRegression = base?.status === 'success' && comp?.status === 'error';
    const isImprovement = base?.status === 'error' && comp?.status === 'success';
    const groundingChanged = (base?.grounded_in_sources ?? false) !== (comp?.grounded_in_sources ?? false);
    return { pid, base, comp, isRegression, isImprovement, groundingChanged };
  });

  const regressions = promptComparisons.filter(p => p.isRegression).length;
  const improvements = promptComparisons.filter(p => p.isImprovement).length;
  const groundingChanges = promptComparisons.filter(p => p.groundingChanged).length;

  const completedRuns = runs?.filter(r => r.status === 'completed') ?? [];

  // Save comparison
  const saveComparison = async () => {
    if (!baseId || !compId || !baseRun || !compRun) return;
    setSaving(true);
    try {
      const title = saveTitle.trim() || `${baseRun.model.slice(0, 20)} vs ${compRun.model.slice(0, 20)}`;
      const { error } = await supabase.from('eval_comparisons').insert({
        base_run_id: baseId,
        comp_run_id: compId,
        title,
        notes: saveNotes.trim() || null,
        regressions,
        improvements,
        grounding_changes: groundingChanges,
        created_by: user?.id ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      if (error) throw error;
      toast.success('Comparison saved');
      setSaveTitle('');
      setSaveNotes('');
      setShowSaveForm(false);
      queryClient.invalidateQueries({ queryKey: ['eval-comparisons'] });
    } catch (e) {
      toast.error('Failed to save', { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const deleteComparison = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('eval_comparisons').delete().eq('id', id);
      if (error) throw error;
      toast.success('Comparison deleted');
      queryClient.invalidateQueries({ queryKey: ['eval-comparisons'] });
    } catch (e) {
      toast.error('Failed to delete', { description: (e as Error).message });
    }
  };

  const loadSavedComparison = (comp: { base_run_id: string; comp_run_id: string }) => {
    setBaseId(comp.base_run_id);
    setCompId(comp.comp_run_id);
  };

  // Export comparison as CSV
  const exportComparison = () => {
    if (!baseRun || !compRun) return;
    const rows = [
      ['prompt_id', 'category', 'prompt', 'a_status', 'b_status', 'a_grounded', 'b_grounded', 'a_latency', 'b_latency', 'a_length', 'b_length', 'regression', 'improvement'].join(','),
      ...promptComparisons.map(p => [
        p.pid,
        p.base?.category ?? p.comp?.category ?? '',
        `"${(p.base?.prompt_text ?? p.comp?.prompt_text ?? '').replace(/"/g, '""')}"`,
        p.base?.status ?? 'missing',
        p.comp?.status ?? 'missing',
        p.base?.grounded_in_sources ? 'true' : 'false',
        p.comp?.grounded_in_sources ? 'true' : 'false',
        p.base?.latency_ms ?? '',
        p.comp?.latency_ms ?? '',
        p.base?.response_length ?? '',
        p.comp?.response_length ?? '',
        p.isRegression ? 'YES' : '',
        p.isImprovement ? 'YES' : '',
      ].join(',')),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compare-${baseRun.model.slice(0, 12)}-vs-${compRun.model.slice(0, 12)}.csv`;
    a.click();
  };

  const [filter, setFilter] = useState<'all' | 'regressions' | 'improvements' | 'grounding'>('all');
  const filteredComparisons = promptComparisons.filter(p => {
    if (filter === 'regressions') return p.isRegression;
    if (filter === 'improvements') return p.isImprovement;
    if (filter === 'grounding') return p.groundingChanged;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-primary" />
            Run Comparison
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare two eval runs side by side. Click any prompt row to see full responses.
          </p>
        </div>

        {/* Saved comparisons panel */}
        <Card>
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowSavedList(v => !v)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Saved Comparisons ({savedComparisons?.length ?? 0})
              </CardTitle>
              {showSavedList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          {showSavedList && (
            <CardContent>
              {!savedComparisons || savedComparisons.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No saved comparisons yet. Run a comparison and click Save.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {savedComparisons.map((sc: { id: string; title: string; notes: string | null; base_run_id: string; comp_run_id: string; regressions: number; improvements: number; grounding_changes: number; created_at: string }) => (
                    <div key={sc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/20 transition-colors">
                      <button className="flex-1 text-left" onClick={() => loadSavedComparison(sc)}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium">{sc.title}</span>
                          <div className="flex gap-1.5 text-xs">
                            {sc.regressions > 0 && <Badge variant="destructive" className="text-xs h-5">{sc.regressions}↓</Badge>}
                            {sc.improvements > 0 && <Badge className="text-xs h-5 bg-green-100 text-green-700 border-green-200">{sc.improvements}↑</Badge>}
                            {sc.grounding_changes > 0 && <Badge className="text-xs h-5 bg-amber-100 text-amber-700 border-amber-200">{sc.grounding_changes} Δ</Badge>}
                          </div>
                        </div>
                        {sc.notes && <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-1">{sc.notes}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">{formatRelativeTime(sc.created_at)}</p>
                      </button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteComparison(sc.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

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
                    {r.suite_name} · {r.model} · {r.success_count}/{r.total_prompts} · {formatRelativeTime(r.started_at)}
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
                    {r.suite_name} · {r.model} · {r.success_count}/{r.total_prompts} · {formatRelativeTime(r.started_at)}
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
                <CardTitle className="text-base">Configuration Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  {[
                    { label: 'Model', a: baseRun.model, b: compRun.model },
                    { label: 'Prompt Version', a: `v${baseRun.prompt_version}`, b: `v${compRun.prompt_version}` },
                    { label: 'KB Version', a: baseRun.kb_version ?? '—', b: compRun.kb_version ?? '—' },
                    { label: 'Threshold', a: String(baseRun.retrieval_threshold), b: String(compRun.retrieval_threshold) },
                    { label: 'Top-k', a: String(baseRun.retrieval_count), b: String(compRun.retrieval_count) },
                  ].map(({ label, a, b }) => (
                    <div key={label} className="flex items-center justify-between py-1 border-b last:border-0">
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Metric Deltas (B vs A)</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={saveComparison} disabled={saving} className="gap-1 text-xs">
                      <Save className="h-3.5 w-3.5" />{saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportComparison} className="gap-1 text-xs">
                      <Download className="h-3.5 w-3.5" />Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
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
                      label: 'Avg Latency',
                      base: baseRun.avg_latency_ms,
                      comp: compRun.avg_latency_ms,
                      unit: 'ms', higherIsBetter: false, format: (v: number) => Math.round(v).toString(),
                    },
                    {
                      label: 'Avg Response Length',
                      base: baseRun.avg_response_length,
                      comp: compRun.avg_response_length,
                      unit: ' chars', higherIsBetter: true, format: (v: number) => Math.round(v).toString(),
                    },
                    {
                      label: 'Unique Sources',
                      base: baseRun.unique_sources_used,
                      comp: compRun.unique_sources_used,
                      unit: '', higherIsBetter: true, format: (v: number) => Math.round(v).toString(),
                    },
                    {
                      label: 'Error Count',
                      base: baseRun.error_count,
                      comp: compRun.error_count,
                      unit: '', higherIsBetter: false, format: (v: number) => Math.round(Math.abs(v)).toString(),
                    },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">{m.label}</span>
                      <Delta base={m.base} comp={m.comp} unit={m.unit} higherIsBetter={m.higherIsBetter} format={m.format} />
                    </div>
                  ))}
                </div>

                {(regressions > 0 || improvements > 0 || groundingChanges > 0) && (
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
                    {groundingChanges > 0 && (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-600">{groundingChanges} grounding change{groundingChanges > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Per-prompt comparison */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Per-Prompt Comparison ({filteredComparisons.length})</CardTitle>
                  <div className="flex items-center gap-1">
                    {(['all', 'regressions', 'improvements', 'grounding'] as const).map(f => (
                      <Button
                        key={f}
                        variant={filter === f ? 'default' : 'ghost'}
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setFilter(f)}
                      >
                        {f === 'all' ? `All (${promptComparisons.length})` :
                         f === 'regressions' ? `Regressions (${regressions})` :
                         f === 'improvements' ? `Improved (${improvements})` :
                         `Grounding Δ (${groundingChanges})`}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredComparisons.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No prompts match this filter</p>
                  ) : (
                    filteredComparisons.map(({ pid, base, comp, isRegression, isImprovement, groundingChanged }) => (
                      <PromptCompareRow
                        key={pid}
                        base={base}
                        comp={comp}
                        isRegression={isRegression}
                        isImprovement={isImprovement}
                        groundingChanged={groundingChanged}
                      />
                    ))
                  )}
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
              {completedRuns.length < 2 && (
                <p className="text-xs mt-1">You need at least 2 completed runs. Currently: {completedRuns.length}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
