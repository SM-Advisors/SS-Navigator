import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 50;

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

    const supabase = createClient(supabaseUrl, serviceKey);

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

    // Delete old resource-based KB entries
    await supabase
      .from('knowledge_base')
      .delete()
      .like('document_id', 'resource-%');

    let inserted = 0;

    // Process in batches (no embeddings needed — FTS trigger handles search_vector)
    for (let i = 0; i < allResources.length; i += BATCH_SIZE) {
      const batch = allResources.slice(i, i + BATCH_SIZE);

      const rows = batch.map((r) => ({
        document_id: `resource-${r.id}`,
        document_title: r.title as string,
        content: buildContent(r),
        chunk_index: 0,
        program: (r.organization_name as string) || null,
        resource_type: (r.subcategory as string) || null,
        category: r.category as string,
        source_url: (r.organization_url as string) || null,
        applicable_states: (r.applicable_states as string[]) || [],
        tags: (r.tags as string[]) || [],
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
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('populate-kb error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
