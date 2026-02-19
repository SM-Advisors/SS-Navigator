export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          crisis_detected: boolean | null
          id: string
          metadata: Json | null
          resource_ids: string[] | null
          role: string
          suggested_prompts: string[] | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          crisis_detected?: boolean | null
          id?: string
          metadata?: Json | null
          resource_ids?: string[] | null
          role: string
          suggested_prompts?: string[] | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          crisis_detected?: boolean | null
          id?: string
          metadata?: Json | null
          resource_ids?: string[] | null
          role?: string
          suggested_prompts?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      channel_memberships: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_memberships_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      community_channels: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          slug: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          slug: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          metadata: Json | null
          parent_message_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          metadata?: Json | null
          parent_message_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          metadata?: Json | null
          parent_message_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          assigned_navigator_id: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          subject: string
          submission_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_navigator_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          subject: string
          submission_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_navigator_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          subject?: string
          submission_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          applicable_diagnoses: string[] | null
          applicable_stages: string[] | null
          applicable_states: string[] | null
          application_url: string | null
          category: Database["public"]["Enums"]["resource_category"]
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          is_crisis_resource: boolean | null
          is_featured: boolean | null
          last_verified_at: string | null
          long_description: string | null
          organization_email: string | null
          organization_name: string
          organization_phone: string | null
          organization_url: string | null
          priority_order: number | null
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          applicable_diagnoses?: string[] | null
          applicable_stages?: string[] | null
          applicable_states?: string[] | null
          application_url?: string | null
          category: Database["public"]["Enums"]["resource_category"]
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          is_crisis_resource?: boolean | null
          is_featured?: boolean | null
          last_verified_at?: string | null
          long_description?: string | null
          organization_email?: string | null
          organization_name: string
          organization_phone?: string | null
          organization_url?: string | null
          priority_order?: number | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          applicable_diagnoses?: string[] | null
          applicable_stages?: string[] | null
          applicable_states?: string[] | null
          application_url?: string | null
          category?: Database["public"]["Enums"]["resource_category"]
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          is_crisis_resource?: boolean | null
          is_featured?: boolean | null
          last_verified_at?: string | null
          long_description?: string | null
          organization_email?: string | null
          organization_name?: string
          organization_phone?: string | null
          organization_url?: string | null
          priority_order?: number | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_resources: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          additional_info: string | null
          child_first_name: string | null
          city: string | null
          created_at: string | null
          diagnosis: string | null
          diagnosis_date: string | null
          display_name: string | null
          id: string
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          priority_categories: string[] | null
          role: Database["public"]["Enums"]["user_role"] | null
          state: string | null
          tour_completed: boolean | null
          treatment_center: string | null
          treatment_stage: Database["public"]["Enums"]["treatment_stage"] | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          additional_info?: string | null
          child_first_name?: string | null
          city?: string | null
          created_at?: string | null
          diagnosis?: string | null
          diagnosis_date?: string | null
          display_name?: string | null
          id?: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          priority_categories?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          tour_completed?: boolean | null
          treatment_center?: string | null
          treatment_stage?:
            | Database["public"]["Enums"]["treatment_stage"]
            | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          additional_info?: string | null
          child_first_name?: string | null
          city?: string | null
          created_at?: string | null
          diagnosis?: string | null
          diagnosis_date?: string | null
          display_name?: string | null
          id?: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          priority_categories?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          tour_completed?: boolean | null
          treatment_center?: string | null
          treatment_stage?:
            | Database["public"]["Enums"]["treatment_stage"]
            | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["user_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
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
        | "sibling_support"
      treatment_stage:
        | "newly_diagnosed"
        | "in_treatment"
        | "post_treatment"
        | "survivorship"
        | "relapse"
        | "bereavement"
        | "prefer_not_to_say"
      user_role: "family_member" | "navigator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      resource_category: [
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
      ],
      treatment_stage: [
        "newly_diagnosed",
        "in_treatment",
        "post_treatment",
        "survivorship",
        "relapse",
        "bereavement",
        "prefer_not_to_say",
      ],
      user_role: ["family_member", "navigator", "admin"],
    },
  },
} as const
