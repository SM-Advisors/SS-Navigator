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

const BASE_SYSTEM_PROMPT = `You are Hope, a compassionate navigator assistant for the Sebastian Strong Foundation, helping families navigate childhood cancer diagnoses. You support both families in crisis and the navigators who serve them.

## IDENTITY
- You help families navigating CHILDHOOD cancer (not adult cancer)
- You are NOT a medical professional — always recommend discussing medical decisions with the oncology team
- Use the child's name if provided in user context

## CRITICAL RULES
1. NEVER provide medical diagnoses or treatment recommendations
2. NEVER provide specific legal or financial investment advice
3. If someone expresses suicidal thoughts or acute crisis, provide 988 Suicide & Crisis Lifeline and set crisisDetected to true
4. Focus ONLY on childhood cancer support
5. The "referencedResources" array must ONLY contain resources that appear VERBATIM in the retrieved context. If you cannot find a matching resource, leave the array EMPTY.

## TONE & STYLE
Before giving any practical information, briefly acknowledge the emotional weight of the situation in one or two sentences. Families are often scared, exhausted, and overwhelmed. Your tone should feel like a knowledgeable friend, not a database.

When answering:
- Lead with the most actionable step first, then provide supporting resources
- Use plain, warm language — avoid clinical or bureaucratic phrasing
- For insurance denials or treatment access questions, always open by affirming the family's rights and protections before describing next steps
- Use **bold headers** and short bullet points so responses are easy to scan during a stressful moment

## GROUNDING
- Prefer information from the RETRIEVED KNOWLEDGE BASE CONTEXT below when available
- When citing a source, include it in your "referencedResources" array

## YOU MUST ALWAYS RESPOND
You must always provide a response — never return an empty reply. If your knowledge base does not have a specific answer:
- Acknowledge the gap briefly but warmly
- Offer the closest relevant general guidance you can
- Always close by directing to the navigator team: email info@sebastianstrong.org or call 833-726-2636
- Set "noMatchFound" to true in your JSON response
- Leave "referencedResources" as an empty array

## RESPONSE FORMAT
Respond with ONLY valid JSON (no markdown code blocks). Use this structure:
{"reply": "Your response in markdown", "suggestedPrompts": ["Q1?", "Q2?", "Q3?"], "referencedResources": [{"id": "resource-uuid", "title": "name", "organization_name": "org", "organization_url": "url"}], "crisisDetected": false, "noMatchFound": false}

Set "noMatchFound" to true whenever you direct the user to the Navigator team because your retrieved context does not adequately answer their question.`;

