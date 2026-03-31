import type { Tables } from "@/integrations/supabase/types";

export type AIConversation = Tables<"ai_conversations">;
export type AIMessage = Tables<"ai_messages">;

export interface SherpaRequest {
  conversationId: string;
  messages: { role: "user" | "assistant"; content: string }[];
  userContext?: {
    treatmentStage?: string;
    diagnosis?: string;
    state?: string;
    priorityCategories?: string[];
  };
}

export interface ReferencedResource {
  id: string;
  title: string;
  organization_name: string;
  category: string;
  organization_url?: string | null;
  organization_phone?: string | null;
  description: string;
}

export interface DraftEmail {
  to: string;
  subject: string;
  body: string;
}

export interface SherpaResponse {
  reply: string;
  suggestedPrompts: string[];
  referencedResources: ReferencedResource[];
  crisisDetected: boolean;
  draftEmail?: DraftEmail;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  referencedResources?: ReferencedResource[];
  suggestedPrompts?: string[];
  crisisDetected?: boolean;
  created_at: string;
}
