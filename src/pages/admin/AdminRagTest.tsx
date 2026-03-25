import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { FlaskConical, Play, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface RAGTestResult {
  reply: string;
  suggestedPrompts: string[];
  sources: Array<{ title: string; document_id: string; program?: string }>;
  groundedInSources: boolean;
  retrievedChunks: Array<{
    id: string; document_title: string; chunk_index: number;
    content: string; similarity: number; program?: string | null;
    resource_type?: string | null; category?: string | null;
  }>;
  latency_ms: number;
  crisisDetected?: boolean;
}

const QUICK_PROMPTS = [
  "A newly diagnosed family doesn't know what support programs they qualify for. Where do we start?",
  "We got a denial letter. What's the first thing I should read?",
  "How long do we have to file an internal appeal after a denial?",
  "The oncologist wants to start treatment but prior auth hasn't come back. What can we do?",
  "What financial assistance programs exist for families during treatment?",
];

export default function AdminRagTest() {
  const [prompt, setPrompt] = useState('');
  const [threshold, setThreshold] = useState('0.5');
  const [retrievalCount, setRetrievalCount] = useState('8');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RAGTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showChunks, setShowChunks] = useState(false);

  const runTest = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/navigator-chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            message: prompt,
            retrieval_threshold: parseFloat(threshold),
            retrieval_count: parseInt(retrievalCount),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
      toast.error('Test failed', { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            RAG Test Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Single-prompt RAG debugging. Test retrieval quality and response grounding in real-time.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Input panel */}
          <div className="col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Query</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Enter a navigator question to test..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={5}
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) runTest(); }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Similarity threshold</Label>
                    <Input type="number" min="0" max="1" step="0.05" value={threshold} onChange={e => setThreshold(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Top-k chunks</Label>
                    <Input type="number" min="1" max="20" value={retrievalCount} onChange={e => setRetrievalCount(e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
                <Button onClick={runTest} disabled={loading || !prompt.trim()} className="w-full gap-2">
                  {loading ? <><Clock className="h-4 w-4 animate-spin" />Running...</> : <><Play className="h-4 w-4" />Run Test</>}
                </Button>
              </CardContent>
            </Card>

            {/* Quick prompts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Quick Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-3 pt-0">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => setPrompt(p)} className="w-full text-left text-xs p-2 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground leading-tight">
                    {p}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Result panel */}
          <div className="col-span-2 space-y-4">
            {error && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="pt-4 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <>
                {/* Metrics bar */}
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />{result.latency_ms}ms
                  </Badge>
                  <Badge variant={result.groundedInSources ? 'default' : 'secondary'} className="gap-1">
                    {result.groundedInSources ? <CheckCircle2 className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                    {result.groundedInSources ? 'Grounded in KB' : 'General knowledge'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {result.retrievedChunks.length} chunks retrieved
                  </Badge>
                  {result.sources.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      {result.sources.length} sources cited
                    </Badge>
                  )}
                  {result.crisisDetected && (
                    <Badge variant="destructive">Crisis detected</Badge>
                  )}
                </div>

                {/* Response */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 text-foreground">
                      <ReactMarkdown>{result.reply}</ReactMarkdown>
                    </div>
                    {result.suggestedPrompts?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {result.suggestedPrompts.map(sp => (
                          <button key={sp} onClick={() => setPrompt(sp)} className="text-xs bg-primary/5 hover:bg-primary/10 text-primary rounded-full px-3 py-1 border border-primary/20 transition-colors">
                            {sp}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sources */}
                {result.sources.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Cited Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1.5">
                        {result.sources.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs shrink-0">{i + 1}</Badge>
                            <span className="font-medium text-foreground">{s.title}</span>
                            {s.program && <Badge variant="secondary" className="text-xs">{s.program}</Badge>}
                            <span className="text-xs text-muted-foreground font-mono">{s.document_id}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Retrieved chunks */}
                <Card>
                  <CardHeader className="pb-2">
                    <button className="flex items-center justify-between w-full" onClick={() => setShowChunks(v => !v)}>
                      <CardTitle className="text-sm">Retrieved Chunks ({result.retrievedChunks.length})</CardTitle>
                      {showChunks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </CardHeader>
                  {showChunks && (
                    <CardContent className="space-y-3">
                      {result.retrievedChunks.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No chunks retrieved — knowledge base may be empty or threshold too high.</p>
                      ) : (
                        result.retrievedChunks.map((chunk, i) => (
                          <div key={chunk.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="text-xs" variant="outline">#{i + 1}</Badge>
                              <span className="text-xs font-medium text-foreground">{chunk.document_title}</span>
                              <Badge variant="secondary" className="text-xs font-mono">
                                sim: {chunk.similarity?.toFixed(3)}
                              </Badge>
                              {chunk.program && <Badge variant="outline" className="text-xs">{chunk.program}</Badge>}
                              {chunk.resource_type && <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{chunk.resource_type}</Badge>}
                              <span className="text-xs text-muted-foreground">chunk [{chunk.chunk_index}]</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{chunk.content}</p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  )}
                </Card>
              </>
            )}

            {!result && !loading && !error && (
              <div className="flex items-center justify-center h-48 border-2 border-dashed border-border rounded-lg">
                <div className="text-center text-muted-foreground">
                  <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Enter a prompt and click Run Test</p>
                  <p className="text-xs mt-1">Results will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
