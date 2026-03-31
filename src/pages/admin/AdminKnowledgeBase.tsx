import { useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useKBDocuments, useKBChunks, useDeleteKBDocument, useIngestDocument } from '@/hooks/useKnowledgeBase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, Upload, FileText, RefreshCw, Database, ExternalLink, Search, Tag, Download, ChevronDown, ChevronRight, Copy, Globe, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const RESOURCE_TYPES = ['financial', 'medical', 'emotional', 'practical', 'legal', 'educational', 'navigation', 'survivorship', 'sibling_support', 'community'];

function ChunkDetail({ chunk }: { chunk: ReturnType<typeof useKBChunks>['data'] extends (infer T)[] | undefined ? T : never }) {
  const [expanded, setExpanded] = useState(false);

  if (!chunk) return null;

  const wordCount = chunk.content.split(/\s+/).length;
  const charCount = chunk.content.length;

  return (
    <div className="border rounded-lg bg-muted/30 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="mt-0.5 shrink-0">
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className="text-xs font-mono">#{chunk.chunk_index}</Badge>
            {chunk.program && <Badge variant="secondary" className="text-xs">{chunk.program}</Badge>}
            {chunk.category && <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{chunk.category}</Badge>}
            {chunk.resource_type && <Badge variant="outline" className="text-xs">{chunk.resource_type}</Badge>}
            <span className="text-xs text-muted-foreground ml-auto">{wordCount} words · {charCount} chars</span>
          </div>
          <p className={`text-xs text-foreground leading-relaxed whitespace-pre-wrap ${expanded ? '' : 'line-clamp-2'}`}>
            {chunk.content}
          </p>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
          {/* Full content */}
          <div className="relative">
            <div className="bg-background rounded border p-3 text-xs text-foreground leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto font-mono">
              {chunk.content}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(chunk.content);
                toast.success('Chunk content copied');
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-background rounded border px-2 py-1.5">
              <span className="text-muted-foreground block">Chunk ID</span>
              <span className="font-mono text-foreground break-all">{chunk.id.slice(0, 12)}…</span>
            </div>
            <div className="bg-background rounded border px-2 py-1.5">
              <span className="text-muted-foreground block">Document</span>
              <span className="font-mono text-foreground truncate block">{chunk.document_id}</span>
            </div>
            {chunk.source_url && (
              <div className="bg-background rounded border px-2 py-1.5">
                <span className="text-muted-foreground block">Source</span>
                <a href={chunk.source_url} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1 hover:underline truncate">
                  <Globe className="h-3 w-3 shrink-0" />{new URL(chunk.source_url).hostname}
                </a>
              </div>
            )}
            {chunk.created_at && (
              <div className="bg-background rounded border px-2 py-1.5">
                <span className="text-muted-foreground block">Created</span>
                <span className="text-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(chunk.created_at)}</span>
              </div>
            )}
            {chunk.updated_at && (
              <div className="bg-background rounded border px-2 py-1.5">
                <span className="text-muted-foreground block">Updated</span>
                <span className="text-foreground">{formatRelativeTime(chunk.updated_at)}</span>
              </div>
            )}
          </div>

          {/* Tags & States */}
          {(chunk.tags?.length || chunk.applicable_states?.length) ? (
            <div className="flex flex-wrap gap-1">
              {chunk.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
              {chunk.applicable_states?.map(state => (
                <Badge key={state} variant="secondary" className="text-xs">{state}</Badge>
              ))}
            </div>
          ) : null}

          {/* Raw metadata */}
          {chunk.metadata && Object.keys(chunk.metadata).length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Raw metadata</summary>
              <pre className="bg-background border rounded p-2 mt-1 overflow-x-auto text-xs font-mono max-h-40 overflow-y-auto">
                {JSON.stringify(chunk.metadata, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function ChunkViewer({ documentId }: { documentId: string }) {
  const { data: chunks, isLoading } = useKBChunks(documentId);

  if (isLoading) return <p className="text-xs text-muted-foreground py-2">Loading chunks...</p>;
  if (!chunks?.length) return <p className="text-xs text-muted-foreground py-2">No chunks found.</p>;

  const totalWords = chunks.reduce((acc, c) => acc + c.content.split(/\s+/).length, 0);
  const totalChars = chunks.reduce((acc, c) => acc + c.content.length, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs text-muted-foreground pb-1">
        <span>{chunks.length} chunks</span>
        <Separator orientation="vertical" className="h-3" />
        <span>{totalWords.toLocaleString()} total words</span>
        <Separator orientation="vertical" className="h-3" />
        <span>{totalChars.toLocaleString()} total chars</span>
      </div>
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {chunks.map((chunk) => (
          <ChunkDetail key={chunk.id} chunk={chunk} />
        ))}
      </div>
    </div>
  );
}

export default function AdminKnowledgeBase() {
  const { data: documents, isLoading } = useKBDocuments();
  const deleteDoc = useDeleteKBDocument();
  const ingestDoc = useIngestDocument();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState({
    document_id: '',
    document_title: '',
    content: '',
    program: '',
    resource_type: '',
    category: '',
    source_url: '',
    tags: '',
    replace_existing: true,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const exportCSV = async () => {
    setExporting(true);
    try {
      // Paginate to get all rows (Supabase default limit is 1000)
      const allRows: Record<string, unknown>[] = [];
      const PAGE = 1000;
      let from = 0;
      let done = false;
      while (!done) {
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('document_id, document_title, chunk_index, content, program, resource_type, category, source_url, applicable_states, tags, created_at, updated_at')
          .order('document_id')
          .order('chunk_index')
          .range(from, from + PAGE - 1);
        if (error) throw error;
        allRows.push(...(data ?? []));
        done = (data?.length ?? 0) < PAGE;
        from += PAGE;
      }

      if (!allRows.length) {
        toast.info('No data to export');
        return;
      }

      const headers = [
        'document_id', 'document_title', 'chunk_index', 'content',
        'program', 'resource_type', 'category', 'source_url',
        'applicable_states', 'tags', 'created_at', 'updated_at',
      ];

      const escapeCSV = (val: unknown) => {
        const s = Array.isArray(val) ? val.join('; ') : String(val ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const csv = [
        headers.join(','),
        ...allRows.map(row => headers.map(h => escapeCSV(row[h])).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-base-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${allRows.length} rows`);
    } catch (e) {
      toast.error('Export failed', { description: (e as Error).message });
    } finally {
      setExporting(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setForm(f => ({
      ...f,
      content: text,
      document_title: f.document_title || file.name.replace(/\.[^.]+$/, ''),
      document_id: f.document_id || file.name.replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
    }));
    toast.success(`Loaded ${file.name} (${Math.round(text.length / 1000)}K chars)`);
  };

  const handleSubmit = async () => {
    if (!form.document_id || !form.document_title || !form.content) {
      toast.error('document_id, document_title, and content are required');
      return;
    }
    await ingestDoc.mutateAsync({
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    setOpen(false);
    setForm({ document_id: '', document_title: '', content: '', program: '', resource_type: '', category: '', source_url: '', tags: '', replace_existing: true });
  };

  // Filter and search documents
  const filteredDocs = documents?.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.document_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.document_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.program?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || doc.resource_type === filterType;
    return matchesSearch && matchesType;
  }) ?? [];

  // Compute category breakdown
  const categoryBreakdown = documents?.reduce((acc, doc) => {
    const cat = doc.resource_type || 'uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  const totalChunks = documents?.reduce((acc, d) => acc + d.chunk_count, 0) ?? 0;
  const uniquePrograms = new Set(documents?.map(d => d.program).filter(Boolean)).size;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Knowledge Base
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {documents?.length ?? 0} documents · {totalChunks} chunks · FTS indexed
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={exportCSV} disabled={exporting}>
              {exporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export CSV
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Upload className="h-4 w-4" />Ingest Document</Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ingest New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input ref={fileRef} type="file" accept=".txt,.md,.markdown" className="hidden" onChange={handleFile} />
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
                    <FileText className="h-4 w-4" />Load from file (.txt/.md)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Or paste content directly below.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Document ID *</Label>
                    <Input placeholder="e.g. ssf-program-guide" value={form.document_id} onChange={e => setForm(f => ({ ...f, document_id: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Document Title *</Label>
                    <Input placeholder="e.g. SSF Program Guide 2024" value={form.document_title} onChange={e => setForm(f => ({ ...f, document_title: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Content *</Label>
                  <Textarea placeholder="Paste document text here..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="font-mono text-xs" />
                  {form.content && <p className="text-xs text-muted-foreground mt-1">~{Math.round(form.content.split(/\s+/).length)} words → ~{Math.ceil(form.content.split(/\s+/).length / 500)} chunks</p>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Program</Label>
                    <Input placeholder="e.g. Sebastian Strong" value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Resource Type</Label>
                    <Select value={form.resource_type} onValueChange={v => setForm(f => ({ ...f, resource_type: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {RESOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input placeholder="e.g. insurance" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Source URL</Label>
                    <Input placeholder="https://..." value={form.source_url} onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input placeholder="e.g. grants, financial-aid" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" id="replace" checked={form.replace_existing} onChange={e => setForm(f => ({ ...f, replace_existing: e.target.checked }))} />
                  <Label htmlFor="replace" className="cursor-pointer">Replace existing chunks for this document_id</Label>
                </div>
                <Button onClick={handleSubmit} disabled={ingestDoc.isPending} className="w-full">
                  {ingestDoc.isPending ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Ingesting...</> : 'Ingest & Index'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-foreground">{documents?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-foreground">{totalChunks}</p>
              <p className="text-xs text-muted-foreground">Total Chunks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-foreground">{uniquePrograms}</p>
              <p className="text-xs text-muted-foreground">Programs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-foreground">{Object.keys(categoryBreakdown).length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Category breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setFilterType(filterType === cat ? 'all' : cat)}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    filterType === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  {cat} <span className="font-mono">{count}</span>
                </button>
              ))}
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by title, ID, or program..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {(searchQuery || filterType !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setFilterType('all'); }}>
              Clear
            </Button>
          )}
        </div>

        {/* Document list with expandable chunks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {filteredDocs.length === documents?.length
                ? `All Documents (${filteredDocs.length})`
                : `Filtered: ${filteredDocs.length} of ${documents?.length ?? 0}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
            ) : !filteredDocs.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{documents?.length ? 'No documents match your filter.' : 'No documents ingested yet.'}</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-1">
                {filteredDocs.map(doc => (
                  <AccordionItem key={doc.document_id} value={doc.document_id} className="border rounded-lg px-3 data-[state=open]:bg-muted/20">
                    <div className="flex items-center gap-2">
                      <AccordionTrigger className="flex-1 py-3 hover:no-underline">
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground truncate">{doc.document_title}</span>
                            <Badge variant="outline" className="text-xs shrink-0">{doc.chunk_count} chunks</Badge>
                            {doc.program && <Badge variant="secondary" className="text-xs shrink-0">{doc.program}</Badge>}
                            {doc.resource_type && <Badge className="text-xs bg-primary/10 text-primary border-primary/20 shrink-0">{doc.resource_type}</Badge>}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground font-mono">{doc.document_id}</span>
                            {doc.source_url && (
                              <a
                                href={doc.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary flex items-center gap-0.5 hover:underline"
                                onClick={e => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />source
                              </a>
                            )}
                            <span className="text-xs text-muted-foreground">{formatRelativeTime(doc.updated_at)}</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{doc.document_title}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete all {doc.chunk_count} chunks. This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteDoc.mutate(doc.document_id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <AccordionContent className="pb-3">
                      <ChunkViewer documentId={doc.document_id} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
