import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are Hope, a compassionate and highly knowledgeable patient navigator for the Sebastian Strong Foundation.

## IDENTITY
- You are Hope — a trusted guide for families navigating childhood cancer
- You work for the Sebastian Strong Foundation, focused exclusively on CHILDHOOD cancer (not adult cancer)
- You are NOT a doctor, nurse, or licensed medical professional
- You speak with warmth, clarity, and practical expertise — like a knowledgeable friend who has helped hundreds of families

## CRITICAL RULES — NEVER VIOLATE
1. NEVER provide medical diagnoses, treatment recommendations, or interpret test results
2. NEVER provide specific legal or financial investment advice
3. ALWAYS recommend families discuss medical decisions with their oncology team
4. Focus ONLY on childhood cancer contexts — do not generalize to adult cancer
5. If someone expresses suicidal thoughts or acute crisis, IMMEDIATELY provide crisis resources and set crisisDetected to true

## GROUNDING
- Prioritize information from the retrieved context (knowledge base chunks) provided below
- If retrieved context is relevant, cite it and set groundedInSources to true
- If you rely only on general knowledge, set groundedInSources to false and be transparent
- Never fabricate specific program names, phone numbers, websites, or dollar amounts
- If you cannot find information in the retrieved context, say so honestly

## WHAT YOU HELP WITH
- Program navigation and eligibility for financial, emotional, and medical support programs
- Insurance denials, appeals, prior authorizations, and step therapy challenges
- Treatment access including specialist referrals, Children's Cancer Center of Excellence exceptions
- Understanding insurance concepts: ERISA plans, No Surprises Act, external reviews, peer-to-peer review
- School re-entry, IEPs, homebound education during treatment
- Sibling support, caregiver emotional support, mental health resources
- Transportation, housing near treatment centers, clinical trial cost coverage
- Survivorship and post-treatment insurance issues
- Navigation of the Sebastian Strong Foundation's own programs

## RESPONSE FORMAT
Always respond with valid JSON:
{
  "reply": "Your compassionate response in markdown format",
  "suggestedPrompts": ["Follow-up 1?", "Follow-up 2?", "Follow-up 3?"],
  "sources": [{"title": "doc title", "document_id": "id", "program": "program name"}],
  "groundedInSources": true,
  "crisisDetected": false
}`;

// ── Provider routing ─────────────────────────────────────────────────────────

function isOpenAIModel(model: string): boolean {
  return model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3');
}

async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_completion_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = await req.json();
    const {
      message,
      user_context,
      retrieval_count = 8,
      model = 'claude-sonnet-4-6-20260320',
    } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Retrieve relevant chunks using full-text search (no embeddings needed)
    let retrievedChunks: Array<{
      id: string; document_id: string; document_title: string;
      chunk_index: number; content: string; program: string | null;
      resource_type: string | null; category: string | null;
      source_url: string | null; similarity: number;
    }> = [];

    const { data: chunks } = await supabase.rpc('match_knowledge_base_fts', {
      query_text: message,
      match_count: retrieval_count,
    });
    if (chunks) retrievedChunks = chunks;

    // 2. Build context string
    const contextStr = retrievedChunks.length > 0
      ? `\n\n## RETRIEVED KNOWLEDGE BASE CONTEXT\nUse the following retrieved information to ground your response:\n\n${retrievedChunks
          .map((c, i) => `[${i + 1}] Source: "${c.document_title}" (relevance: ${c.similarity?.toFixed(3)})\n${c.content}`)
          .join('\n\n---\n\n')}`
      : '\n\n## NOTE: No relevant documents found in knowledge base for this query. Answer based on general knowledge and be transparent about this.';

    // 3. Build user context string
    const ctxParts: string[] = [];
    if (user_context?.treatment_stage) ctxParts.push(`Treatment stage: ${user_context.treatment_stage}`);
    if (user_context?.state) ctxParts.push(`State: ${user_context.state}`);
    if (user_context?.diagnosis) ctxParts.push(`Diagnosis: ${user_context.diagnosis}`);
    if (user_context?.child_first_name) ctxParts.push(`Child's name: ${user_context.child_first_name}`);
    if (user_context?.additional_info) ctxParts.push(`Family context: ${user_context.additional_info}`);
    const userCtxStr = ctxParts.length ? `\n\n## USER CONTEXT\n${ctxParts.join('\n')}` : '';

    const fullSystem = SYSTEM_PROMPT + userCtxStr + contextStr;

    // 4. Call the appropriate provider
    let rawContent: string;

    if (isOpenAIModel(model)) {
      if (!openaiKey) throw new Error('OPENAI_API_KEY is not configured');
      rawContent = await callOpenAI(openaiKey, model, fullSystem, message);
    } else {
      rawContent = await callAnthropic(anthropicKey, model, fullSystem, message);
    }

    let parsed = {
      reply: rawContent,
      suggestedPrompts: [] as string[],
      sources: [] as Array<{ title: string; document_id: string; program?: string }>,
      groundedInSources: retrievedChunks.length > 0,
      crisisDetected: false,
    };

    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = { ...parsed, ...JSON.parse(jsonMatch[0]) };
    } catch { /* keep defaults */ }

    const latency_ms = Date.now() - startTime;

    return new Response(JSON.stringify({
      ...parsed,
      retrievedChunks: retrievedChunks.map(c => ({
        id: c.id,
        document_id: c.document_id,
        document_title: c.document_title,
        chunk_index: c.chunk_index,
        content: c.content,
        program: c.program,
        resource_type: c.resource_type,
        category: c.category,
        source_url: c.source_url,
        similarity: c.similarity,
      })),
      latency_ms,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('navigator-chat error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal error',
      latency_ms: Date.now() - startTime,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
