import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_CATEGORIES = [
  "financial","medical","emotional","practical","legal","educational",
  "community","navigation","survivorship","sibling_support",
] as const;

const ALL_STATE_CODES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const PROMPTS = [
  {
    label: "Financial deep dive",
    prompt: `Find 20-25 organizations providing FINANCIAL support for families of children with cancer in the United States. Include both national and state-specific programs. Focus on lesser-known resources that families might miss:
- Hospital charity care and financial counseling programs
- Pharmaceutical patient assistance programs for pediatric cancer drugs
- Utility bill assistance for families with sick children
- Mortgage/rent assistance specifically for cancer families
- Travel grants for pediatric cancer treatment
- Gas card and fuel assistance programs
- Grocery and food assistance for cancer families
- Insurance premium assistance
- Co-pay assistance foundations
- State-specific programs (include the state abbreviation)

For EACH resource provide: title, description (2-3 sentences), category ("financial"), organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (array of state abbreviations, or empty array [] if national), tags (array), is_crisis_resource (boolean).
Return ONLY a JSON object with key "resources" containing the array. No markdown.`,
  },
  {
    label: "Medical & treatment resources",
    prompt: `Find 20-25 organizations providing MEDICAL support and treatment resources for children with cancer in the United States. Both national and state/regional:
- Pediatric oncology clinical trial databases and matching services
- Second opinion services for childhood cancer
- Specialized pediatric cancer treatment centers not yet well-known
- Integrative medicine programs for pediatric cancer patients
- Palliative care programs for children
- Late effects clinics for childhood cancer survivors
- Pediatric cancer genetic testing and counseling services
- Dental care programs for children undergoing cancer treatment
- Vision/hearing monitoring programs after cancer treatment
- Fertility preservation programs for pediatric/adolescent cancer patients

For EACH: title, description (2-3 sentences), category ("medical"), organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (array of state abbrevs or [] if national), tags (array), is_crisis_resource (boolean).
Return ONLY a JSON object with key "resources". No markdown.`,
  },
  {
    label: "Emotional & mental health",
    prompt: `Find 20-25 organizations providing EMOTIONAL and MENTAL HEALTH support for childhood cancer families. National and regional:
- Online therapy platforms with pediatric cancer specialization
- Art therapy and music therapy programs for children with cancer
- Play therapy programs in hospitals
- Grief and bereavement support specifically for pediatric cancer loss
- Parent support groups (online and in-person)
- Couples counseling for parents of children with cancer
- PTSD treatment for childhood cancer survivors
- Anxiety and depression programs for siblings
- Journaling and storytelling programs for kids with cancer
- Pet therapy and animal-assisted therapy programs in children's hospitals
- Mindfulness and meditation programs for pediatric patients

For EACH: title, description (2-3 sentences), category ("emotional"), organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (array or [] if national), tags, is_crisis_resource.
Return ONLY a JSON object with key "resources". No markdown.`,
  },
  {
    label: "Practical & daily living",
    prompt: `Find 20-25 organizations providing PRACTICAL daily-living support for childhood cancer families. National and state-specific:
- Meal delivery and meal train services for cancer families
- House cleaning services for families during treatment
- Childcare assistance for siblings during hospital stays
- Wig and hair loss support for children
- Care packages and comfort items for hospitalized children
- Laptop/tablet lending programs for hospitalized kids
- Adaptive clothing for children with ports/medical devices
- Home modification assistance for children with disabilities from cancer
- Respite care for caregivers
- Car seat programs for children with special medical needs
- Laundry services near children's hospitals
- Parking assistance at children's hospitals

For EACH: title, description (2-3 sentences), category ("practical"), organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (array or []), tags, is_crisis_resource.
Return ONLY a JSON object with key "resources". No markdown.`,
  },
  {
    label: "Community, camps & sibling support",
    prompt: `Find 20-25 organizations providing COMMUNITY support, CAMPS, and SIBLING programs for childhood cancer families. National and regional:
- Summer camps specifically for children with cancer (by region/state)
- Family retreat programs and weekend getaways
- Sibling support camps and programs
- Online communities and forums for pediatric cancer families
- Pen pal programs connecting kids with cancer
- Wish-granting organizations beyond Make-A-Wish
- Holiday gift programs for children with cancer
- Sports programs and adaptive athletics for pediatric cancer patients/survivors
- Photography and memory-making programs for cancer families
- Family vacation programs
- Teen and young adult cancer support communities
- Bereavement camps for siblings who lost a brother/sister to cancer

Mix categories: use "community" for general, "sibling_support" for sibling-focused, "emotional" for grief. For EACH: title, description (2-3 sentences), category, organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (array or []), tags, is_crisis_resource.
Return ONLY a JSON object with key "resources". No markdown.`,
  },
  {
    label: "Education, legal & navigation",
    prompt: `Find 20-25 organizations providing EDUCATIONAL, LEGAL, and PATIENT NAVIGATION support for childhood cancer families. National and regional:
- Hospital-based school programs and tutoring for children with cancer
- IEP/504 plan advocacy for children returning to school after cancer
- College scholarships specifically for childhood cancer survivors
- Legal aid for medical billing disputes
- FMLA guidance services for parents of children with cancer
- Insurance appeal assistance
- Medical debt negotiation services
- Patient advocate programs at children's hospitals
- Social worker navigation services
- Benefits enrollment assistance (SSI, SSDI for children)
- Transition programs for adolescent cancer survivors entering adulthood
- Vocational rehabilitation for young adult cancer survivors

Mix categories: "educational" for school/scholarship, "legal" for legal/insurance, "navigation" for navigation/advocacy. For EACH: title, description (2-3 sentences), category, organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (array or []), tags, is_crisis_resource.
Return ONLY a JSON object with key "resources". No markdown.`,
  },
  {
    label: "Regional - South & Southeast",
    prompt: `Find 15-20 childhood cancer support organizations SPECIFICALLY serving families in the Southern and Southeastern United States: AL, FL, GA, LA, MS, NC, SC, TN, TX, VA, AR, KY, WV.
Include children's hospital programs, local nonprofits, state-specific financial aid, regional camps, and family support. Use real organizations.
For EACH: title, description (2-3 sentences), category (financial/medical/emotional/practical/legal/educational/community/navigation/survivorship/sibling_support), organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (MUST include specific state codes), tags, is_crisis_resource.
Return ONLY a JSON object with key "resources". No markdown.`,
  },
  {
    label: "Regional - Midwest & Plains",
    prompt: `Find 15-20 childhood cancer support organizations SPECIFICALLY serving families in the Midwest and Plains states: OH, IN, IL, MI, WI, MN, IA, MO, KS, NE, SD, ND, OK.
Include children's hospital programs, local nonprofits, state-specific financial aid, regional camps, and family support. Use real organizations.
For EACH: title, description (2-3 sentences), category (financial/medical/emotional/practical/legal/educational/community/navigation/survivorship/sibling_support), organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (MUST include specific state codes), tags, is_crisis_resource.
Return ONLY a JSON object with key "resources". No markdown.`,
  },
  {
    label: "Regional - West & Mountain",
    prompt: `Find 15-20 childhood cancer support organizations SPECIFICALLY serving families in the Western and Mountain states: CA, WA, OR, CO, AZ, NV, UT, NM, MT, ID, WY, HI, AK.
Include children's hospital programs, local nonprofits, state-specific financial aid, regional camps, and family support. Use real organizations.
For EACH: title, description (2-3 sentences), category (financial/medical/emotional/practical/legal/educational/community/navigation/survivorship/sibling_support), organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (MUST include specific state codes), tags, is_crisis_resource.
Return ONLY a JSON object with key "resources". No markdown.`,
  },
  {
    label: "Regional - Northeast & Mid-Atlantic",
    prompt: `Find 15-20 childhood cancer support organizations SPECIFICALLY serving families in the Northeast and Mid-Atlantic states: NY, NJ, PA, MA, CT, RI, NH, VT, ME, MD, DE, DC.
Include children's hospital programs, local nonprofits, state-specific financial aid, regional camps, and family support. Use real organizations.
For EACH: title, description (2-3 sentences), category (financial/medical/emotional/practical/legal/educational/community/navigation/survivorship/sibling_support), organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (MUST include specific state codes), tags, is_crisis_resource.
Return ONLY a JSON object with key "resources". No markdown.`,
  },
  {
    label: "Survivorship & long-term",
    prompt: `Find 15-20 organizations focused on childhood cancer SURVIVORSHIP and long-term follow-up in the United States:
- Long-term follow-up clinics (LTFU) for childhood cancer survivors
- Late effects monitoring programs
- Cardiac screening programs for survivors of childhood cancer
- Fertility counseling for childhood cancer survivors reaching adulthood
- Neurocognitive rehabilitation for childhood cancer survivors
- Scholarships and educational grants for survivors
- Career mentoring programs for young adult survivors
- Health insurance navigation for aging-out survivors
- Survivorship care plan programs
- Physical rehabilitation and exercise programs for survivors
- Hearing and vision services for survivors with treatment-related damage

For EACH: title, description (2-3 sentences), category ("survivorship" or "medical"), organization_name, organization_url, organization_phone (or null), organization_email (or null), applicable_states (array or [] if national), tags, is_crisis_resource.
Return ONLY a JSON object with key "resources". No markdown.`,
  },
];

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

    const { batch: batchIndex = 0 } = await req.json().catch(() => ({ batch: 0 }));

    if (batchIndex >= PROMPTS.length) {
      return new Response(JSON.stringify({ success: true, done: true, total_batches: PROMPTS.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const current = PROMPTS[batchIndex];
    console.log(`Batch ${batchIndex + 1}/${PROMPTS.length}: ${current.label}`);

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
        messages: [{ role: "user", content: current.prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text ?? "{}";

    let jsonStr = raw.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    let parsed;
    try { parsed = JSON.parse(jsonStr); } catch {
      console.error("Parse failed:", jsonStr.substring(0, 500));
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
      if (error) errors.push(error.message);
      else inserted = cleaned.length;
    }

    console.log(`${current.label}: found ${valid.length}, inserted ${inserted}`);

    return new Response(JSON.stringify({
      success: true, batch: batchIndex + 1, total_batches: PROMPTS.length,
      label: current.label, found: valid.length, inserted,
      errors: errors.length ? errors : undefined,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
