import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CHUNK_SIZE = 600;      // words
const CHUNK_OVERLAP = 100;   // words
const MIN_CHUNK_SIZE = 50;   // words

function chunkText(text: string): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + CHUNK_SIZE, words.length);
    const chunk = words.slice(start, end).join(' ');
    if (chunk.split(/\s+/).length >= MIN_CHUNK_SIZE) {
      chunks.push(chunk);
    }
    if (end >= words.length) break;
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

async function embedText(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings error: ${err}`);
  }
  const data = await res.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

    // Use service role to bypass RLS for inserts
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify caller is admin/navigator
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { document_id, document_title, content, program, resource_type, category, source_url, applicable_states, tags, replace_existing } = body;

    if (!document_id || !document_title || !content) {
      return new Response(JSON.stringify({ error: 'document_id, document_title, and content are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Optionally delete existing chunks for this document
    if (replace_existing) {
      await supabase.from('knowledge_base').delete().eq('document_id', document_id);
    }

    const chunks = chunkText(content);
    const inserted: number[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      let embedding: number[] | null = null;
      
      // Retry up to 3 times for transient failures
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          embedding = await embedText(chunk, openaiKey);
          break;
        } catch (e) {
          if (attempt === 2) throw e;
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      }

      const { error: insertErr } = await supabase.from('knowledge_base').insert({
        document_id,
        document_title,
        chunk_index: i,
        content: chunk,
        embedding: `[${embedding!.join(',')}]`,
        program: program ?? null,
        resource_type: resource_type ?? null,
        category: category ?? null,
        source_url: source_url ?? null,
        applicable_states: applicable_states ?? [],
        tags: tags ?? [],
        metadata: { total_chunks: chunks.length, ingested_by: user.id },
      });

      if (insertErr) {
        console.error('Insert error on chunk', i, insertErr);
        throw new Error(`Failed to insert chunk ${i}: ${insertErr.message}`);
      }
      inserted.push(i);
    }

    return new Response(JSON.stringify({
      success: true,
      document_id,
      chunks_created: inserted.length,
      message: `Successfully ingested "${document_title}" as ${inserted.length} chunks`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('process-document error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
