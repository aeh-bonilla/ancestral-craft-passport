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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string
          communities: string
          credential: string
          display_name: string
          ethics_accepted: boolean
          experience_years: number
          id: string
          official_id: string
          organization: string
          professional_email: string
          professional_title: string
          region: string
          specialties: string[]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          bio?: string
          communities?: string
          credential?: string
          display_name?: string
          ethics_accepted?: boolean
          experience_years?: number
          id: string
          official_id?: string
          organization?: string
          professional_email?: string
          professional_title?: string
          region?: string
          specialties?: string[]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          bio?: string
          communities?: string
          credential?: string
          display_name?: string
          ethics_accepted?: boolean
          experience_years?: number
          id?: string
          official_id?: string
          organization?: string
          professional_email?: string
          professional_title?: string
          region?: string
          specialties?: string[]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      works: {
        Row: {
          artisan: string
          author: string
          community: string
          created_at: string
          description: string
          dimensions: string
          file_mime_type: string | null
          file_size: string | null
          file_url: string | null
          filename: string | null
          hash: string
          id: string
          materials: string
          network: string
          notes: string | null
          preview_base64: string | null
          price_mxn: number
          promoter_id: string | null
          region: string
          registered_at: string
          source_url: string | null
          status: string
          stellar_transaction_id: string | null
          technique: string
          title: string
          type: string
        }
        Insert: {
          artisan?: string
          author: string
          community?: string
          created_at?: string
          description?: string
          dimensions?: string
          file_mime_type?: string | null
          file_size?: string | null
          file_url?: string | null
          filename?: string | null
          hash: string
          id: string
          materials?: string
          network?: string
          notes?: string | null
          preview_base64?: string | null
          price_mxn?: number
          promoter_id?: string | null
          region?: string
          registered_at?: string
          source_url?: string | null
          status?: string
          stellar_transaction_id?: string | null
          technique?: string
          title: string
          type?: string
        }
        Update: {
          artisan?: string
          author?: string
          community?: string
          created_at?: string
          description?: string
          dimensions?: string
          file_mime_type?: string | null
          file_size?: string | null
          file_url?: string | null
          filename?: string | null
          hash?: string
          id?: string
          materials?: string
          network?: string
          notes?: string | null
          preview_base64?: string | null
          price_mxn?: number
          promoter_id?: string | null
          region?: string
          registered_at?: string
          source_url?: string | null
          status?: string
          stellar_transaction_id?: string | null
          technique?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      rights_events: {
        Row: {
          actor: string
          created_at: string
          effective_date: string
          id: string
          notes: string | null
          promoter_id: string | null
          recipient: string | null
          stellar_transaction_id: string | null
          terms: string | null
          type: string
          work_id: string
        }
        Insert: {
          actor: string
          created_at?: string
          effective_date?: string
          id: string
          notes?: string | null
          promoter_id?: string | null
          recipient?: string | null
          stellar_transaction_id?: string | null
          terms?: string | null
          type: string
          work_id: string
        }
        Update: {
          actor?: string
          created_at?: string
          effective_date?: string
          id?: string
          notes?: string | null
          promoter_id?: string | null
          recipient?: string | null
          stellar_transaction_id?: string | null
          terms?: string | null
          type?: string
          work_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
