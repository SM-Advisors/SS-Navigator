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

interface PerplexityResource {
  title: string;
  description: string;
  category: string;
  organization_name: string;
  organization_url?: string;
  organization_phone?: string;
  organization_email?: string;
  applicable_states?: string[];
  tags?: string[];
  is_crisis_resource?: boolean;
}

async function queryPerplexity(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: `You are a research assistant specializing in CHILDHOOD cancer resources (pediatric oncology).
CRITICAL: Only include resources specifically for children/pediatric cancer patients and their families. Do NOT include adult cancer resources.
Return ONLY valid JSON with no markdown formatting, no code blocks, no explanation text.
Return a JSON array of resource objects.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Perplexity API error [${response.status}]: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "[]";
}

function parseResources(raw: string): PerplexityResource[] {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  try {
    const parsed = JSON.parse(cleaned);
    const arr = Array.isArray(parsed) ? parsed : parsed.resources || [];
    return arr.filter(
      (r: any) => r.title && r.description && r.organization_name
    ).map((r: any) => ({
      ...r,
      category: VALID_CATEGORIES.includes(r.category) ? r.category : "practical",
    }));
  } catch (e) {
    console.error("Parse error:", e, "Raw:", cleaned.substring(0, 300));
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    // Accept batch parameter: which batch of states to process (0-10)
    const { batch: batchIndex = 0 } = await req.json().catch(() => ({ batch: 0 }));

    // Split states into batches of 5
    const batchSize = 5;
    const stateBatches: string[][] = [];
    for (let i = 0; i < ALL_STATE_CODES.length; i += batchSize) {
      stateBatches.push(ALL_STATE_CODES.slice(i, i + batchSize));
    }

    if (batchIndex >= stateBatches.length) {
      return new Response(JSON.stringify({ success: true, message: "All batches done", total_batches: stateBatches.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentBatch = stateBatches[batchIndex];
    const stateNames = currentBatch.map(c => `${STATES[c]} (${c})`).join(", ");
    
    console.log(`Processing batch ${batchIndex + 1}/${stateBatches.length}: ${stateNames}`);

    const allResources: PerplexityResource[] = [];
    const errors: string[] = [];

    // Query for this batch of states
    const prompt = `Find 10-15 organizations that provide support SPECIFICALLY in these states for families of children with cancer: ${stateNames}.

Focus on STATE-SPECIFIC and LOCAL resources such as:
- Children's hospitals with pediatric oncology programs in these states
- State-specific financial assistance for pediatric cancer families
- Local childhood cancer nonprofits and foundations based in these states
- State Medicaid or CHIP programs relevant to children with cancer
- Regional support groups and camps for kids with cancer
- Family housing programs near children's hospitals in these states
- Local transportation assistance programs
- State education support for children with serious illness

For EACH resource, provide:
- title: resource name
- description: 2-3 sentences about what they specifically offer
- category: one of "financial", "medical", "emotional", "practical", "legal", "educational", "community", "navigation", "survivorship", "sibling_support"
- organization_name: official organization name
- organization_url: website URL if known
- organization_phone: phone number if known
- organization_email: email if known
- applicable_states: array with ONLY the specific state abbreviation(s) where this resource operates, e.g. ${JSON.stringify(currentBatch)}
- tags: array of relevant keywords
- is_crisis_resource: boolean (usually false)

Return as a JSON array. Every resource MUST have at least one state in applicable_states from: ${JSON.stringify(currentBatch)}`;

    try {
      const raw = await queryPerplexity(PERPLEXITY_API_KEY, prompt);
      const resources = parseResources(raw);
      console.log(`Found ${resources.length} resources for batch ${batchIndex + 1}`);
      allResources.push(...resources);
    } catch (e) {
      console.error(`Error:`, e);
      errors.push(e.message);
    }

    // Validate state codes and deduplicate
    const seen = new Set<string>();
    const unique = allResources.filter((r) => {
      const key = `${r.organization_name.toLowerCase()}-${r.title.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Clean and prepare for insert
    const cleaned = unique.map((r) => ({
      title: r.title.substring(0, 255),
      description: r.description.substring(0, 1000),
      category: r.category,
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

    // Insert
    let inserted = 0;
    if (cleaned.length > 0) {
      const { error: insertError } = await supabase.from("resources").insert(cleaned);
      if (insertError) {
        console.error("Insert error:", insertError);
        errors.push(insertError.message);
      } else {
        inserted = cleaned.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        batch: batchIndex + 1,
        total_batches: stateBatches.length,
        states: currentBatch,
        found: allResources.length,
        inserted,
        errors: errors.length ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Research error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