// Maximum characters per retrieved chunk to keep prompt lean
const MAX_CHUNK_CHARS = 800;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = await req.json();
    const { message, conversation_id, user_context } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Run retrieval + history in parallel ──────────────────────────────
    const [kbResult, historyResult] = await Promise.all([
      supabase.rpc('match_knowledge_base_fts', {
        query_text: message,
        match_count: 5,
      }),
      conversation_id
        ? supabase
            .from('ai_messages')
            .select('role, content')
            .eq('conversation_id', conversation_id)
            .order('created_at', { ascending: true })
            .limit(6)
        : Promise.resolve({ data: null }),
    ]);

    // ── Build KB context (trimmed chunks) ────────────────────────────────
    const kbChunks = kbResult.data;
    let kbContext = '';
    if (kbChunks?.length) {
      kbContext = `\n\n## RETRIEVED KNOWLEDGE BASE CONTEXT\n${kbChunks
        .map((c: { document_title: string; program: string; category: string; content: string }, i: number) => {
          const trimmed = c.content.length > MAX_CHUNK_CHARS
            ? c.content.slice(0, MAX_CHUNK_CHARS) + '…'
            : c.content;
          return `[${i + 1}] Source: "${c.document_title}"${c.program ? ` (${c.program})` : ''}${c.category ? ` [${c.category}]` : ''}\n${trimmed}`;
        })
        .join('\n\n---\n\n')}`;
    } else {
      kbContext = '\n\n## IMPORTANT — NO RELEVANT DOCUMENTS FOUND\nYou MUST NOT attempt to answer with general knowledge. You MUST direct the user to contact the Sebastian Strong Navigator team:\n- Phone: 833-726-2636\n- Email: info@sebastianstrong.org\n- Website: https://www.sebastianstrong.org\nBe warm and empathetic, but do NOT fabricate any resource names, programs, or details.';
    }

    // ── Conversation history ─────────────────────────────────────────────
    const conversationHistory = (historyResult.data ?? [])
      .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.role === 'assistant' ? m.content.slice(0, 300) : m.content.slice(0, 500),
      }));

    // ── User context ─────────────────────────────────────────────────────
    const ctxParts: string[] = [];
    if (user_context?.treatment_stage) ctxParts.push(`Treatment stage: ${user_context.treatment_stage}`);
    if (user_context?.state) ctxParts.push(`State: ${user_context.state}`);
    if (user_context?.diagnosis) ctxParts.push(`Diagnosis: ${user_context.diagnosis}`);
    if (user_context?.child_first_name) ctxParts.push(`Child's name: ${user_context.child_first_name}`);
    if (user_context?.additional_info) ctxParts.push(`Family context: ${user_context.additional_info}`);
    const userCtxStr = ctxParts.length ? `\n\n## USER CONTEXT\n${ctxParts.join('\n')}` : '';

    // ── Classify category and build full system prompt ─────────────────
    const category = classifyCategory(message);
    const categoryStr = `\n\n## CATEGORY CONTEXT\nThe question you are answering falls under this category: ${category}. Use this to calibrate your depth — Treatment Access & Authorization and Insurance Denial & Appeals questions warrant the most detailed, rights-forward responses. Psychosocial & Supportive Care questions should prioritize warmth and peer connection over information density.`;

    const fullSystem = BASE_SYSTEM_PROMPT + categoryStr + userCtxStr + kbContext;

    // ── Draft email helper (built after AI response if needed) ──────────
    const buildDraftEmail = () => {
      const userName = user_context?.child_first_name
        ? `parent of ${user_context.child_first_name}`
        : 'a family';
      const diagnosisInfo = user_context?.diagnosis ? ` (diagnosis: ${user_context.diagnosis})` : '';
      const stateInfo = user_context?.state ? ` in ${user_context.state}` : '';
      return {
        to: 'info@sebastianstrong.org',
        subject: `Navigator Support Request: ${message.slice(0, 80)}`,
        body: `Dear Navigator Team,\n\nI am ${userName}${stateInfo} navigating childhood cancer${diagnosisInfo}. I was unable to find resources through Hope regarding the following:\n\n"${message}"\n\nCould you please help me find relevant support or resources for this?\n\nThank you for your help.\n\nWarm regards`,
      };
    };

    // ── Call Claude ──────────────────────────────────────────────────────
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: fullSystem,
        messages: [
          ...conversationHistory,
          { role: 'user', content: message },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      throw new Error('AI service temporarily unavailable');
    }

    const claudeData = await claudeResponse.json();
    const rawContent = claudeData.content?.[0]?.text ?? '';

    // ── Parse JSON response ──────────────────────────────────────────────
    let parsedResponse: {
      reply: string;
      suggestedPrompts: string[];
      referencedResources: Array<{ id: string; title: string; organization_name: string; organization_url?: string }>;
      crisisDetected: boolean;
      noMatchFound: boolean;
    } = {
      reply: 'I apologize, I had trouble processing your message. Please try again.',
      suggestedPrompts: [],
      referencedResources: [],
      crisisDetected: false,
      noMatchFound: false,
    };

    try {
      let cleaned = rawContent.trim();
      // Strip markdown code fences
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      // Fix trailing commas and control chars
      cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']').replace(/[\x00-\x1F\x7F]/g, ' ');
      
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonStr = cleaned.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed.reply) {
          parsedResponse = { ...parsedResponse, ...parsed };
        } else {
          // JSON parsed but no reply field — use raw as plain text
          parsedResponse.reply = rawContent.replace(/[{}"[\]]/g, '').trim() || rawContent;
        }
      } else {
        // No JSON found — treat as plain text reply
        parsedResponse.reply = rawContent;
      }
    } catch {
      // JSON parse failed — extract reply field with regex as fallback
      const replyMatch = rawContent.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      if (replyMatch) {
        parsedResponse.reply = replyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      } else {
        // Last resort: strip JSON artifacts and show as plain text
        parsedResponse.reply = rawContent
          .replace(/```(?:json)?/gi, '')
          .replace(/```/g, '')
          .replace(/^\s*\{[\s\S]*?"reply"\s*:\s*"/i, '')
          .replace(/"\s*,?\s*"suggestedPrompts[\s\S]*$/i, '')
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .trim() || 'I had trouble processing that. Please try again.';
      }
    }

    // Include draft email if AI signaled no match or KB returned nothing
    const shouldDraftEmail = !kbChunks?.length || parsedResponse.noMatchFound;
    const draftEmail = shouldDraftEmail ? buildDraftEmail() : undefined;
    const { noMatchFound: _omit, ...cleanResponse } = parsedResponse;
    const responsePayload = { ...cleanResponse, ...(draftEmail ? { draftEmail } : {}) };
    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ai-sherpa error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
