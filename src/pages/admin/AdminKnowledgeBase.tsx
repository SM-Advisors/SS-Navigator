import { useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useKBDocuments, useDeleteKBDocument, useIngestDocument } from '@/hooks/useKnowledgeBase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Upload, FileText, RefreshCw, Database, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

const RESOURCE_TYPES = ['financial', 'medical', 'emotional', 'practical', 'legal', 'educational', 'navigation', 'survivorship', 'sibling_support', 'community'];

export default function AdminKnowledgeBase() {
  const { data: documents, isLoading } = useKBDocuments();
  const deleteDoc = useDeleteKBDocument();
  const ingestDoc = useIngestDocument();
  const [open, setOpen] = useState(false);
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
              Manage documents ingested into the RAG knowledge base. Documents are chunked into ~600-word segments with 100-word overlap and embedded via text-embedding-3-small.
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
                  <p className="text-xs text-muted-foreground mt-2">Or paste content directly below. PDF/DOCX text must be extracted first.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Document ID *</Label>
                    <Input placeholder="e.g. ssf-program-guide" value={form.document_id} onChange={e => setForm(f => ({ ...f, document_id: e.target.value }))} />
                    <p className="text-xs text-muted-foreground mt-1">Unique slug for this document</p>
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
                  {ingestDoc.isPending ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Ingesting...</> : 'Ingest & Embed'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-foreground">{documents?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-foreground">{documents?.reduce((acc, d) => acc + d.chunk_count, 0) ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total Chunks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-foreground">{new Set(documents?.map(d => d.program).filter(Boolean)).size ?? 0}</p>
              <p className="text-xs text-muted-foreground">Programs</p>
            </CardContent>
          </Card>
        </div>

        {/* Document list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingested Documents</CardTitle>
            <CardDescription>text-embedding-3-small · 600-word chunks · 100-word overlap</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
            ) : !documents?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No documents ingested yet.</p>
                <p className="text-xs mt-1">Click "Ingest Document" to add your first knowledge base entry.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.document_id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">{doc.document_title}</p>
                        <Badge variant="outline" className="text-xs">{doc.chunk_count} chunks</Badge>
                        {doc.program && <Badge variant="secondary" className="text-xs">{doc.program}</Badge>}
                        {doc.resource_type && <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{doc.resource_type}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-muted-foreground font-mono">{doc.document_id}</p>
                        {doc.source_url && (
                          <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
                            <ExternalLink className="h-3 w-3" />source
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground">Updated {formatRelativeTime(doc.updated_at)}</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{doc.document_title}"?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete all {doc.chunk_count} chunks for this document. This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteDoc.mutate(doc.document_id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
