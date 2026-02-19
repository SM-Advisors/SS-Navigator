// Client-side crisis keyword detection
// Used as a first-pass check before sending messages to the AI Sherpa
// The AI also detects crisis independently via its system prompt

export const CRISIS_KEYWORDS = [
  // Suicidal ideation
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "want to die",
  "don't want to live",
  "not worth living",
  "better off dead",
  "no reason to live",

  // Self harm
  "self harm",
  "self-harm",
  "hurt myself",
  "cutting",
  "harming myself",

  // Hopelessness (high severity)
  "can't go on",
  "cannot go on",
  "give up on everything",
  "nothing to live for",

  // Crisis language
  "in crisis",
  "mental breakdown",
  "falling apart",
];

export function detectCrisis(message: string): boolean {
  const lower = message.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}
