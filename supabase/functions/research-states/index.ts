import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_CATEGORIES = [
  "financial","medical","emotional","practical","legal","educational",
  "community","navigation","survivorship","sibling_support",
] as const;

const STATES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",
  HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",
  KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
  MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",
  MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",
  OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",
  VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
  DC:"District of Columbia",
};

const ALL_STATE_CODES = Object.keys(STATES);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const { batch: batchIndex = 0, batch_size: batchSize = 5 } = await req.json().catch(() => ({ batch: 0, batch_size: 5 }));

    const stateBatches: string[][] = [];
    for (let i = 0; i < ALL_STATE_CODES.length; i += batchSize) {
      stateBatches.push(ALL_STATE_CODES.slice(i, i + batchSize));
    }

    if (batchIndex >= stateBatches.length) {
      return new Response(JSON.stringify({ success: true, done: true, total_batches: stateBatches.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentBatch = stateBatches[batchIndex];
    const stateNames = currentBatch.map(c => `${STATES[c]} (${c})`).join(", ");
    console.log(`Batch ${batchIndex + 1}/${stateBatches.length}: ${stateNames}`);

    const prompt = `Find 8-12 REAL organizations that provide support SPECIFICALLY for families of children with cancer in: ${stateNames}.

Focus on STATE-SPECIFIC resources:
- Children's hospitals with pediatric oncology programs in these states
- State-specific financial assistance for pediatric cancer families
- Local childhood cancer nonprofits and foundations
- Ronald McDonald Houses or similar housing near hospitals in these states
- Regional camps for kids with cancer
- State Medicaid/CHIP programs
- Local transportation assistance
- State education support for seriously ill children

Return ONLY a JSON object with key "resources" containing an array. No markdown, no explanation. Each resource needs:
title, description (2-3 sentences), category (one of: financial, medical, emotional, practical, legal, educational, community, navigation, survivorship, sibling_support), organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (array of state codes from ${JSON.stringify(currentBatch)}), tags (array of strings), is_crisis_resource (boolean).

Make sure EVERY state in ${JSON.stringify(currentBatch)} has at least 2 resources. Use real organizations.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text ?? "{}";
    
    // Strip markdown if present
    let jsonStr = raw.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }
    
    let parsed;
    try { parsed = JSON.parse(jsonStr); } catch { 
      console.error("Parse failed, raw:", jsonStr.substring(0, 500));
      parsed = {}; 
    }
    let arr = Array.isArray(parsed) ? parsed : parsed.resources || [];
    if (!Array.isArray(arr)) {
      for (const v of Object.values(parsed)) {
        if (Array.isArray(v)) { arr = v as any[]; break; }
      }
    }

    const valid = (arr as any[]).filter((r: any) => r.title && r.description && r.organization_name);
    const cleaned = valid.map((r: any) => ({
      title: String(r.title).substring(0, 255),
      description: String(r.description).substring(0, 1000),
      category: VALID_CATEGORIES.includes(r.category) ? r.category : "practical",
      organization_name: r.organization_name,
      organization_url: r.organization_url || null,
      organization_phone: r.organization_phone || null,
      organization_email: r.organization_email || null,
      applicable_states: (r.applicable_states || []).filter((s: string) => ALL_STATE_CODES.includes(s)),
      tags: r.tags || [],
      is_crisis_resource: r.is_crisis_resource || false,
      is_active: true,
      is_featured: false,
      priority_order: 0,
      applicable_stages: [],
      applicable_diagnoses: [],
    }));

    let inserted = 0;
    const errors: string[] = [];
    if (cleaned.length > 0) {
      const { error } = await supabase.from("resources").insert(cleaned);
      if (error) {
        errors.push(error.message);
      } else {
        inserted = cleaned.length;
      }
    }

    console.log(`Batch ${batchIndex + 1}: found ${valid.length}, inserted ${inserted}`);

    return new Response(JSON.stringify({
      success: true, batch: batchIndex + 1, total_batches: stateBatches.length,
      states: currentBatch, found: valid.length, inserted, errors: errors.length ? errors : undefined,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
