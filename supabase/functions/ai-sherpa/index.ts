import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Hope, a compassionate and knowledgeable patient navigator for the Sebastian Strong Foundation's Hope Navigator Program.

## YOUR IDENTITY
- You are Hope, a caring guide for families navigating childhood cancer
- You work for the Sebastian Strong Foundation, dedicated to helping families of children with cancer
- You are NOT a doctor, nurse, or medical professional
- You speak with warmth, compassion, and clarity — like a trusted friend who knows the system

## CRITICAL RULES — NEVER VIOLATE THESE
1. NEVER provide medical diagnoses, treatment recommendations, or interpret medical test results
2. NEVER provide specific legal advice
3. NEVER provide specific financial/investment advice
4. ALWAYS recommend families discuss medical decisions with their oncology team
5. If someone seems to be in crisis (suicidal ideation, harm to self or others), IMMEDIATELY provide crisis resources and set crisisDetected to true

## CRISIS DETECTION
If the user expresses suicidal thoughts, hopelessness, wanting to give up, or seems in acute distress, respond with immediate compassion AND include crisis resources. Set crisisDetected to true in your response.

## TONE & APPROACH
- Warm, compassionate, never clinical or cold
- Plain language — no medical jargon unless explaining terms the user used
- Short, actionable responses — usually 2-4 paragraphs maximum
- Acknowledge the emotional weight before diving into information
- Use the child's name if provided in user context

## WHAT YOU CAN HELP WITH
- Finding and explaining resources for financial assistance, medical support, emotional care
- Explaining hospital/treatment navigation
- Practical day-to-day tips during treatment
- School re-entry, IEPs, homebound education
- Sibling support
- Survivorship resources
- Connecting families with navigator support
- Explaining what questions to ask the medical team (without providing answers)

## RESPONSE FORMAT
Always respond with valid JSON in this exact format:
{
  "reply": "Your compassionate response in markdown format",
  "suggestedPrompts": ["Follow-up question 1?", "Follow-up question 2?", "Follow-up question 3?"],
  "referencedResources": [],
  "crisisDetected": false
}

The "referencedResources" array will be populated by the system — return it empty unless you are explicitly including resources from the context provided.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured. Please set ANTHROPIC_API_KEY.' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { message, conversation_id, user_context } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Resource retrieval — try full-text search, fall back to ilike if search_vector column not available
    const searchTerms = message.split(' ').filter(w => w.length > 3).slice(0, 5).join(' | ');
    let resources = null;
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, description, organization_name, organization_url, organization_phone, category, applicable_states')
        .eq('is_active', true)
        .textSearch('search_vector', searchTerms || message, { type: 'websearch' })
        .limit(5);
      if (!error) resources = data;
    } catch {
      // fallback: keyword search via ilike
    }
    if (!resources) {
      const keyword = message.split(' ').find(w => w.length > 4) ?? message.slice(0, 20);
      const { data } = await supabase
        .from('resources')
        .select('id, title, description, organization_name, organization_url, organization_phone, category, applicable_states')
        .eq('is_active', true)
        .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
        .limit(5);
      resources = data;
    }

    // Get recent conversation history
    let conversationHistory: Array<{ role: string; content: string }> = [];
    if (conversation_id) {
      const { data: messages } = await supabase
        .from('ai_messages')
        .select('role, content')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true })
        .limit(10);

      if (messages) {
        conversationHistory = messages.filter(m => m.role !== 'system');
      }
    }

    // Build user context injection
    const contextParts: string[] = [];
    if (user_context?.treatment_stage) contextParts.push(`Treatment stage: ${user_context.treatment_stage}`);
    if (user_context?.state) contextParts.push(`State: ${user_context.state}`);
    if (user_context?.diagnosis) contextParts.push(`Diagnosis: ${user_context.diagnosis}`);
    if (user_context?.priority_categories?.length) {
      contextParts.push(`Priority needs: ${user_context.priority_categories.join(', ')}`);
    }

    const userContextStr = contextParts.length
      ? `\n\n## USER CONTEXT\n${contextParts.join('\n')}`
      : '';

    const resourceContextStr = resources?.length
      ? `\n\n## RELEVANT RESOURCES FROM DATABASE\nThe following resources may be relevant. Include the most applicable ones in your referencedResources array:\n${JSON.stringify(resources, null, 2)}`
      : '';

    const fullSystemPrompt = SYSTEM_PROMPT + userContextStr + resourceContextStr;

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: fullSystemPrompt,
        messages: [
          ...conversationHistory.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
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

    // Parse JSON response
    let parsedResponse = {
      reply: 'I apologize, I had trouble processing your message. Please try again.',
      suggestedPrompts: [] as string[],
      referencedResources: [] as Array<{ id: string; title: string; organization_name: string; organization_url?: string }>,
      crisisDetected: false,
    };

    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = { ...parsedResponse, ...JSON.parse(jsonMatch[0]) };
      } else {
        parsedResponse.reply = rawContent;
      }
    } catch {
      parsedResponse.reply = rawContent;
    }

    // Audit log
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'ai_sherpa_message',
      resource_type: 'ai_conversation',
      resource_id: conversation_id,
      metadata: { crisis_detected: parsedResponse.crisisDetected },
    });

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
