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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          belt: string
          created_at: string | null
          credits_used: number | null
          degree: number | null
          graduated_by: string
          graduation_date: string
          hash: string
          id: string
          notes: string | null
          practitioner_id: string
          school_id: string
        }
        Insert: {
          belt: string
          created_at?: string | null
          credits_used?: number | null
          degree?: number | null
          graduated_by: string
          graduation_date: string
          hash: string
          id?: string
          notes?: string | null
          practitioner_id: string
          school_id: string
        }
        Update: {
          belt?: string
          created_at?: string | null
          credits_used?: number | null
          degree?: number | null
          graduated_by?: string
          graduation_date?: string
          hash?: string
          id?: string
          notes?: string | null
          practitioner_id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools_public"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          organization: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          organization?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          organization?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          achievement_id: string | null
          amount: number
          created_at: string | null
          id: string
          package_name: string | null
          payment_id: string | null
          price_brl: number | null
          school_id: string
          status: string
          type: string
        }
        Insert: {
          achievement_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          package_name?: string | null
          payment_id?: string | null
          price_brl?: number | null
          school_id: string
          status?: string
          type: string
        }
        Update: {
          achievement_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          package_name?: string | null
          payment_id?: string | null
          price_brl?: number | null
          school_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools_public"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          balance: number
          id: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          balance?: number
          id?: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          balance?: number
          id?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credits_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools_public"
            referencedColumns: ["id"]
          },
        ]
      }
      head_coaches: {
        Row: {
          created_at: string | null
          graduation: string
          id: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          graduation?: string
          id?: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          graduation?: string
          id?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "head_coaches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "head_coaches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools_public"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioners: {
        Row: {
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          current_belt: string | null
          father_name: string | null
          first_name: string
          fp_id: string
          gender: string | null
          id: string
          last_name: string
          martial_art: string
          mother_name: string | null
          photo_url: string | null
          school_id: string
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          current_belt?: string | null
          father_name?: string | null
          first_name: string
          fp_id: string
          gender?: string | null
          id?: string
          last_name: string
          martial_art?: string
          mother_name?: string | null
          photo_url?: string | null
          school_id: string
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          current_belt?: string | null
          father_name?: string | null
          first_name?: string
          fp_id?: string
          gender?: string | null
          id?: string
          last_name?: string
          martial_art?: string
          mother_name?: string | null
          photo_url?: string | null
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioners_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioners_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools_public"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          city: string | null
          created_at: string | null
          email: string
          id: string
          is_admin: boolean
          is_suspended: boolean
          logo_url: string | null
          martial_art: string
          name: string
          state: string | null
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_admin?: boolean
          is_suspended?: boolean
          logo_url?: string | null
          martial_art?: string
          name: string
          state?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean
          is_suspended?: boolean
          logo_url?: string | null
          martial_art?: string
          name?: string
          state?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          author_id: string
          author_type: string
          content: string
          created_at: string
          id: string
          read_by_recipient: boolean
          ticket_id: string
        }
        Insert: {
          author_id: string
          author_type: string
          content: string
          created_at?: string
          id?: string
          read_by_recipient?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string
          author_type?: string
          content?: string
          created_at?: string
          id?: string
          read_by_recipient?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          closed_at: string | null
          created_at: string
          id: string
          last_message_at: string
          priority: string
          resolved_at: string | null
          school_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          category?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          priority?: string
          resolved_at?: string | null
          school_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          priority?: string
          resolved_at?: string | null
          school_id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      achievements_public: {
        Row: {
          belt: string | null
          created_at: string | null
          degree: number | null
          graduated_by: string | null
          graduation_date: string | null
          hash: string | null
          id: string | null
          notes: string | null
          practitioner_id: string | null
          school_id: string | null
        }
        Insert: {
          belt?: string | null
          created_at?: string | null
          degree?: number | null
          graduated_by?: string | null
          graduation_date?: string | null
          hash?: string | null
          id?: string | null
          notes?: string | null
          practitioner_id?: string | null
          school_id?: string | null
        }
        Update: {
          belt?: string | null
          created_at?: string | null
          degree?: number | null
          graduated_by?: string | null
          graduation_date?: string | null
          hash?: string | null
          id?: string | null
          notes?: string | null
          practitioner_id?: string | null
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools_public"
            referencedColumns: ["id"]
          },
        ]
      }
      head_coaches_public: {
        Row: {
          created_at: string | null
          graduation: string | null
          id: string | null
          name: string | null
          school_id: string | null
        }
        Insert: {
          created_at?: string | null
          graduation?: string | null
          id?: string | null
          name?: string | null
          school_id?: string | null
        }
        Update: {
          created_at?: string | null
          graduation?: string | null
          id?: string | null
          name?: string | null
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "head_coaches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "head_coaches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools_public"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioners_public: {
        Row: {
          created_at: string | null
          current_belt: string | null
          first_name: string | null
          fp_id: string | null
          id: string | null
          last_name: string | null
          martial_art: string | null
          photo_url: string | null
          school_id: string | null
          school_martial_art: string | null
          school_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioners_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioners_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools_public"
            referencedColumns: ["id"]
          },
        ]
      }
      schools_public: {
        Row: {
          city: string | null
          created_at: string | null
          id: string | null
          logo_url: string | null
          martial_art: string | null
          name: string | null
          state: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string | null
          logo_url?: string | null
          martial_art?: string | null
          name?: string | null
          state?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string | null
          logo_url?: string | null
          martial_art?: string | null
          name?: string | null
          state?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_credits: {
        Args: { p_amount: number; p_school_id: string }
        Returns: undefined
      }
      admin_achievements_by_art: {
        Args: { p_end: string; p_start: string }
        Returns: {
          martial_art: string
          total: number
        }[]
      }
      admin_audit_log_actions: {
        Args: never
        Returns: {
          action: string
        }[]
      }
      admin_awaiting_admin_count: { Args: never; Returns: number }
      admin_finance_overview: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      admin_finance_top_schools: {
        Args: { p_end: string; p_limit?: number; p_start: string }
        Returns: {
          school_id: string
          school_name: string
          total_revenue: number
          tx_count: number
        }[]
      }
      admin_get_overview: { Args: never; Returns: Json }
      admin_get_practitioner: {
        Args: { p_practitioner_id: string }
        Returns: Json
      }
      admin_get_school: { Args: { p_school_id: string }; Returns: Json }
      admin_grant_bonus_credits: {
        Args: { p_amount: number; p_reason: string; p_school_id: string }
        Returns: undefined
      }
      admin_growth_monthly: {
        Args: never
        Returns: {
          month: string
          practitioners_count: number
          schools_count: number
        }[]
      }
      admin_list_achievements: {
        Args: {
          p_belt?: string
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_martial_art?: string
          p_offset?: number
          p_school_id?: string
          p_search?: string
        }
        Returns: {
          belt: string
          created_at: string
          degree: number
          fp_id: string
          graduated_by: string
          graduation_date: string
          hash: string
          id: string
          martial_art: string
          practitioner_id: string
          practitioner_name: string
          school_id: string
          school_name: string
          total_count: number
        }[]
      }
      admin_list_audit_log: {
        Args: {
          p_action?: string
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_target_id?: string
          p_target_type?: string
        }
        Returns: {
          action: string
          admin_id: string
          admin_name: string
          created_at: string
          id: string
          ip_address: string
          metadata: Json
          target_id: string
          target_name: string
          target_type: string
          total_count: number
          user_agent: string
        }[]
      }
      admin_list_practitioners: {
        Args: {
          p_belt?: string
          p_date_from?: string
          p_date_to?: string
          p_dir?: string
          p_limit?: number
          p_martial_art?: string
          p_offset?: number
          p_school_id?: string
          p_search?: string
          p_sort?: string
        }
        Returns: {
          achievements_count: number
          cpf: string
          created_at: string
          current_belt: string
          first_name: string
          fp_id: string
          id: string
          last_name: string
          martial_art: string
          school_id: string
          school_name: string
          total_count: number
        }[]
      }
      admin_list_schools: {
        Args: {
          p_credits?: string
          p_date_from?: string
          p_date_to?: string
          p_dir?: string
          p_limit?: number
          p_martial_art?: string
          p_offset?: number
          p_search?: string
          p_sort?: string
          p_state?: string
          p_status?: string
        }
        Returns: {
          balance: number
          city: string
          created_at: string
          email: string
          head_coach: string
          id: string
          is_admin: boolean
          is_suspended: boolean
          martial_art: string
          name: string
          state: string
          total_count: number
          total_spent: number
        }[]
      }
      admin_list_support_tickets: {
        Args: { p_status?: string }
        Returns: {
          category: string
          created_at: string
          id: string
          last_message_at: string
          preview: string
          priority: string
          school_id: string
          school_name: string
          status: string
          subject: string
          unread_for_admin: number
        }[]
      }
      admin_log_action: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_target_id: string
          p_target_type: string
        }
        Returns: undefined
      }
      admin_open_tickets_count: { Args: never; Returns: number }
      admin_practitioner_achievements: {
        Args: { p_practitioner_id: string }
        Returns: {
          belt: string
          created_at: string
          degree: number
          graduated_by: string
          graduation_date: string
          hash: string
          id: string
          notes: string
          school_id: string
          school_name: string
        }[]
      }
      admin_reactivate_school: {
        Args: { p_reason: string; p_school_id: string }
        Returns: undefined
      }
      admin_recent_schools: {
        Args: never
        Returns: {
          city: string
          created_at: string
          email: string
          name: string
          school_id: string
          state: string
        }[]
      }
      admin_resolve_ticket: {
        Args: { p_ticket_id: string }
        Returns: undefined
      }
      admin_revenue_monthly: {
        Args: never
        Returns: {
          month: string
          revenue: number
        }[]
      }
      admin_school_achievements: {
        Args: { p_school_id: string }
        Returns: {
          belt: string
          created_at: string
          degree: number
          fp_id: string
          graduated_by: string
          graduation_date: string
          id: string
          practitioner_name: string
        }[]
      }
      admin_school_audit: {
        Args: { p_school_id: string }
        Returns: {
          action: string
          admin_id: string
          admin_name: string
          created_at: string
          id: string
          metadata: Json
        }[]
      }
      admin_school_practitioners: {
        Args: { p_school_id: string }
        Returns: {
          created_at: string
          current_belt: string
          first_name: string
          fp_id: string
          id: string
          last_name: string
          martial_art: string
        }[]
      }
      admin_school_tickets: {
        Args: { p_school_id: string }
        Returns: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }[]
      }
      admin_school_transactions: {
        Args: { p_school_id: string }
        Returns: {
          amount: number
          created_at: string
          id: string
          package_name: string
          payment_id: string
          price_brl: number
          status: string
          type: string
        }[]
      }
      admin_suspend_school: {
        Args: { p_reason: string; p_school_id: string }
        Returns: undefined
      }
      admin_update_practitioner: {
        Args: { p_changes: Json; p_practitioner_id: string; p_reason: string }
        Returns: undefined
      }
      admin_zero_balance_schools: {
        Args: never
        Returns: {
          balance: number
          email: string
          name: string
          school_id: string
          updated_at: string
        }[]
      }
      generate_achievement_hash: {
        Args: {
          p_belt: string
          p_date: string
          p_fp_id: string
          p_professor: string
          p_school: string
        }
        Returns: string
      }
      generate_fp_id: { Args: never; Returns: string }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      mark_messages_read: {
        Args: { p_role: string; p_ticket_id: string }
        Returns: undefined
      }
      school_unread_messages_count: { Args: never; Returns: number }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
