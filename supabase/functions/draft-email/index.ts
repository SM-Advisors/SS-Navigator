import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not configured');

    const { context, recipient, subject_hint, user_name, user_email, tone } = await req.json();

    if (!context) {
      return new Response(JSON.stringify({ error: 'context is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are Hope, an AI assistant for the Sebastian Strong Foundation. 
Your job is to draft professional, compassionate emails on behalf of families navigating childhood cancer.

Rules:
- Write in a warm but professional tone
- Include specific details from the context provided
- Keep emails concise (3-5 paragraphs)
- Always include a clear ask or purpose
- Sign with the user's name if provided
- Never include medical advice
- ${tone === 'formal' ? 'Use formal business language' : tone === 'urgent' ? 'Convey urgency while remaining professional' : 'Use a warm, conversational tone'}

Respond with ONLY valid JSON: {"subject": "Email subject", "body": "Full email body text", "summary": "One-line summary of what this email does"}`;

    const userPrompt = `Draft an email with the following details:
${recipient ? `To: ${recipient}` : ''}
${subject_hint ? `About: ${subject_hint}` : ''}
${user_name ? `From (sender name): ${user_name}` : ''}
${user_email ? `Sender email: ${user_email}` : ''}

Context/situation:
${context}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6-20260320',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Anthropic error:', errText);
      throw new Error('AI service temporarily unavailable');
    }

    const data = await res.json();
    const rawContent = data.content?.[0]?.text ?? '';

    let parsed = { subject: '', body: '', summary: '' };
    try {
      let cleaned = rawContent.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = { subject: subject_hint || 'Email Draft', body: rawContent, summary: 'Email draft' };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('draft-email error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
