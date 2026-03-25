export interface EvalPrompt {
  id: string;
  category: string;
  prompt: string;
}

export interface EvalSuite {
  id: string;
  name: string;
  description: string;
  prompts: EvalPrompt[];
}

export const SS_NAVIGATOR_SUITE: EvalSuite = {
  id: 'ss-navigator-v1',
  name: 'SS Navigator Core Suite',
  description: 'Comprehensive 40-prompt evaluation suite covering program navigation, insurance, treatment access, psychosocial support, and edge cases for childhood cancer families.',
  prompts: [
    // ─── Program Navigation & Eligibility ───────────────────────────────────
    {
      id: 'pn-01',
      category: 'Program Navigation & Eligibility',
      prompt: "A newly diagnosed family doesn't know what support programs they qualify for. Where do we start?",
    },
    {
      id: 'pn-02',
      category: 'Program Navigation & Eligibility',
      prompt: 'What financial assistance programs exist for families during treatment, beyond insurance?',
    },
    {
      id: 'pn-03',
      category: 'Program Navigation & Eligibility',
      prompt: "A family's income just changed and they're worried about losing program eligibility. What are their options?",
    },
    {
      id: 'pn-04',
      category: 'Program Navigation & Eligibility',
      prompt: "What is the Sebastian Strong Foundation's process for onboarding a new family?",
    },
    {
      id: 'pn-05',
      category: 'Program Navigation & Eligibility',
      prompt: 'A family just relocated to a new state mid-treatment. What changes in terms of program access?',
    },
    {
      id: 'pn-06',
      category: 'Program Navigation & Eligibility',
      prompt: "The family doesn't speak English. What language access rights do they have with their insurer?",
    },
    {
      id: 'pn-07',
      category: 'Program Navigation & Eligibility',
      prompt: 'A family just got approved for a grant. How does that interact with their insurance coverage?',
    },
    {
      id: 'pn-08',
      category: 'Program Navigation & Eligibility',
      prompt: 'What emergency support programs exist for families who need help right now — today?',
    },

    // ─── Insurance Denial & Appeals ─────────────────────────────────────────
    {
      id: 'da-01',
      category: 'Insurance Denial & Appeals',
      prompt: "We got a denial letter. What's the first thing I should read to understand our options?",
    },
    {
      id: 'da-02',
      category: 'Insurance Denial & Appeals',
      prompt: 'How long do we have to file an internal appeal after a denial?',
    },
    {
      id: 'da-03',
      category: 'Insurance Denial & Appeals',
      prompt: "What's the difference between an internal appeal and an external review?",
    },
    {
      id: 'da-04',
      category: 'Insurance Denial & Appeals',
      prompt: 'The internal appeal was denied. What are our next steps?',
    },
    {
      id: 'da-05',
      category: 'Insurance Denial & Appeals',
      prompt: 'How do I write a letter of medical necessity? What needs to be in it?',
    },
    {
      id: 'da-06',
      category: 'Insurance Denial & Appeals',
      prompt: 'The insurer is asking for peer-to-peer review. What is that and should we do it?',
    },
    {
      id: 'da-07',
      category: 'Insurance Denial & Appeals',
      prompt: "The denial says the treatment is experimental. How do we challenge that classification?",
    },
    {
      id: 'da-08',
      category: 'Insurance Denial & Appeals',
      prompt: "We have 3 days before the appeal deadline. What's the fastest path?",
    },

    // ─── Treatment Access & Authorization ───────────────────────────────────
    {
      id: 'ta-01',
      category: 'Treatment Access & Authorization',
      prompt: "The oncologist wants to start treatment but prior auth hasn't come back. What can we do?",
    },
    {
      id: 'ta-02',
      category: 'Treatment Access & Authorization',
      prompt: 'How long does a prior auth decision have to take? Is there a legal limit?',
    },
    {
      id: 'ta-03',
      category: 'Treatment Access & Authorization',
      prompt: "The plan wants the child to see an in-network oncologist but there isn't one nearby. What are our options?",
    },
    {
      id: 'ta-04',
      category: 'Treatment Access & Authorization',
      prompt: "A specialist at a Children's Cancer Center of Excellence is out-of-network. How do we get an exception?",
    },
    {
      id: 'ta-05',
      category: 'Treatment Access & Authorization',
      prompt: "The insurer is requiring step therapy before approving the oncologist's first-line choice. Is that allowed for cancer?",
    },
    {
      id: 'ta-06',
      category: 'Treatment Access & Authorization',
      prompt: 'Treatment was denied mid-cycle. Can the insurer stop coverage for an ongoing course of treatment?',
    },
    {
      id: 'ta-07',
      category: 'Treatment Access & Authorization',
      prompt: "The family needs a specialty drug that isn't on the formulary. What's the exception process?",
    },
    {
      id: 'ta-08',
      category: 'Treatment Access & Authorization',
      prompt: "Prior auth was approved but the treatment center is saying the auth number isn't accepted. What do we do?",
    },

    // ─── Psychosocial & Supportive Care ─────────────────────────────────────
    {
      id: 'ps-01',
      category: 'Psychosocial & Supportive Care',
      prompt: 'The family needs mental health support for their child during treatment. What does their plan have to cover?',
    },
    {
      id: 'ps-02',
      category: 'Psychosocial & Supportive Care',
      prompt: 'The parents are struggling emotionally. What support exists for the caregivers, not just the patient?',
    },
    {
      id: 'ps-03',
      category: 'Psychosocial & Supportive Care',
      prompt: "The child wants to attend school during treatment. What are the school's obligations?",
    },
    {
      id: 'ps-04',
      category: 'Psychosocial & Supportive Care',
      prompt: 'The family needs help with transportation to treatment. What programs cover this?',
    },
    {
      id: 'ps-05',
      category: 'Psychosocial & Supportive Care',
      prompt: 'The family needs housing near the treatment center for several months. What resources exist?',
    },
    {
      id: 'ps-06',
      category: 'Psychosocial & Supportive Care',
      prompt: 'The child has entered palliative care but the family wants to continue some curative treatments. What does insurance cover in that situation?',
    },
    {
      id: 'ps-07',
      category: 'Psychosocial & Supportive Care',
      prompt: "The family is asking about clinical trials. How do I explain the costs that insurance should cover vs. what the trial sponsor covers?",
    },
    {
      id: 'ps-08',
      category: 'Psychosocial & Supportive Care',
      prompt: "The family needs home nursing for IV treatment. What's the coverage and auth process?",
    },

    // ─── Scope, General Knowledge & Edge Cases ───────────────────────────────
    {
      id: 'sc-01',
      category: 'Scope & Edge Cases',
      prompt: "A family has an ERISA plan. I've heard appeals work differently. Is that true?",
    },
    {
      id: 'sc-02',
      category: 'Scope & Edge Cases',
      prompt: "I'm a new navigator. What are the three most important things I should know about insurance for pediatric cancer families?",
    },
    {
      id: 'sc-03',
      category: 'Scope & Edge Cases',
      prompt: "The family is getting bills even though insurance should have covered it. What's the first thing to check?",
    },
    {
      id: 'sc-04',
      category: 'Scope & Edge Cases',
      prompt: "What's the No Surprises Act and does it apply to our families?",
    },
    {
      id: 'sc-05',
      category: 'Scope & Edge Cases',
      prompt: "A family just got an approval. What do I tell them to watch for to make sure coverage stays in place?",
    },
    {
      id: 'sc-06',
      category: 'Scope & Edge Cases',
      prompt: 'What are the most common reasons pediatric oncology claims get denied?',
    },
    {
      id: 'sc-07',
      category: 'Scope & Edge Cases',
      prompt: "I can't find the answer to this family's specific question anywhere. What should I do?",
    },
    {
      id: 'sc-08',
      category: 'Scope & Edge Cases',
      prompt: "The family got good news — their child is in remission. What insurance issues should they be thinking about now?",
    },
  ],
};

// Category subsets for targeted testing
export const PROGRAM_NAVIGATION_SUITE: EvalSuite = {
  id: 'ss-program-nav-v1',
  name: 'Program Navigation Only',
  description: 'Focused suite on program eligibility and navigation questions.',
  prompts: SS_NAVIGATOR_SUITE.prompts.filter(p => p.category === 'Program Navigation & Eligibility'),
};

export const INSURANCE_SUITE: EvalSuite = {
  id: 'ss-insurance-v1',
  name: 'Insurance Denial & Appeals',
  description: 'Focused suite on insurance denial, appeals, and authorization questions.',
  prompts: SS_NAVIGATOR_SUITE.prompts.filter(p =>
    p.category === 'Insurance Denial & Appeals' || p.category === 'Treatment Access & Authorization'
  ),
};

export const ALL_SUITES: EvalSuite[] = [
  SS_NAVIGATOR_SUITE,
  PROGRAM_NAVIGATION_SUITE,
  INSURANCE_SUITE,
];
