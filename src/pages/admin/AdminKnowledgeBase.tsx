import { useState, useRef, useCallback } from 'react';
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
import { Trash2, Upload, FileText, RefreshCw, Database, ExternalLink, Search, Tag, Download } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const RESOURCE_TYPES = ['financial', 'medical', 'emotional', 'practical', 'legal', 'educational', 'navigation', 'survivorship', 'sibling_support', 'community'];

function ChunkViewer({ documentId }: { documentId: string }) {
  const { data: chunks, isLoading } = useKBChunks(documentId);

  if (isLoading) return <p className="text-xs text-muted-foreground py-2">Loading chunks...</p>;
  if (!chunks?.length) return <p className="text-xs text-muted-foreground py-2">No chunks found.</p>;

  return (
    <ScrollArea className="max-h-80">
      <div className="space-y-2 pr-3">
        {chunks.map((chunk) => (
          <div key={chunk.id} className="border rounded-lg p-3 bg-muted/30">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-xs font-mono">#{chunk.chunk_index}</Badge>
              {chunk.program && <Badge variant="secondary" className="text-xs">{chunk.program}</Badge>}
              {chunk.category && <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{chunk.category}</Badge>}
            </div>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap line-clamp-6">{chunk.content}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export default function AdminKnowledgeBase() {
  const { data: documents, isLoading } = useKBDocuments();
  const deleteDoc = useDeleteKBDocument();
  const ingestDoc = useIngestDocument();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
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
