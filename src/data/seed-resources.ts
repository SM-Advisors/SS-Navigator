// Seed data for SS Navigator resource database
// These are real organizations — verify URLs before production use.

export const seedResources = [
  // ============================================
  // FINANCIAL
  // ============================================
  {
    title: "Alex's Lemonade Stand Foundation",
    description: "Provides financial assistance to families of children with cancer to help cover travel expenses, lodging, and other treatment-related costs through their Childhood Cancer Research Fund and Family Support programs.",
    category: "financial",
    organization_name: "Alex's Lemonade Stand Foundation",
    organization_url: "https://www.alexslemonade.org",
    organization_phone: "866-333-1213",
    organization_email: "info@alexslemonade.org",
    tags: ["travel", "lodging", "financial assistance", "grants"],
    is_featured: true,
    priority_order: 10,
  },
  {
    title: "Family Reach — Financial Navigation for Cancer",
    description: "Connects cancer patients and their families with financial assistance programs, financial counseling, and emergency funds to cover treatment-related costs including food, housing, and utilities.",
    category: "financial",
    organization_name: "Family Reach",
    organization_url: "https://familyreach.org",
    organization_phone: "617-273-2500",
    tags: ["financial counseling", "emergency funds", "housing", "utilities"],
    is_featured: true,
    priority_order: 10,
  },
  {
    title: "Children's Cancer Fund — Patient Assistance",
    description: "Provides direct financial assistance to families of children with cancer to help with medical costs, transportation, lodging, and other non-medical expenses during treatment.",
    category: "financial",
    organization_name: "Children's Cancer Fund",
    organization_url: "https://www.childrenscancerfund.org",
    tags: ["grants", "direct assistance", "transportation"],
    priority_order: 8,
  },
  {
    title: "Patient Advocate Foundation — Co-Pay Relief",
    description: "Offers co-pay assistance to insured patients who financially qualify. Helps with insurance-related issues, negotiating with employers, and resolving insurance denials.",
    category: "financial",
    organization_name: "Patient Advocate Foundation",
    organization_url: "https://www.patientadvocate.org",
    organization_phone: "800-532-5274",
    tags: ["co-pay relief", "insurance", "denials"],
    priority_order: 9,
  },
  {
    title: "Ronald McDonald House Charities",
    description: "Provides housing and family support to families of seriously ill children receiving medical treatment. Houses near children's hospitals let families stay together during treatment.",
    category: "financial",
    organization_name: "Ronald McDonald House Charities",
    organization_url: "https://www.rmhc.org",
    tags: ["housing", "lodging", "near hospital", "family support"],
    is_featured: true,
    priority_order: 10,
  },
  {
    title: "Joe DiMaggio Children's Hospital Foundation — Financial Aid",
    description: "Provides financial assistance to families of pediatric cancer patients at Joe DiMaggio Children's Hospital in South Florida.",
    category: "financial",
    organization_name: "Joe DiMaggio Children's Hospital Foundation",
    organization_url: "https://www.jdch.com",
    applicable_states: ["FL"],
    tags: ["florida", "south florida", "direct assistance"],
    priority_order: 7,
  },
  {
    title: "Pediatric Cancer Research Foundation — Care Fund",
    description: "Provides grants to families to cover non-medical costs associated with childhood cancer treatment, including transportation, lodging, and household expenses.",
    category: "financial",
    organization_name: "Pediatric Cancer Research Foundation",
    organization_url: "https://pcrf-kids.org",
    tags: ["grants", "non-medical costs"],
    priority_order: 7,
  },

  // ============================================
  // MEDICAL
  // ============================================
  {
    title: "Children's Oncology Group — Clinical Trials",
    description: "The world's largest organization devoted exclusively to childhood and adolescent cancer research. Find open clinical trials at COG-member institutions near you.",
    category: "medical",
    organization_name: "Children's Oncology Group",
    organization_url: "https://www.childrensoncologygroup.org",
    tags: ["clinical trials", "research", "oncology", "treatment"],
    is_featured: true,
    priority_order: 10,
  },
  {
    title: "CureSearch for Children's Cancer",
    description: "Funds pediatric cancer research and provides resources for patients and families to understand treatment options, clinical trials, and navigate the healthcare system.",
    category: "medical",
    organization_name: "CureSearch for Children's Cancer",
    organization_url: "https://curesearch.org",
    tags: ["research", "clinical trials", "treatment information"],
    priority_order: 9,
  },
  {
    title: "Pediatric Brain Tumor Foundation — Medical Resources",
    description: "Provides educational resources, clinical trial matching, and community support for families of children with brain tumors.",
    category: "medical",
    organization_name: "Pediatric Brain Tumor Foundation",
    organization_url: "https://www.pbtfus.org",
    organization_phone: "800-253-6530",
    tags: ["brain tumor", "PBTF", "clinical trials"],
    applicable_diagnoses: ["brain tumor", "medulloblastoma", "glioma", "PNET"],
    priority_order: 8,
  },
  {
    title: "National Children's Cancer Society — Medical Information",
    description: "Provides information about childhood cancers, treatment options, and resources for families navigating a new or ongoing diagnosis.",
    category: "medical",
    organization_name: "National Children's Cancer Society",
    organization_url: "https://www.thenccs.org",
    organization_phone: "314-241-1600",
    tags: ["diagnosis information", "treatment resources"],
    priority_order: 8,
  },

  // ============================================
  // EMOTIONAL SUPPORT
  // ============================================
  {
    title: "CancerCare — Free Counseling & Support Groups",
    description: "Provides free, professional support services including individual counseling, support groups, and educational workshops for cancer patients and families, including childhood cancer.",
    category: "emotional",
    organization_name: "CancerCare",
    organization_url: "https://www.cancercare.org",
    organization_phone: "800-813-4673",
    tags: ["counseling", "support groups", "mental health", "free"],
    is_featured: true,
    priority_order: 10,
  },
  {
    title: "American Childhood Cancer Organization — Support Groups",
    description: "Connects families with peer support through online and local support groups. ACCO's family network provides community for parents and caregivers of children with cancer.",
    category: "emotional",
    organization_name: "American Childhood Cancer Organization",
    organization_url: "https://www.acco.org",
    organization_phone: "855-858-2226",
    tags: ["support groups", "peer support", "community"],
    is_featured: true,
    priority_order: 9,
  },
  {
    title: "Kids Konnected — Support for Kids with a Parent with Cancer",
    description: "Provides a caring support network for kids and teens who have a parent or loved one with cancer. Offers peer support, hotlines, and educational programs.",
    category: "emotional",
    organization_name: "Kids Konnected",
    organization_url: "https://www.kidskonnected.org",
    organization_phone: "800-899-2866",
    tags: ["peer support", "children", "teens", "parent cancer"],
    priority_order: 7,
  },
  {
    title: "Stupid Cancer — Young Adult Support",
    description: "Focuses on young adults impacted by cancer, offering support communities, wellness programs, and advocacy. Relevant for teenage patients and siblings.",
    category: "emotional",
    organization_name: "Stupid Cancer",
    organization_url: "https://stupidcancer.org",
    tags: ["young adults", "teens", "community", "advocacy"],
    applicable_stages: ["in_treatment", "survivorship"],
    priority_order: 7,
  },

  // ============================================
  // PRACTICAL
  // ============================================
  {
    title: "Kids' Meals on Wheels — Childhood Cancer",
    description: "Many local Meals on Wheels chapters provide meal delivery to families with seriously ill children. Reduces the burden of cooking during intensive treatment.",
    category: "practical",
    organization_name: "Meals on Wheels America",
    organization_url: "https://www.mealsonwheelsamerica.org",
    tags: ["meals", "food", "delivery", "local programs"],
    priority_order: 7,
  },
  {
    title: "Cleaning For A Reason — Free House Cleaning",
    description: "Partners with house cleaning companies to provide free cleanings for cancer patients. Helps families maintain a safe, clean environment during treatment.",
    category: "practical",
    organization_name: "Cleaning For A Reason Foundation",
    organization_url: "https://cleaningforareason.org",
    tags: ["house cleaning", "free services", "home"],
    priority_order: 8,
  },
  {
    title: "CaringBridge — Free Patient Websites",
    description: "Free personalized health journals that keep family and friends informed. Reduces the burden of updating everyone while allowing families to focus on care.",
    category: "practical",
    organization_name: "CaringBridge",
    organization_url: "https://www.caringbridge.org",
    tags: ["communication", "family updates", "journal"],
    priority_order: 7,
  },
  {
    title: "National Patient Travel Center — Transportation Assistance",
    description: "Helps arrange free air transportation for medical treatment through a network of volunteer pilots and commercial airline programs.",
    category: "practical",
    organization_name: "National Patient Travel Center",
    organization_url: "https://www.patienttravel.org",
    organization_phone: "800-296-1217",
    tags: ["transportation", "flights", "travel assistance"],
    priority_order: 8,
  },

  // ============================================
  // EDUCATIONAL
  // ============================================
  {
    title: "Back2School — School Re-Entry Guide for Childhood Cancer",
    description: "Comprehensive resources from CureSearch to help families prepare for school re-entry after cancer treatment, including IEP guidance, accommodation letters, and teacher education.",
    category: "educational",
    organization_name: "CureSearch for Children's Cancer",
    organization_url: "https://curesearch.org/school-and-cancer",
    tags: ["school re-entry", "IEP", "504 plan", "education"],
    applicable_stages: ["in_treatment", "post_treatment", "survivorship"],
    priority_order: 9,
  },
  {
    title: "Hospital Homebound Education Programs",
    description: "Most states require school districts to provide homebound instruction when a student cannot attend school due to medical necessity. Contact your district for specifics.",
    category: "educational",
    organization_name: "U.S. Department of Education",
    organization_url: "https://www.ed.gov",
    tags: ["homebound", "education", "in-home tutoring", "IEP"],
    priority_order: 8,
  },
  {
    title: "Educating Children with Cancer — School Accommodation Guide",
    description: "Practical guide for parents on advocating for educational accommodations including 504 plans, IEPs, and classroom modifications for children with cancer.",
    category: "educational",
    organization_name: "American Childhood Cancer Organization",
    organization_url: "https://www.acco.org/school",
    tags: ["accommodations", "504 plan", "IEP", "school support"],
    priority_order: 8,
  },

  // ============================================
  // LEGAL
  // ============================================
  {
    title: "FMLA — Family Medical Leave Act Guide",
    description: "The FMLA allows eligible employees to take up to 12 weeks of unpaid, job-protected leave per year for family medical situations, including a child's serious health condition.",
    category: "legal",
    organization_name: "U.S. Department of Labor",
    organization_url: "https://www.dol.gov/agencies/whd/fmla",
    tags: ["FMLA", "job protection", "employment", "leave"],
    priority_order: 9,
  },
  {
    title: "Patient Advocate Foundation — Legal Case Managers",
    description: "Free case management services to help patients with insurance issues, employment problems related to their medical condition, and access to care.",
    category: "legal",
    organization_name: "Patient Advocate Foundation",
    organization_url: "https://www.patientadvocate.org",
    organization_phone: "800-532-5274",
    tags: ["legal aid", "insurance appeals", "employment law"],
    priority_order: 9,
  },
  {
    title: "ADA & Disability Rights for Children with Cancer",
    description: "Under the ADA and Section 504, children with cancer may qualify for protections in public schools and other settings. Know your family's rights.",
    category: "legal",
    organization_name: "Disability Rights Advocates",
    organization_url: "https://dralegal.org",
    tags: ["ADA", "disability rights", "504", "school rights"],
    priority_order: 7,
  },

  // ============================================
  // COMMUNITY
  // ============================================
  {
    title: "Childhood Cancer Cafe — Online Community",
    description: "An online support community specifically for parents and families of children with cancer. Share experiences, find support, and connect with those who truly understand.",
    category: "community",
    organization_name: "Childhood Cancer Cafe",
    organization_url: "https://childhoodcancercafe.com",
    tags: ["online community", "peer support", "parents"],
    priority_order: 7,
  },
  {
    title: "ACCO — Kids' Online Community",
    description: "American Childhood Cancer Organization's online network connecting kids and teens with cancer or in remission with peers who understand the journey.",
    category: "community",
    organization_name: "American Childhood Cancer Organization",
    organization_url: "https://www.acco.org/community",
    tags: ["children", "teens", "peer connection", "online"],
    priority_order: 7,
  },

  // ============================================
  // NAVIGATION
  // ============================================
  {
    title: "Sebastian Strong — Hope Navigator Program",
    description: "FREE nurse navigator services for families of children with cancer. Our navigators provide personalized guidance through diagnosis, treatment, and beyond. No appointment needed.",
    category: "navigation",
    organization_name: "Sebastian Strong Foundation",
    organization_url: "https://sebastianstrong.org",
    organization_phone: "305-335-0894",
    organization_email: "oscar@sebastianstrong.org",
    tags: ["navigator", "nurse navigator", "free", "personalized support"],
    is_featured: true,
    is_crisis_resource: false,
    priority_order: 10,
  },
  {
    title: "National Cancer Information Center — ACS Navigators",
    description: "The American Cancer Society provides navigation services to help patients and families connect with local resources, programs, and services.",
    category: "navigation",
    organization_name: "American Cancer Society",
    organization_url: "https://www.cancer.org",
    organization_phone: "800-227-2345",
    tags: ["navigation", "ACS", "information", "local resources"],
    priority_order: 8,
  },

  // ============================================
  // SURVIVORSHIP
  // ============================================
  {
    title: "Children's Oncology Group — Long-Term Follow-Up Guidelines",
    description: "Comprehensive guidelines for the long-term follow-up care of childhood cancer survivors. Helps families understand potential late effects and recommended screenings.",
    category: "survivorship",
    organization_name: "Children's Oncology Group",
    organization_url: "https://www.survivorshipguidelines.org",
    tags: ["late effects", "follow-up care", "screenings", "survivorship guidelines"],
    applicable_stages: ["post_treatment", "survivorship"],
    is_featured: true,
    priority_order: 9,
  },
  {
    title: "Stupid Cancer — Survivorship Resources",
    description: "Resources for young adult cancer survivors navigating life after cancer — employment, relationships, health insurance, and mental health.",
    category: "survivorship",
    organization_name: "Stupid Cancer",
    organization_url: "https://stupidcancer.org",
    tags: ["survivorship", "young adults", "life after cancer"],
    applicable_stages: ["survivorship"],
    priority_order: 7,
  },
  {
    title: "Livestrong — Survivorship Care Planning",
    description: "Provides survivorship care plans, fertility preservation resources, and programs to help cancer survivors thrive after treatment.",
    category: "survivorship",
    organization_name: "Livestrong Foundation",
    organization_url: "https://www.livestrong.org",
    tags: ["care plan", "fertility", "life after cancer"],
    applicable_stages: ["post_treatment", "survivorship"],
    priority_order: 8,
  },

  // ============================================
  // SIBLING SUPPORT
  // ============================================
  {
    title: "Sibling Support Project",
    description: "Dedicated to the interests of brothers and sisters of children with special health and developmental needs. Offers Sibshops — workshop programs for siblings aged 8-13.",
    category: "sibling_support",
    organization_name: "Sibling Support Project",
    organization_url: "https://www.siblingsupport.org",
    tags: ["siblings", "Sibshops", "workshops", "peer support"],
    is_featured: true,
    priority_order: 9,
  },
  {
    title: "ACCO — Sibling Resources",
    description: "Resources to help parents explain cancer to siblings, support their emotional needs, and find age-appropriate ways to involve siblings in the family's journey.",
    category: "sibling_support",
    organization_name: "American Childhood Cancer Organization",
    organization_url: "https://www.acco.org/siblings",
    tags: ["siblings", "explaining cancer", "family support"],
    priority_order: 8,
  },
  {
    title: "SuperSibs — Recognition & Support for Siblings",
    description: "Honors, assists, and encourages siblings of children with cancer through recognition programs, pen pal networks, and scholarship programs.",
    category: "sibling_support",
    organization_name: "SuperSibs (merged with ACCO)",
    organization_url: "https://www.acco.org",
    tags: ["siblings", "recognition", "scholarships", "pen pal"],
    priority_order: 8,
  },

  // ============================================
  // CRISIS RESOURCES
  // ============================================
  {
    title: "988 Suicide & Crisis Lifeline",
    description: "Call or text 988 to reach the Suicide and Crisis Lifeline, available 24/7. Free, confidential support for people in distress and prevention resources for you or your loved ones.",
    category: "emotional",
    organization_name: "SAMHSA / 988 Suicide & Crisis Lifeline",
    organization_url: "https://988lifeline.org",
    organization_phone: "988",
    tags: ["crisis", "suicide prevention", "mental health emergency", "24/7"],
    is_crisis_resource: true,
    is_featured: true,
    priority_order: 10,
  },
  {
    title: "Crisis Text Line",
    description: "Text HOME to 741741 to connect with a Crisis Counselor. Free, 24/7 support for people in crisis. Text-based support is available for those who prefer not to call.",
    category: "emotional",
    organization_name: "Crisis Text Line",
    organization_url: "https://www.crisistextline.org",
    tags: ["crisis", "text support", "24/7", "mental health emergency"],
    is_crisis_resource: true,
    is_featured: true,
    priority_order: 10,
  },
];

