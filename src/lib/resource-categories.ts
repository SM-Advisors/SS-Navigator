import {
  DollarSign,
  Stethoscope,
  Heart,
  Home,
  Scale,
  GraduationCap,
  Users,
  Compass,
  Sun,
  Baby,
  type LucideIcon,
} from "lucide-react";

export type ResourceCategory =
  | "financial"
  | "medical"
  | "emotional"
  | "practical"
  | "legal"
  | "educational"
  | "community"
  | "navigation"
  | "survivorship"
  | "sibling_support";

export interface CategoryConfig {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;       // Tailwind bg color class
  textColor: string;   // Tailwind text color class
  borderColor: string; // Tailwind border color class
}

export const RESOURCE_CATEGORIES: Record<ResourceCategory, CategoryConfig> = {
  financial: {
    label: "Financial Help",
    description: "Grants, assistance programs, and financial planning",
    icon: DollarSign,
    color: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  medical: {
    label: "Medical Information",
    description: "Treatment options, clinical trials, and second opinions",
    icon: Stethoscope,
    color: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  emotional: {
    label: "Emotional Support",
    description: "Mental health, counseling, and coping resources",
    icon: Heart,
    color: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
  },
  practical: {
    label: "Practical Help",
    description: "Housing, transportation, meals, and daily needs",
    icon: Home,
    color: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  legal: {
    label: "Legal & Admin",
    description: "FMLA, insurance appeals, rights, and legal support",
    icon: Scale,
    color: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
  },
  educational: {
    label: "School & Education",
    description: "IEPs, 504 plans, homebound education, and school re-entry",
    icon: GraduationCap,
    color: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
  },
  community: {
    label: "Community",
    description: "Support groups, camps, and connecting with other families",
    icon: Users,
    color: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
  },
  navigation: {
    label: "Navigation & Care",
    description: "Care coordinators, patient advocates, and navigators",
    icon: Compass,
    color: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  survivorship: {
    label: "Survivorship",
    description: "Long-term follow-up, late effects, and life after treatment",
    icon: Sun,
    color: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
  },
  sibling_support: {
    label: "Sibling Support",
    description: "Resources for brothers and sisters of children with cancer",
    icon: Baby,
    color: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
  },
};

export const CATEGORY_LIST = Object.entries(RESOURCE_CATEGORIES).map(
  ([key, value]) => ({ key: key as ResourceCategory, ...value })
);
