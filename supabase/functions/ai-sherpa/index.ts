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
- Use the child's name if provided in user context

## CRITICAL RULES
1. NEVER provide medical diagnoses or treatment recommendations
2. NEVER provide specific legal or financial investment advice
3. If someone expresses suicidal thoughts or acute crisis, provide 988 Suicide & Crisis Lifeline and set crisisDetected to true
4. Focus ONLY on childhood cancer support

## GROUNDING — MANDATORY
- ONLY use information from the RETRIEVED KNOWLEDGE BASE CONTEXT below
- When citing a source, include it in your "referencedResources" array
- NEVER fabricate program names, phone numbers, websites, or dollar amounts
- If retrieved context does NOT answer the question, DO NOT guess or add information from general knowledge. Instead, direct the user to speak with a human Navigator.
- When no relevant resources are found OR your retrieved context doesn't adequately answer the question, you MUST respond with a warm message directing the user to the Sebastian Strong Navigator team:
  Phone: 833-726-2636
  Email: info@sebastianstrong.org
  Website: https://www.sebastianstrong.org
  Say something like: "I don't have specific information about that in my knowledge base. Our Navigator team specializes in exactly this kind of support — they can help you find what you need. You can reach them at 833-726-2636 or info@sebastianstrong.org."
- NEVER invent or guess resource names, organizations, programs, dollar amounts, phone numbers, or URLs that are not explicitly present in the retrieved context below

## RESPONSE STYLE
- Lead with the most actionable information
- Use bullet points for lists of programs/resources
- Include eligibility details and contact info when available from sources
- End with a warm, supportive closing sentence

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

    const fullSystem = SYSTEM_PROMPT + userCtxStr + kbContext;

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
    let parsedResponse = {
      reply: 'I apologize, I had trouble processing your message. Please try again.',
      suggestedPrompts: [] as string[],
      referencedResources: [] as Array<{ id: string; title: string; organization_name: string; organization_url?: string }>,
      crisisDetected: false,
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

    const responsePayload = { ...parsedResponse, ...(draftEmail ? { draftEmail } : {}) };
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
