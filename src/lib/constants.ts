export const APP_NAME = "SS Navigator";
export const APP_TAGLINE = "Your guide through the journey";
export const FOUNDATION_NAME = "Sebastian Strong Foundation";
export const FOUNDATION_URL = "https://www.sebastianstrong.org";

// Contact info
export const CONTACT_PHONE = "305-335-0894"; // Sebastian Strong Foundation
export const CONTACT_EMAIL = "oscar@sebastianstrong.org";
export const CONTACT_ADDRESS = "PO Box 661156, Miami Springs, FL 33266";

// Crisis resources (always visible)
export const CRISIS_RESOURCES = [
  {
    name: "988 Suicide & Crisis Lifeline",
    phone: "988",
    text: undefined as string | undefined,
    textNumber: undefined as string | undefined,
    url: "https://988lifeline.org",
  },
  {
    name: "Crisis Text Line",
    phone: undefined as string | undefined,
    text: "HOME",
    textNumber: "741741",
    url: "https://www.crisistextline.org",
  },
  {
    name: "CancerCare Helpline",
    phone: "1-800-813-4673",
    text: undefined as string | undefined,
    textNumber: undefined as string | undefined,
    url: "https://www.cancercare.org",
  },
];

// Social media
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/sebastianstrongfoundation",
  instagram: "https://instagram.com/sebastianstrongfoundation",
  twitter: "https://twitter.com/sebastianstrong",
  linkedin: "https://linkedin.com/company/sebastianstrong-foundation",
};

// Session timeout (ms)
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const SESSION_WARNING_MS = 5 * 60 * 1000;  // 5 minute warning

// Pagination
export const RESOURCES_PER_PAGE = 12;
export const MESSAGES_PER_PAGE = 50;
