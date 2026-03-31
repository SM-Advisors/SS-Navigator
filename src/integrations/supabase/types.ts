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
      agent_test_conversations: {
        Row: {
          agent_id: string
          created_at: string
          evaluation_notes: string | null
          id: string
          messages: Json
          result: string | null
          test_type: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          evaluation_notes?: string | null
          id?: string
          messages?: Json
          result?: string | null
          test_type?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          evaluation_notes?: string | null
          id?: string
          messages?: Json
          result?: string | null
          test_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_test_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "user_agents"
            referencedColumns: ["id"]
          },
        ]
      }
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
      community_replies: {
        Row: {
          author_name: string
          author_role: string | null
          body: string
          created_at: string
          id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          body: string
          created_at?: string
          id?: string
          topic_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          body?: string
          created_at?: string
          id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "community_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      community_topics: {
        Row: {
          author_name: string
          author_role: string | null
          body: string
          created_at: string
          id: string
          reply_count: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          body: string
          created_at?: string
          id?: string
          reply_count?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          body?: string
          created_at?: string
          id?: string
          reply_count?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      dashboard_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      eval_comparisons: {
        Row: {
          base_run_id: string
          comp_run_id: string
          created_at: string
          created_by: string | null
          grounding_changes: number
          id: string
          improvements: number
          notes: string | null
          regressions: number
          title: string
        }
        Insert: {
          base_run_id: string
          comp_run_id: string
          created_at?: string
          created_by?: string | null
          grounding_changes?: number
          id?: string
          improvements?: number
          notes?: string | null
          regressions?: number
          title?: string
        }
        Update: {
          base_run_id?: string
          comp_run_id?: string
          created_at?: string
          created_by?: string | null
          grounding_changes?: number
          id?: string
          improvements?: number
          notes?: string | null
          regressions?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "eval_comparisons_base_run_id_fkey"
            columns: ["base_run_id"]
            isOneToOne: false
            referencedRelation: "eval_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eval_comparisons_comp_run_id_fkey"
            columns: ["comp_run_id"]
            isOneToOne: false
            referencedRelation: "eval_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      eval_results: {
        Row: {
          category: string
          created_at: string | null
          error_message: string | null
          full_system_prompt: string | null
          grounded_in_sources: boolean | null
          id: string
          latency_ms: number | null
          prompt_id: string
          prompt_text: string
          reply: string | null
          response_length: number | null
          retrieved_chunks: Json | null
          run_id: string
          sources: Json | null
          status: string
          suggested_prompts: string[] | null
          user_messages: Json | null
        }
        Insert: {
          category: string
          created_at?: string | null
          error_message?: string | null
          full_system_prompt?: string | null
          grounded_in_sources?: boolean | null
          id?: string
          latency_ms?: number | null
          prompt_id: string
          prompt_text: string
          reply?: string | null
          response_length?: number | null
          retrieved_chunks?: Json | null
          run_id: string
          sources?: Json | null
          status?: string
          suggested_prompts?: string[] | null
          user_messages?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          error_message?: string | null
          full_system_prompt?: string | null
          grounded_in_sources?: boolean | null
          id?: string
          latency_ms?: number | null
          prompt_id?: string
          prompt_text?: string
          reply?: string | null
          response_length?: number | null
          retrieved_chunks?: Json | null
          run_id?: string
          sources?: Json | null
          status?: string
          suggested_prompts?: string[] | null
          user_messages?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "eval_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "eval_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      eval_runs: {
        Row: {
          avg_latency_ms: number | null
          avg_response_length: number | null
          completed_at: string | null
          created_at: string | null
          error_count: number | null
          grounded_count: number | null
          id: string
          kb_version: string | null
          model: string
          notes: string | null
          prompt_version: string
          retrieval_count: number
          retrieval_threshold: number
          run_by: string | null
          started_at: string | null
          status: string
          success_count: number | null
          suite_id: string
          suite_name: string
          total_prompts: number | null
          unique_sources_used: number | null
        }
        Insert: {
          avg_latency_ms?: number | null
          avg_response_length?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_count?: number | null
          grounded_count?: number | null
          id?: string
          kb_version?: string | null
          model?: string
          notes?: string | null
          prompt_version?: string
          retrieval_count?: number
          retrieval_threshold?: number
          run_by?: string | null
          started_at?: string | null
          status?: string
          success_count?: number | null
          suite_id: string
          suite_name: string
          total_prompts?: number | null
          unique_sources_used?: number | null
        }
        Update: {
          avg_latency_ms?: number | null
          avg_response_length?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_count?: number | null
          grounded_count?: number | null
          id?: string
          kb_version?: string | null
          model?: string
          notes?: string | null
          prompt_version?: string
          retrieval_count?: number
          retrieval_threshold?: number
          run_by?: string | null
          started_at?: string | null
          status?: string
          success_count?: number | null
          suite_id?: string
          suite_name?: string
          total_prompts?: number | null
          unique_sources_used?: number | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          applicable_states: string[] | null
          category: string | null
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string
          document_title: string
          embedding: string | null
          id: string
          metadata: Json | null
          program: string | null
          resource_type: string | null
          search_vector: unknown
          source_url: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          applicable_states?: string[] | null
          category?: string | null
          chunk_index?: number
          content: string
          created_at?: string | null
          document_id: string
          document_title: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          program?: string | null
          resource_type?: string | null
          search_vector?: unknown
          source_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          applicable_states?: string[] | null
          category?: string | null
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string
          document_title?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          program?: string | null
          resource_type?: string | null
          search_vector?: unknown
          source_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      practice_conversations: {
        Row: {
          created_at: string
          id: string
          is_submitted: boolean
          messages: Json
          module_id: string
          session_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_submitted?: boolean
          messages?: Json
          module_id: string
          session_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_submitted?: boolean
          messages?: Json
          module_id?: string
          session_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registration_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          organization_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          organization_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          city: string | null
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          is_crisis_resource: boolean | null
          is_featured: boolean | null
          last_verified_at: string | null
          latitude: number | null
          long_description: string | null
          longitude: number | null
          organization_email: string | null
          organization_name: string
          organization_phone: string | null
          organization_url: string | null
          priority_order: number | null
          search_vector: unknown
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
          city?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          is_crisis_resource?: boolean | null
          is_featured?: boolean | null
          last_verified_at?: string | null
          latitude?: number | null
          long_description?: string | null
          longitude?: number | null
          organization_email?: string | null
          organization_name: string
          organization_phone?: string | null
          organization_url?: string | null
          priority_order?: number | null
          search_vector?: unknown
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
          city?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          is_crisis_resource?: boolean | null
          is_featured?: boolean | null
          last_verified_at?: string | null
          latitude?: number | null
          long_description?: string | null
          longitude?: number | null
          organization_email?: string | null
          organization_name?: string
          organization_phone?: string | null
          organization_url?: string | null
          priority_order?: number | null
          search_vector?: unknown
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
      user_agents: {
        Row: {
          created_at: string
          deployed_at: string | null
          description: string | null
          id: string
          is_deployed: boolean
          is_shared: boolean
          last_test_results: Json | null
          name: string
          parent_version_id: string | null
          shared_at: string | null
          status: string
          system_prompt: string
          template_data: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          deployed_at?: string | null
          description?: string | null
          id?: string
          is_deployed?: boolean
          is_shared?: boolean
          last_test_results?: Json | null
          name?: string
          parent_version_id?: string | null
          shared_at?: string | null
          status?: string
          system_prompt?: string
          template_data?: Json
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          deployed_at?: string | null
          description?: string | null
          id?: string
          is_deployed?: boolean
          is_shared?: boolean
          last_test_results?: Json | null
          name?: string
          parent_version_id?: string | null
          shared_at?: string | null
          status?: string
          system_prompt?: string
          template_data?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_agents_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "user_agents"
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
          last_login_at: string | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          organization_id: string | null
          priority_categories: string[] | null
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
          last_login_at?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          priority_categories?: string[] | null
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
          last_login_at?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          priority_categories?: string[] | null
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
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
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
      match_knowledge_base: {
        Args: {
          filter_category?: string
          filter_program?: string
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          applicable_states: string[]
          category: string
          chunk_index: number
          content: string
          document_id: string
          document_title: string
          id: string
          metadata: Json
          program: string
          resource_type: string
          similarity: number
          source_url: string
          tags: string[]
        }[]
      }
      match_knowledge_base_fts: {
        Args: {
          filter_category?: string
          filter_program?: string
          match_count?: number
          query_text: string
        }
        Returns: {
          applicable_states: string[]
          category: string
          chunk_index: number
          content: string
          document_id: string
          document_title: string
          id: string
          metadata: Json
          program: string
          resource_type: string
          similarity: number
          source_url: string
          tags: string[]
        }[]
      }
      match_lesson_chunks: {
        Args: {
          filter_lesson_id?: string
          filter_module_id?: string
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          id: string
          metadata: Json
          similarity: number
          source: string
          text: string
        }[]
      }
      resources_within_radius: {
        Args: {
          fallback_state?: string
          radius_miles: number
          user_lat: number
          user_lng: number
        }
        Returns: {
          distance_miles: number
          resource_id: string
        }[]
      }
      validate_registration_code: {
        Args: { input_code: string }
        Returns: Json
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
