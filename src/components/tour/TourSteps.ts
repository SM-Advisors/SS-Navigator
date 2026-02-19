import type { Step } from 'react-joyride';

export const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="crisis-banner"]',
    title: 'Crisis Support — Always Here',
    content:
      'This banner is always at the top of the app. In any moment of crisis, you can call 988 or text HOME to 741741 for free, confidential support 24/7.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-resources"]',
    title: 'Resource Directory',
    content:
      'Browse hundreds of vetted resources organized by category — financial assistance, medical support, emotional care, legal help, and more. Bookmark anything useful for later.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-sherpa"]',
    title: 'Hope — Your AI Sherpa',
    content:
      'Hope is our compassionate AI guide. Ask her anything — about resources, navigating the system, or what questions to ask your medical team. She\'ll point you in the right direction.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-community"]',
    title: 'Community Hub',
    content:
      'Connect with other families who truly understand. Chat in topic-based channels — from Newly Diagnosed to Survivorship to Siblings. You\'re not alone.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-saved"]',
    title: 'Saved Resources',
    content:
      'Any resource you bookmark appears here. Build your personal library of helpful programs and organizations.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="contact-navigator"]',
    title: 'Talk to a Real Navigator',
    content:
      'This button appears throughout the app. Our nurse navigators provide free, personalized support — no appointment needed. Reach out anytime.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-profile"]',
    title: 'Your Profile',
    content:
      'Keep your profile updated to get the most relevant resources for your location and stage. You can also replay this tour anytime from your profile page.',
    placement: 'right',
    disableBeacon: true,
  },
];
