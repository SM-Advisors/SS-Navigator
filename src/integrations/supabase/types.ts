// Auto-generated Supabase types
// Run: npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/integrations/supabase/types.ts
// after connecting your Supabase project

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    PostgrestVersion: "12";
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          role: "family_member" | "navigator" | "admin";
          child_first_name: string | null;
          diagnosis: string | null;
          diagnosis_date: string | null;
          treatment_stage:
            | "newly_diagnosed"
            | "in_treatment"
            | "post_treatment"
            | "survivorship"
            | "relapse"
            | "bereavement"
            | "prefer_not_to_say";
          treatment_center: string | null;
          state: string | null;
          city: string | null;
          zip_code: string | null;
          priority_categories: string[];
          notification_preferences: Json;
          onboarding_completed: boolean;
          tour_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          role?: "family_member" | "navigator" | "admin";
          child_first_name?: string | null;
          diagnosis?: string | null;
          diagnosis_date?: string | null;
          treatment_stage?:
            | "newly_diagnosed"
            | "in_treatment"
            | "post_treatment"
            | "survivorship"
            | "relapse"
            | "bereavement"
            | "prefer_not_to_say";
          treatment_center?: string | null;
          state?: string | null;
          city?: string | null;
          zip_code?: string | null;
          priority_categories?: string[];
          notification_preferences?: Json;
          onboarding_completed?: boolean;
          tour_completed?: boolean;
        };
        Update: {
          display_name?: string | null;
          role?: "family_member" | "navigator" | "admin";
          child_first_name?: string | null;
          diagnosis?: string | null;
          diagnosis_date?: string | null;
          treatment_stage?:
            | "newly_diagnosed"
            | "in_treatment"
            | "post_treatment"
            | "survivorship"
            | "relapse"
            | "bereavement"
            | "prefer_not_to_say";
          treatment_center?: string | null;
          state?: string | null;
          city?: string | null;
          zip_code?: string | null;
          priority_categories?: string[];
          notification_preferences?: Json;
          onboarding_completed?: boolean;
          tour_completed?: boolean;
        };
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
        };
        Update: Record<string, never>;
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string;
          long_description: string | null;
          category:
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
          subcategory: string | null;
          organization_name: string;
          organization_url: string | null;
          organization_phone: string | null;
          organization_email: string | null;
          applicable_states: string[];
          applicable_stages: string[];
          applicable_diagnoses: string[];
          age_range_min: number | null;
          age_range_max: number | null;
          tags: string[];
          is_featured: boolean;
          is_active: boolean;
          is_crisis_resource: boolean;
          priority_order: number;
          application_url: string | null;
          created_at: string;
          updated_at: string;
          last_verified_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          long_description?: string | null;
          category:
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
          subcategory?: string | null;
          organization_name: string;
          organization_url?: string | null;
          organization_phone?: string | null;
          organization_email?: string | null;
          applicable_states?: string[];
          applicable_stages?: string[];
          applicable_diagnoses?: string[];
          age_range_min?: number | null;
          age_range_max?: number | null;
          tags?: string[];
          is_featured?: boolean;
          is_active?: boolean;
          is_crisis_resource?: boolean;
          priority_order?: number;
          application_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["resources"]["Insert"]>;
      };
      saved_resources: {
        Row: {
          id: string;
          user_id: string;
          resource_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resource_id: string;
          notes?: string | null;
        };
        Update: {
          notes?: string | null;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          is_active?: boolean;
        };
        Update: {
          title?: string | null;
          is_active?: boolean;
        };
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          resource_ids: string[];
          suggested_prompts: string[];
          crisis_detected: boolean;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          resource_ids?: string[];
          suggested_prompts?: string[];
          crisis_detected?: boolean;
          metadata?: Json;
        };
        Update: Record<string, never>;
      };
      community_channels: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          category: string | null;
          display_order: number;
          is_active: boolean;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          category?: string | null;
          display_order?: number;
          is_active?: boolean;
          is_default?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["community_channels"]["Insert"]>;
      };
      community_messages: {
        Row: {
          id: string;
          channel_id: string;
          user_id: string;
          content: string;
          is_edited: boolean;
          is_deleted: boolean;
          parent_message_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          user_id: string;
          content: string;
          is_edited?: boolean;
          is_deleted?: boolean;
          parent_message_id?: string | null;
          metadata?: Json;
        };
        Update: {
          content?: string;
          is_edited?: boolean;
          is_deleted?: boolean;
        };
      };
      channel_memberships: {
        Row: {
          id: string;
          channel_id: string;
          user_id: string;
          last_read_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          user_id: string;
          last_read_at?: string;
        };
        Update: {
          last_read_at?: string;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          submission_type: string;
          status: string;
          assigned_navigator_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          submission_type?: string;
          status?: string;
          assigned_navigator_id?: string | null;
          notes?: string | null;
        };
        Update: {
          status?: string;
          assigned_navigator_id?: string | null;
          notes?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      treatment_stage:
        | "newly_diagnosed"
        | "in_treatment"
        | "post_treatment"
        | "survivorship"
        | "relapse"
        | "bereavement"
        | "prefer_not_to_say";
      user_role: "family_member" | "navigator" | "admin";
      resource_category:
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
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
