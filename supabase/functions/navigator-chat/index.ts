import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are Hope, a compassionate patient navigator for the Sebastian Strong Foundation.

## IDENTITY
- You help families navigating CHILDHOOD cancer (not adult cancer)
- You are NOT a medical professional — always recommend discussing medical decisions with the oncology team
- You speak with warmth, brevity, and practical expertise
- Keep responses concise (2-4 paragraphs max) unless the user asks for detail

## CRITICAL RULES
1. NEVER provide medical diagnoses or treatment recommendations
2. NEVER provide specific legal or financial investment advice
3. If someone expresses suicidal thoughts or acute crisis, provide 988 Suicide & Crisis Lifeline and set crisisDetected to true
4. Focus ONLY on childhood cancer support

## GROUNDING — MANDATORY
- ONLY use information from the RETRIEVED KNOWLEDGE BASE CONTEXT below
- When citing a source, include it in your "sources" array with its document_id and title
- Set groundedInSources to true ONLY when your response directly uses retrieved context
- NEVER fabricate program names, phone numbers, websites, or dollar amounts
- If retrieved context does NOT answer the question, DO NOT guess or add information from general knowledge
- When no relevant resources are found, respond with: "I don't have specific resources for that in my knowledge base right now. I'd recommend reaching out to our Navigator team at info@sebastianstrong.org or calling 833-726-2636 — they can help you find exactly what you need." Set groundedInSources to false.

## WHAT YOU HELP WITH
- Financial, emotional, and medical support program navigation
- Insurance denials, appeals, prior authorizations
- School re-entry, IEPs, homebound education
- Sibling and caregiver support resources
- Transportation, housing near treatment centers
- Survivorship and bereavement support

## RESPONSE STYLE
- Lead with the most actionable information
- Use bullet points for lists of programs/resources
- Include eligibility details and contact info when available from sources
- End with a warm, supportive closing sentence
- Suggested prompts should be natural follow-ups based on the conversation

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
      max_tokens: 768,
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
      max_completion_tokens: 768,
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
      retrieval_count = 8,
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

    const fullSystem = SYSTEM_PROMPT + userCtxStr + contextStr;

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

    return new Response(JSON.stringify({
      ...parsed,
      fullSystemPrompt: fullSystem,
      userMessages: chatMessages,
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
