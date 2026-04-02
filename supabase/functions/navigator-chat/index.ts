import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ── Category classifier ──────────────────────────────────────────────────────
function classifyCategory(message: string): string {
  const lower = message.toLowerCase();
  const insuranceKeywords = ['insurance', 'denial', 'denied', 'appeal', 'prior auth', 'claim', 'coverage', 'out-of-network', 'copay', 'deductible', 'pre-authorization'];
  const treatmentKeywords = ['treatment', 'clinical trial', 'access', 'authorization', 'referral', 'specialist', 'second opinion', 'medication', 'chemo', 'radiation', 'surgery', 'transplant'];
  const psychosocialKeywords = ['emotional', 'mental health', 'therapy', 'counseling', 'support group', 'sibling', 'anxiety', 'depression', 'grief', 'bereavement', 'stress', 'coping', 'peer', 'family support', 'caregiver'];
  const programKeywords = ['program', 'eligibility', 'qualify', 'financial assistance', 'grant', 'housing', 'transportation', 'food', 'utility', 'scholarship', 'camp', 'wish'];

  if (insuranceKeywords.some(k => lower.includes(k))) return 'Insurance Denial & Appeals';
  if (treatmentKeywords.some(k => lower.includes(k))) return 'Treatment Access & Authorization';
  if (psychosocialKeywords.some(k => lower.includes(k))) return 'Psychosocial & Supportive Care';
  if (programKeywords.some(k => lower.includes(k))) return 'Program Navigation & Eligibility';
  return 'Scope & Edge Cases';
}

const BASE_SYSTEM_PROMPT = `You are a compassionate navigator assistant for the Sebastian Strong Foundation, helping families navigate childhood cancer diagnoses.

You must always return a response — never return an empty reply under any circumstances.

Start every response with one or two sentences acknowledging the emotional weight of the situation. Then provide practical information using bold headers and short bullet points.

If you don't have a specific answer, provide the closest relevant guidance you can and direct the family to: info@sebastianstrong.org or 833-726-2636.

## RESPONSE FORMAT
Respond with ONLY valid JSON (no markdown code blocks). Use this structure:
{"reply": "Your response in markdown", "suggestedPrompts": ["Follow-up Q1?", "Follow-up Q2?", "Follow-up Q3?"], "sources": [{"title": "doc title", "document_id": "id"}], "groundedInSources": true, "crisisDetected": false}`;

// ── Provider routing ─────────────────────────────────────────────────────────

function isOpenAIModel(model: string): boolean {
  return model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3');
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
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
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
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
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_completion_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
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
      conversation_id,
      user_context,
      retrieval_count = 5,
      model = 'claude-sonnet-4-6',
    } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Run retrieval + history in PARALLEL
    const MAX_CHUNK_CHARS = 800;

    const [historyResult, chunksResult] = await Promise.all([
      conversation_id
        ? supabase
            .from('ai_messages')
            .select('role, content')
            .eq('conversation_id', conversation_id)
            .order('created_at', { ascending: true })
            .limit(6)
        : Promise.resolve({ data: null }),
      supabase.rpc('match_knowledge_base_fts', {
        query_text: message,
        match_count: retrieval_count,
      }),
    ]);

    const historyMessages: ChatMessage[] = (historyResult.data ?? [])
      .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.role === 'assistant' ? m.content.slice(0, 300) : m.content.slice(0, 500),
      }));

    const retrievedChunks = (chunksResult.data ?? []) as Array<{
      id: string; document_id: string; document_title: string;
      chunk_index: number; content: string; program: string | null;
      resource_type: string | null; category: string | null;
      source_url: string | null; similarity: number;
    }>;

    // 2. Build context string (trimmed chunks)
    const contextStr = retrievedChunks.length > 0
      ? `\n\n## RETRIEVED KNOWLEDGE BASE CONTEXT\nUse the following retrieved information to ground your response:\n\n${retrievedChunks
          .map((c, i) => {
            const trimmed = c.content.length > MAX_CHUNK_CHARS ? c.content.slice(0, MAX_CHUNK_CHARS) + '…' : c.content;
            return `[${i + 1}] Source: "${c.document_title}"${c.program ? ` (${c.program})` : ''}${c.category ? ` [${c.category}]` : ''}\n${trimmed}`;
          })
          .join('\n\n---\n\n')}`
      : '\n\n## NOTE: No relevant documents found in knowledge base. You MUST tell the user you don\'t have specific resources and recommend contacting the Navigator team at info@sebastianstrong.org or 833-726-2636.';

    // 3. Build user context string
    const ctxParts: string[] = [];
    if (user_context?.treatment_stage) ctxParts.push(`Treatment stage: ${user_context.treatment_stage}`);
    if (user_context?.state) ctxParts.push(`State: ${user_context.state}`);
    if (user_context?.diagnosis) ctxParts.push(`Diagnosis: ${user_context.diagnosis}`);
    if (user_context?.child_first_name) ctxParts.push(`Child's name: ${user_context.child_first_name}`);
    if (user_context?.additional_info) ctxParts.push(`Family context: ${user_context.additional_info}`);
    const userCtxStr = ctxParts.length ? `\n\n## USER CONTEXT\n${ctxParts.join('\n')}` : '';

    const fullSystem = BASE_SYSTEM_PROMPT + userCtxStr + contextStr;

    // 5. Build messages array with history + current message
    const chatMessages: ChatMessage[] = [
      ...historyMessages,
      { role: 'user', content: message },
    ];

    // 6. Call the appropriate provider
    let rawContent: string;

    if (isOpenAIModel(model)) {
      if (!openaiKey) throw new Error('OPENAI_API_KEY is not configured');
      rawContent = await callOpenAI(openaiKey, model, fullSystem, chatMessages);
    } else {
      rawContent = await callAnthropic(anthropicKey, model, fullSystem, chatMessages);
    }

    let parsed = {
      reply: rawContent,
      suggestedPrompts: [] as string[],
      sources: [] as Array<{ title: string; document_id: string; program?: string }>,
      groundedInSources: retrievedChunks.length > 0,
      crisisDetected: false,
    };

    try {
      let cleaned = rawContent.trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = { ...parsed, ...JSON.parse(jsonMatch[0]) };
    } catch { /* keep defaults */ }

    const latency_ms = Date.now() - startTime;

    // Only include debug payload when explicitly requested (eval harness passes include_debug=true)
    const includeDebug = body.include_debug === true;

    const responsePayload: Record<string, unknown> = {
      ...parsed,
      latency_ms,
    };

    if (includeDebug) {
      responsePayload.fullSystemPrompt = fullSystem;
      responsePayload.userMessages = chatMessages;
      responsePayload.retrievedChunks = retrievedChunks.map(c => ({
        id: c.id,
        document_id: c.document_id,
        document_title: c.document_title,
        chunk_index: c.chunk_index,
        content: c.content.slice(0, MAX_CHUNK_CHARS),
        program: c.program,
        resource_type: c.resource_type,
        category: c.category,
        source_url: c.source_url,
        similarity: c.similarity,
      }));
    }

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('navigator-chat error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal error',
      latency_ms: Date.now() - startTime,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