// SQL INSERT statements for manual seeding
export function generateSeedSQL(): string {
  const rows = seedResources.map(r => {
    const states = r.applicable_states ? `ARRAY[${r.applicable_states.map(s => `'${s}'`).join(', ')}]` : "ARRAY[]::TEXT[]";
    const stages = r.applicable_stages ? `ARRAY[${r.applicable_stages.map(s => `'${s}'`).join(', ')}]` : "ARRAY[]::TEXT[]";
    const diagnoses = r.applicable_diagnoses ? `ARRAY[${r.applicable_diagnoses.map(d => `'${d.replace(/'/g, "''")}'`).join(', ')}]` : "ARRAY[]::TEXT[]";
    const tags = r.tags ? `ARRAY[${r.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}]` : "ARRAY[]::TEXT[]";

    return `(
  '${r.title.replace(/'/g, "''")}',
  '${r.description.replace(/'/g, "''")}',
  '${r.category}'::public.resource_category,
  '${r.organization_name.replace(/'/g, "''")}',
  ${r.organization_url ? `'${r.organization_url}'` : 'NULL'},
  ${r.organization_phone ? `'${r.organization_phone}'` : 'NULL'},
  ${r.organization_email ? `'${r.organization_email}'` : 'NULL'},
  ${states}, ${stages}, ${diagnoses}, ${tags},
  ${r.is_featured ? 'true' : 'false'},
  true,
  ${r.is_crisis_resource ? 'true' : 'false'},
  ${r.priority_order ?? 0}
)`;
  });

  return `INSERT INTO public.resources (
  title, description, category, organization_name,
  organization_url, organization_phone, organization_email,
  applicable_states, applicable_stages, applicable_diagnoses, tags,
  is_featured, is_active, is_crisis_resource, priority_order
) VALUES
${rows.join(',\n')};`;
}
