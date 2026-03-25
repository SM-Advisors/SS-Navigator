import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useEvalRuns, useEvalResults, useRunEval, EvalRun, EvalResult } from '@/hooks/useEval';
import { ALL_SUITES } from '@/data/eval-prompts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Play, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Download, RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

const MODELS = [
  'claude-sonnet-4-5-20250929',
  'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307',
];

function RunStatusBadge({ status }: { status: EvalRun['status'] }) {
  if (status === 'completed') return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
  if (status === 'running') return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
  return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
}

function MetricDelta({ val, format = (v: number) => v.toFixed(1) }: { val: number; format?: (v: number) => string }) {
  if (Math.abs(val) < 0.001) return <span className="text-muted-foreground text-xs">±0</span>;
  const color = val > 0 ? 'text-green-600' : 'text-red-600';
  return <span className={`text-xs font-mono ${color}`}>{val > 0 ? '+' : ''}{format(val)}</span>;
}

function RunRow({ run, selected, onSelect }: { run: EvalRun; selected: boolean; onSelect: () => void }) {
  const successRate = run.total_prompts > 0 ? (run.success_count / run.total_prompts) * 100 : 0;
  const groundingRate = run.success_count > 0 ? (run.grounded_count / run.success_count) * 100 : 0;

  return (
    <div
      onClick={onSelect}
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${selected ? 'border-primary bg-primary/5' : 'hover:bg-accent/30'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-semibold text-foreground truncate">{run.suite_name}</p>
            <RunStatusBadge status={run.status} />
            <Badge variant="outline" className="text-xs font-mono">{run.model.split('-').slice(-2).join('-')}</Badge>
            <Badge variant="outline" className="text-xs">v{run.prompt_version}</Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span>{run.total_prompts} prompts</span>
            <span className="text-green-600 font-medium">{successRate.toFixed(0)}% success</span>
            <span className="text-blue-600">{groundingRate.toFixed(0)}% grounded</span>
            {run.avg_latency_ms && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{Math.round(run.avg_latency_ms)}ms avg</span>}
            {run.kb_version && <span>KB: {run.kb_version}</span>}
            <span>{formatRelativeTime(run.started_at)}</span>
          </div>
          {run.notes && <p className="text-xs text-muted-foreground italic mt-1 truncate">{run.notes}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-mono text-muted-foreground">{run.success_count}/{run.total_prompts}</p>
          {run.error_count > 0 && <p className="text-xs text-red-600">{run.error_count} errors</p>}
        </div>
      </div>
    </div>
  );
}

function ResultRow({ result }: { result: EvalResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {result.status === 'success'
            ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            : <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          }
          <Badge variant="outline" className="text-xs shrink-0">{result.category}</Badge>
          <p className="text-xs text-foreground truncate">{result.prompt_text}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {result.grounded_in_sources && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Grounded</Badge>}
          {result.latency_ms && <span className="text-xs text-muted-foreground">{result.latency_ms}ms</span>}
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="border-t p-3 bg-accent/10 space-y-2">
          {result.status === 'error' ? (
            <p className="text-sm text-red-600">Error: {result.error_message}</p>
          ) : (
            <>
              <p className="text-sm text-foreground leading-relaxed">{result.reply}</p>
              {(result.sources as Array<{ title: string; document_id: string }>)?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(result.sources as Array<{ title: string; document_id: string }>).map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{s.title ?? s.document_id}</Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{result.response_length} chars</span>
                <span>{(result.retrieved_chunks as unknown[])?.length ?? 0} chunks retrieved</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminEval() {
  const { data: runs, isLoading: runsLoading } = useEvalRuns();
  const runEval = useRunEval();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { data: results, isLoading: resultsLoading } = useEvalResults(selectedRunId);
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState({
    suite_id: ALL_SUITES[0].id,
    model: MODELS[0],
    prompt_version: 'v1',
    kb_version: '',
    retrieval_threshold: '0.5',
    retrieval_count: '8',
    notes: '',
  });

  const selectedRun = runs?.find(r => r.id === selectedRunId);

  const startRun = async () => {
    const suite = ALL_SUITES.find(s => s.id === config.suite_id);
    if (!suite) return;
    setConfigOpen(false);
    const runId = await runEval.mutateAsync({
      suite,
      model: config.model,
      prompt_version: config.prompt_version,
      kb_version: config.kb_version || undefined,
      retrieval_threshold: parseFloat(config.retrieval_threshold),
      retrieval_count: parseInt(config.retrieval_count),
      notes: config.notes || undefined,
    });
    if (runId) setSelectedRunId(runId as string);
  };

  const exportCSV = () => {
    if (!results) return;
    const rows = [
      ['prompt_id', 'category', 'prompt', 'status', 'grounded', 'latency_ms', 'response_length', 'reply'].join(','),
      ...results.map(r => [
        r.prompt_id, r.category,
        `"${r.prompt_text.replace(/"/g, '""')}"`,
        r.status, r.grounded_in_sources ? 'true' : 'false',
        r.latency_ms ?? '', r.response_length ?? '',
        `"${(r.reply ?? '').replace(/"/g, '""').slice(0, 200)}"`,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eval-run-${selectedRunId?.slice(0, 8)}.csv`;
    a.click();
  };

  const categoryGroups = results
    ? Array.from(new Set(results.map(r => r.category))).map(cat => ({
        category: cat,
        results: results.filter(r => r.category === cat),
      }))
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Eval Harness
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Batch evaluation across {ALL_SUITES[0].prompts.length} SS Navigator prompts. Each run stores full metadata for reproducibility.
            </p>
          </div>
          <Dialog open={configOpen} onOpenChange={setConfigOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Play className="h-4 w-4" />New Eval Run</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Configure Eval Run</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Prompt Suite</Label>
                  <Select value={config.suite_id} onValueChange={v => setConfig(c => ({ ...c, suite_id: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALL_SUITES.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.prompts.length} prompts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Model</Label>
                  <Select value={config.model} onValueChange={v => setConfig(c => ({ ...c, model: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Prompt Version</Label>
                    <Input value={config.prompt_version} onChange={e => setConfig(c => ({ ...c, prompt_version: e.target.value }))} placeholder="v1" />
                  </div>
                  <div>
                    <Label>KB Version / Label</Label>
                    <Input value={config.kb_version} onChange={e => setConfig(c => ({ ...c, kb_version: e.target.value }))} placeholder="e.g. 2025-01-baseline" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Similarity Threshold</Label>
                    <Input type="number" min="0" max="1" step="0.05" value={config.retrieval_threshold} onChange={e => setConfig(c => ({ ...c, retrieval_threshold: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Top-k Chunks</Label>
                    <Input type="number" min="1" max="20" value={config.retrieval_count} onChange={e => setConfig(c => ({ ...c, retrieval_count: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea value={config.notes} onChange={e => setConfig(c => ({ ...c, notes: e.target.value }))} placeholder="e.g. Testing after adding insurance guide to KB" rows={2} />
                </div>
                <Button onClick={startRun} disabled={runEval.isPending} className="w-full">
                  {runEval.isPending ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Running...</> : 'Start Eval Run'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Run list */}
          <div className="col-span-4 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">History</h2>
            {runsLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : !runs?.length ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No eval runs yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {runs.map(run => (
                  <RunRow key={run.id} run={run} selected={selectedRunId === run.id} onSelect={() => setSelectedRunId(run.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Run detail */}
          <div className="col-span-8 space-y-4">
            {!selectedRun ? (
              <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
                <p className="text-sm">Select a run to view results</p>
              </div>
            ) : (
              <>
                {/* Run summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{selectedRun.suite_name}</CardTitle>
                        <CardDescription className="mt-1">
                          {selectedRun.model} · v{selectedRun.prompt_version}
                          {selectedRun.kb_version && ` · KB: ${selectedRun.kb_version}`}
                          {selectedRun.notes && ` · ${selectedRun.notes}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <RunStatusBadge status={selectedRun.status} />
                        {selectedRun.status === 'completed' && (
                          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1 text-xs">
                            <Download className="h-3.5 w-3.5" />CSV
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: 'Success Rate', value: selectedRun.total_prompts > 0 ? `${((selectedRun.success_count / selectedRun.total_prompts) * 100).toFixed(0)}%` : '—' },
                        { label: 'Grounding Rate', value: selectedRun.success_count > 0 ? `${((selectedRun.grounded_count / selectedRun.success_count) * 100).toFixed(0)}%` : '—' },
                        { label: 'Avg Latency', value: selectedRun.avg_latency_ms ? `${Math.round(selectedRun.avg_latency_ms)}ms` : '—' },
                        { label: 'Unique Sources', value: selectedRun.unique_sources_used ?? 0 },
                      ].map(m => (
                        <div key={m.label} className="text-center">
                          <p className="text-xl font-bold text-foreground">{m.value}</p>
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    {selectedRun.status === 'running' && results && (
                      <div className="mt-3">
                        <Progress value={(results.length / selectedRun.total_prompts) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{results.length} / {selectedRun.total_prompts} prompts completed</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Results by category */}
                {resultsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading results...</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {categoryGroups.map(group => (
                      <div key={group.category}>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-foreground">{group.category}</h3>
                          <Badge variant="outline" className="text-xs">{group.results.filter(r => r.status === 'success').length}/{group.results.length}</Badge>
                        </div>
                        <div className="space-y-1.5">
                          {group.results.map(r => <ResultRow key={r.id} result={r} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
