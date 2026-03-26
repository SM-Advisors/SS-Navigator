import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VALID_CATEGORIES = [
  "financial",
  "medical",
  "emotional",
  "practical",
  "legal",
  "educational",
  "community",
  "navigation",
  "survivorship",
  "sibling_support",
] as const;

const VALID_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

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
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  
  try {
    const parsed = JSON.parse(cleaned);
    const arr = Array.isArray(parsed) ? parsed : parsed.resources || [];
    return arr.filter(
      (r: any) =>
        r.title &&
        r.description &&
        r.organization_name &&
        VALID_CATEGORIES.includes(r.category)
    );
  } catch (e) {
    console.error("Failed to parse Perplexity response:", e, "Raw:", cleaned.substring(0, 500));
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

    // Verify caller is admin/navigator
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");
    
    const { data: hasRole } = await supabase.rpc("has_any_role", {
      _user_id: user.id,
      _roles: ["admin", "navigator"],
    });
    if (!hasRole) throw new Error("Forbidden: admin or navigator role required");

    // Research queries by category
    const queries = [
      {
        category: "financial",
        prompt: `Find 15-20 organizations that provide FINANCIAL assistance specifically for families of children with cancer (pediatric oncology). Include grants, medical bill help, travel assistance, and living expense support. For each, provide: title, description (2-3 sentences), category ("financial"), organization_name, organization_url, organization_phone (if known), organization_email (if known), applicable_states (array of US state abbreviations if state-specific, empty array if national), tags (array of relevant keywords), is_crisis_resource (boolean). Return as JSON array.`,
      },
      {
        category: "medical",
        prompt: `Find 15-20 organizations providing MEDICAL information and support specifically for pediatric/childhood cancer. Include clinical trial finders, treatment info, second opinion services, hospital programs for children. For each, provide: title, description (2-3 sentences), category ("medical"), organization_name, organization_url, organization_phone, organization_email, applicable_states (array of US state abbreviations or empty for national), tags, is_crisis_resource. Return as JSON array.`,
      },
      {
        category: "emotional",
        prompt: `Find 15-20 organizations providing EMOTIONAL and mental health support for families dealing with childhood cancer. Include counseling, support groups, grief resources, mental health services for parents and siblings. For each, provide: title, description (2-3 sentences), category ("emotional"), organization_name, organization_url, organization_phone, organization_email, applicable_states, tags, is_crisis_resource. Return as JSON array.`,
      },
      {
        category: "practical",
        prompt: `Find 15-20 organizations providing PRACTICAL help for families of children with cancer. Include housing near hospitals, transportation, meal delivery, wish-granting, care packages. For each, provide: title, description (2-3 sentences), category ("practical"), organization_name, organization_url, organization_phone, organization_email, applicable_states, tags, is_crisis_resource. Return as JSON array.`,
      },
      {
        category: "legal",
        prompt: `Find 10-15 organizations providing LEGAL support and advocacy for families of children with cancer. Include FMLA guidance, insurance appeals, disability rights, medical billing advocacy. For each, provide: title, description (2-3 sentences), category ("legal"), organization_name, organization_url, organization_phone, organization_email, applicable_states, tags, is_crisis_resource. Return as JSON array.`,
      },
      {
        category: "educational",
        prompt: `Find 10-15 organizations providing EDUCATIONAL support for children with cancer. Include homebound education, IEP/504 plan help, school re-entry programs, tutoring for hospitalized kids. For each, provide: title, description (2-3 sentences), category ("educational"), organization_name, organization_url, organization_phone, organization_email, applicable_states, tags, is_crisis_resource. Return as JSON array.`,
      },
      {
        category: "community",
        prompt: `Find 15-20 organizations providing COMMUNITY and peer support for childhood cancer families. Include camps, family retreats, online communities, parent networks, and family events. For each, provide: title, description (2-3 sentences), category ("community"), organization_name, organization_url, organization_phone, organization_email, applicable_states, tags, is_crisis_resource. Return as JSON array.`,
      },
      {
        category: "navigation",
        prompt: `Find 10-15 organizations providing PATIENT NAVIGATION and care coordination for childhood cancer. Include patient advocates, care coordinators, social workers, and hospital navigation programs. For each, provide: title, description (2-3 sentences), category ("navigation"), organization_name, organization_url, organization_phone, organization_email, applicable_states, tags, is_crisis_resource. Return as JSON array.`,
      },
      {
        category: "survivorship",
        prompt: `Find 10-15 organizations focused on childhood cancer SURVIVORSHIP. Include long-term follow-up programs, late effects monitoring, scholarship programs for survivors, and life-after-treatment resources. For each, provide: title, description (2-3 sentences), category ("survivorship"), organization_name, organization_url, organization_phone, organization_email, applicable_states, tags, is_crisis_resource. Return as JSON array.`,
      },
      {
        category: "sibling_support",
        prompt: `Find 10-15 organizations providing SIBLING SUPPORT for brothers and sisters of children with cancer. Include sibling camps, support groups, counseling, and activity programs. For each, provide: title, description (2-3 sentences), category ("sibling_support"), organization_name, organization_url, organization_phone, organization_email, applicable_states, tags, is_crisis_resource. Return as JSON array.`,
      },
    ];

    const allResources: PerplexityResource[] = [];
    const errors: string[] = [];

    // Process queries sequentially to avoid rate limits
    for (const q of queries) {
      try {
        console.log(`Researching ${q.category}...`);
        const raw = await queryPerplexity(PERPLEXITY_API_KEY, q.prompt);
        const resources = parseResources(raw);
        console.log(`Found ${resources.length} ${q.category} resources`);
        allResources.push(...resources);
        // Small delay between queries
        await new Promise((r) => setTimeout(r, 1500));
      } catch (e) {
        console.error(`Error researching ${q.category}:`, e);
        errors.push(`${q.category}: ${e.message}`);
      }
    }

    // Deduplicate by organization_name + title
    const seen = new Set<string>();
    const unique = allResources.filter((r) => {
      const key = `${r.organization_name.toLowerCase()}-${r.title.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Clean and validate states
    const cleaned = unique.map((r) => ({
      title: r.title.substring(0, 255),
      description: r.description.substring(0, 1000),
      category: r.category,
      organization_name: r.organization_name,
      organization_url: r.organization_url || null,
      organization_phone: r.organization_phone || null,
      organization_email: r.organization_email || null,
      applicable_states: (r.applicable_states || []).filter((s: string) =>
        VALID_STATES.includes(s)
      ),
      tags: r.tags || [],
      is_crisis_resource: r.is_crisis_resource || false,
      is_active: true,
      is_featured: false,
      priority_order: 0,
      applicable_stages: [],
      applicable_diagnoses: [],
    }));

    // Insert in batches of 50
    let inserted = 0;
    const batchSize = 50;
    for (let i = 0; i < cleaned.length; i += batchSize) {
      const batch = cleaned.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("resources")
        .insert(batch);
      if (insertError) {
        console.error("Insert error:", insertError);
        errors.push(`Insert batch ${i}: ${insertError.message}`);
      } else {
        inserted += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_found: allResources.length,
        unique: unique.length,
        inserted,
        errors: errors.length ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Research error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
