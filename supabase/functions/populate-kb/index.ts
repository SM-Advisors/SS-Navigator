import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 50; // embeddings per OpenAI call

async function batchEmbed(texts: string[], apiKey: string): Promise<number[][]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: texts }),
  });
  if (!res.ok) throw new Error(`Embedding error: ${await res.text()}`);
  const data = await res.json();
  return data.data
    .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
    .map((d: { embedding: number[] }) => d.embedding);
}

function buildContent(r: Record<string, unknown>): string {
  const parts: string[] = [];
  parts.push(`Title: ${r.title}`);
  parts.push(`Organization: ${r.organization_name}`);
  parts.push(`Category: ${r.category}`);
  if (r.description) parts.push(`Description: ${r.description}`);
  if (r.long_description) parts.push(`Details: ${r.long_description}`);
  if (r.organization_url) parts.push(`Website: ${r.organization_url}`);
  if (r.organization_phone) parts.push(`Phone: ${r.organization_phone}`);
  if (r.organization_email) parts.push(`Email: ${r.organization_email}`);
  if (r.application_url) parts.push(`Application: ${r.application_url}`);
  const states = r.applicable_states as string[] | null;
  if (states && states.length > 0) parts.push(`States: ${states.join(', ')}`);
  const stages = r.applicable_stages as string[] | null;
  if (stages && stages.length > 0) parts.push(`Treatment stages: ${stages.join(', ')}`);
  const tags = r.tags as string[] | null;
  if (tags && tags.length > 0) parts.push(`Tags: ${tags.join(', ')}`);
  if (r.subcategory) parts.push(`Subcategory: ${r.subcategory}`);
  return parts.join('\n');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Check how many already exist
    const { count: existingCount } = await supabase
      .from('knowledge_base')
      .select('id', { count: 'exact', head: true });

    // Fetch all active resources (paginate past 1000 limit)
    let allResources: Record<string, unknown>[] = [];
    let offset = 0;
    const pageSize = 500;
    while (true) {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .range(offset, offset + pageSize - 1)
        .order('id');
      if (error) throw error;
      if (!data || data.length === 0) break;
      allResources = allResources.concat(data);
      if (data.length < pageSize) break;
      offset += pageSize;
    }

    // Build text content and document metadata for each resource
    const items = allResources.map((r) => ({
      document_id: `resource-${r.id}`,
      document_title: r.title as string,
      content: buildContent(r),
      program: (r.organization_name as string) || null,
      resource_type: (r.subcategory as string) || null,
      category: r.category as string,
      source_url: (r.organization_url as string) || null,
      applicable_states: (r.applicable_states as string[]) || [],
      tags: (r.tags as string[]) || [],
    }));

    // Delete old resource-based KB entries
    await supabase
      .from('knowledge_base')
      .delete()
      .like('document_id', 'resource-%');

    let inserted = 0;

    // Process in batches
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      const texts = batch.map((b) => b.content);

      let embeddings: number[][];
      try {
        embeddings = await batchEmbed(texts, openaiKey);
      } catch (e) {
        console.error(`Embedding batch ${i} failed:`, e);
        continue;
      }

      const rows = batch.map((item, idx) => ({
        document_id: item.document_id,
        document_title: item.document_title,
        content: item.content,
        chunk_index: 0,
        program: item.program,
        resource_type: item.resource_type,
        category: item.category,
        source_url: item.source_url,
        applicable_states: item.applicable_states,
        tags: item.tags,
        embedding: `[${embeddings[idx].join(',')}]`,
      }));

      const { error: insertErr } = await supabase
        .from('knowledge_base')
        .insert(rows);

      if (insertErr) {
        console.error(`Insert batch ${i} failed:`, insertErr);
        continue;
      }
      inserted += rows.length;
    }

    return new Response(JSON.stringify({
      success: true,
      total_resources: allResources.length,
      chunks_created: inserted,
      previous_kb_count: existingCount ?? 0,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('populate-kb error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
