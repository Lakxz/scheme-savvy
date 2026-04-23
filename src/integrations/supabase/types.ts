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
      deadline_notifications: {
        Row: {
          days_before: number
          id: string
          scheme_id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          days_before: number
          id?: string
          scheme_id: string
          sent_at?: string
          user_id: string
        }
        Update: {
          days_before?: number
          id?: string
          scheme_id?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadline_notifications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          scheme_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          scheme_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          scheme_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          annual_income: number | null
          category: Database["public"]["Enums"]["category_type"] | null
          created_at: string | null
          dependents: number | null
          disability: Database["public"]["Enums"]["disability_type"] | null
          district: string | null
          education: Database["public"]["Enums"]["education_type"] | null
          email_alerts: boolean | null
          farmer_type: Database["public"]["Enums"]["farmer_type"] | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          has_aadhaar: boolean | null
          has_bank_account: boolean | null
          id: string
          is_bpl: boolean | null
          is_minority: boolean | null
          land_acres: number | null
          marital_status:
            | Database["public"]["Enums"]["marital_status_type"]
            | null
          occupation: Database["public"]["Enums"]["occupation_type"] | null
          ration_card: Database["public"]["Enums"]["ration_card_type"] | null
          religion: string | null
          state: string | null
          sub_caste: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          annual_income?: number | null
          category?: Database["public"]["Enums"]["category_type"] | null
          created_at?: string | null
          dependents?: number | null
          disability?: Database["public"]["Enums"]["disability_type"] | null
          district?: string | null
          education?: Database["public"]["Enums"]["education_type"] | null
          email_alerts?: boolean | null
          farmer_type?: Database["public"]["Enums"]["farmer_type"] | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          has_aadhaar?: boolean | null
          has_bank_account?: boolean | null
          id?: string
          is_bpl?: boolean | null
          is_minority?: boolean | null
          land_acres?: number | null
          marital_status?:
            | Database["public"]["Enums"]["marital_status_type"]
            | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          ration_card?: Database["public"]["Enums"]["ration_card_type"] | null
          religion?: string | null
          state?: string | null
          sub_caste?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          annual_income?: number | null
          category?: Database["public"]["Enums"]["category_type"] | null
          created_at?: string | null
          dependents?: number | null
          disability?: Database["public"]["Enums"]["disability_type"] | null
          district?: string | null
          education?: Database["public"]["Enums"]["education_type"] | null
          email_alerts?: boolean | null
          farmer_type?: Database["public"]["Enums"]["farmer_type"] | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          has_aadhaar?: boolean | null
          has_bank_account?: boolean | null
          id?: string
          is_bpl?: boolean | null
          is_minority?: boolean | null
          land_acres?: number | null
          marital_status?:
            | Database["public"]["Enums"]["marital_status_type"]
            | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          ration_card?: Database["public"]["Enums"]["ration_card_type"] | null
          religion?: string | null
          state?: string | null
          sub_caste?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      schemes: {
        Row: {
          application_deadline: string | null
          application_url: string | null
          benefits: string | null
          benefits_ta: string | null
          bpl_only: boolean | null
          categories: Database["public"]["Enums"]["category_type"][] | null
          created_at: string | null
          description: string | null
          description_ta: string | null
          disabilities: Database["public"]["Enums"]["disability_type"][] | null
          documents_required: string[] | null
          education_levels:
            | Database["public"]["Enums"]["education_type"][]
            | null
          farmer_types: Database["public"]["Enums"]["farmer_type"][] | null
          gender: Database["public"]["Enums"]["gender_type"][] | null
          id: string
          is_active: boolean | null
          marital_statuses:
            | Database["public"]["Enums"]["marital_status_type"][]
            | null
          max_age: number | null
          max_income: number | null
          max_land_acres: number | null
          min_age: number | null
          ministry: string
          ministry_ta: string | null
          minority_only: boolean | null
          name: string
          name_ta: string | null
          occupations: Database["public"]["Enums"]["occupation_type"][] | null
          ration_cards: Database["public"]["Enums"]["ration_card_type"][] | null
          religions: string[] | null
          requires_aadhaar: boolean | null
          requires_bank_account: boolean | null
          scheme_level: Database["public"]["Enums"]["scheme_level"]
          states: string[] | null
          updated_at: string | null
        }
        Insert: {
          application_deadline?: string | null
          application_url?: string | null
          benefits?: string | null
          benefits_ta?: string | null
          bpl_only?: boolean | null
          categories?: Database["public"]["Enums"]["category_type"][] | null
          created_at?: string | null
          description?: string | null
          description_ta?: string | null
          disabilities?: Database["public"]["Enums"]["disability_type"][] | null
          documents_required?: string[] | null
          education_levels?:
            | Database["public"]["Enums"]["education_type"][]
            | null
          farmer_types?: Database["public"]["Enums"]["farmer_type"][] | null
          gender?: Database["public"]["Enums"]["gender_type"][] | null
          id?: string
          is_active?: boolean | null
          marital_statuses?:
            | Database["public"]["Enums"]["marital_status_type"][]
            | null
          max_age?: number | null
          max_income?: number | null
          max_land_acres?: number | null
          min_age?: number | null
          ministry: string
          ministry_ta?: string | null
          minority_only?: boolean | null
          name: string
          name_ta?: string | null
          occupations?: Database["public"]["Enums"]["occupation_type"][] | null
          ration_cards?:
            | Database["public"]["Enums"]["ration_card_type"][]
            | null
          religions?: string[] | null
          requires_aadhaar?: boolean | null
          requires_bank_account?: boolean | null
          scheme_level?: Database["public"]["Enums"]["scheme_level"]
          states?: string[] | null
          updated_at?: string | null
        }
        Update: {
          application_deadline?: string | null
          application_url?: string | null
          benefits?: string | null
          benefits_ta?: string | null
          bpl_only?: boolean | null
          categories?: Database["public"]["Enums"]["category_type"][] | null
          created_at?: string | null
          description?: string | null
          description_ta?: string | null
          disabilities?: Database["public"]["Enums"]["disability_type"][] | null
          documents_required?: string[] | null
          education_levels?:
            | Database["public"]["Enums"]["education_type"][]
            | null
          farmer_types?: Database["public"]["Enums"]["farmer_type"][] | null
          gender?: Database["public"]["Enums"]["gender_type"][] | null
          id?: string
          is_active?: boolean | null
          marital_statuses?:
            | Database["public"]["Enums"]["marital_status_type"][]
            | null
          max_age?: number | null
          max_income?: number | null
          max_land_acres?: number | null
          min_age?: number | null
          ministry?: string
          ministry_ta?: string | null
          minority_only?: boolean | null
          name?: string
          name_ta?: string | null
          occupations?: Database["public"]["Enums"]["occupation_type"][] | null
          ration_cards?:
            | Database["public"]["Enums"]["ration_card_type"][]
            | null
          religions?: string[] | null
          requires_aadhaar?: boolean | null
          requires_bank_account?: boolean | null
          scheme_level?: Database["public"]["Enums"]["scheme_level"]
          states?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          document_name: string
          document_type: string
          id: string
          scheme_id: string
          storage_path: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          document_name: string
          document_type: string
          id?: string
          scheme_id: string
          storage_path: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          document_name?: string
          document_type?: string
          id?: string
          scheme_id?: string
          storage_path?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_scheme_applications: {
        Row: {
          applied_at: string | null
          created_at: string | null
          id: string
          scheme_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string | null
          id?: string
          scheme_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string | null
          id?: string
          scheme_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_scheme_applications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
      category_type: "general" | "obc" | "sc" | "st" | "ews"
      disability_type:
        | "none"
        | "visual"
        | "hearing"
        | "locomotor"
        | "mental"
        | "multiple"
      education_type:
        | "none"
        | "primary"
        | "secondary"
        | "higher_secondary"
        | "graduate"
        | "postgraduate"
        | "doctorate"
      farmer_type: "landless" | "marginal" | "small" | "medium" | "large"
      gender_type: "male" | "female" | "other"
      marital_status_type:
        | "single"
        | "married"
        | "widowed"
        | "divorced"
        | "separated"
      occupation_type:
        | "student"
        | "employed"
        | "self_employed"
        | "unemployed"
        | "farmer"
        | "retired"
        | "homemaker"
      ration_card_type: "none" | "apl" | "bpl" | "aay" | "priority"
      scheme_level: "central" | "state"
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
      app_role: ["user", "admin"],
      category_type: ["general", "obc", "sc", "st", "ews"],
      disability_type: [
        "none",
        "visual",
        "hearing",
        "locomotor",
        "mental",
        "multiple",
      ],
      education_type: [
        "none",
        "primary",
        "secondary",
        "higher_secondary",
        "graduate",
        "postgraduate",
        "doctorate",
      ],
      farmer_type: ["landless", "marginal", "small", "medium", "large"],
      gender_type: ["male", "female", "other"],
      marital_status_type: [
        "single",
        "married",
        "widowed",
        "divorced",
        "separated",
      ],
      occupation_type: [
        "student",
        "employed",
        "self_employed",
        "unemployed",
        "farmer",
        "retired",
        "homemaker",
      ],
      ration_card_type: ["none", "apl", "bpl", "aay", "priority"],
      scheme_level: ["central", "state"],
    },
  },
} as const
