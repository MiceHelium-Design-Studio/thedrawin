export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_wallet_addresses: {
        Row: {
          created_at: string
          currency_code: string
          currency_name: string
          id: string
          is_active: boolean
          network: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          currency_name: string
          id?: string
          is_active?: boolean
          network?: string | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          currency_name?: string
          id?: string
          is_active?: boolean
          network?: string | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          image_url: string
          link_url: string | null
          position: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          image_url: string
          link_url?: string | null
          position?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          image_url?: string
          link_url?: string | null
          position?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      draws: {
        Row: {
          created_at: string | null
          draw_date: string | null
          gold_weight_grams: number | null
          id: string
          number_of_tickets: number
          status: string | null
          title: string | null
          winner_id: string | null
          winner_ticket_number: number | null
        }
        Insert: {
          created_at?: string | null
          draw_date?: string | null
          gold_weight_grams?: number | null
          id?: string
          number_of_tickets?: number
          status?: string | null
          title?: string | null
          winner_id?: string | null
          winner_ticket_number?: number | null
        }
        Update: {
          created_at?: string | null
          draw_date?: string | null
          gold_weight_grams?: number | null
          id?: string
          number_of_tickets?: number
          status?: string | null
          title?: string | null
          winner_id?: string | null
          winner_ticket_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "draws_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "winners"
            referencedColumns: ["id"]
          },
        ]
      }
      index_usage_log: {
        Row: {
          id: string
          idx_scan: number | null
          idx_tup_fetch: number | null
          idx_tup_read: number | null
          index_name: string
          log_time: string | null
          schema_name: string
          table_name: string
        }
        Insert: {
          id?: string
          idx_scan?: number | null
          idx_tup_fetch?: number | null
          idx_tup_read?: number | null
          index_name: string
          log_time?: string | null
          schema_name: string
          table_name: string
        }
        Update: {
          id?: string
          idx_scan?: number | null
          idx_tup_fetch?: number | null
          idx_tup_read?: number | null
          index_name?: string
          log_time?: string | null
          schema_name?: string
          table_name?: string
        }
        Relationships: []
      }
      media_items: {
        Row: {
          id: string
          name: string
          size: number
          type: string
          upload_date: string
          url: string
          user_id: string
        }
        Insert: {
          id: string
          name: string
          size?: number
          type: string
          upload_date?: string
          url: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          size?: number
          type?: string
          upload_date?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          role: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          role: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          role?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          is_admin: boolean | null
          name: string | null
          updated_at: string | null
          wallet: number | null
        }
        Insert: {
          avatar?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string | null
          wallet?: number | null
        }
        Update: {
          avatar?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string | null
          wallet?: number | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          count: number | null
          created_at: string | null
          id: string
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          action: string
          count?: number | null
          created_at?: string | null
          id?: string
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          action?: string
          count?: number | null
          created_at?: string | null
          id?: string
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_code: string | null
          referred_id: string | null
          referrer_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code?: string | null
          referred_id?: string | null
          referrer_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code?: string | null
          referred_id?: string | null
          referrer_id?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          draw_id: string | null
          id: string
          price: number
          purchased_at: string | null
          ticket_number: string | null
          user_id: string | null
        }
        Insert: {
          draw_id?: string | null
          id?: string
          price?: number
          purchased_at?: string | null
          ticket_number?: string | null
          user_id?: string | null
        }
        Update: {
          draw_id?: string | null
          id?: string
          price?: number
          purchased_at?: string | null
          ticket_number?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "draws"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          task: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          task: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          task?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          reference: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          reference?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          reference?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          phone_number: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          phone_number?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          phone_number?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          id: string
          last_updated: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          id?: string
          last_updated?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          id?: string
          last_updated?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      winners: {
        Row: {
          awarded_at: string | null
          draw_id: string | null
          id: string
          prize: string | null
          user_id: string | null
        }
        Insert: {
          awarded_at?: string | null
          draw_id?: string | null
          id?: string
          prize?: string | null
          user_id?: string | null
        }
        Update: {
          awarded_at?: string | null
          draw_id?: string | null
          id?: string
          prize?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "winners_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "draws"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_profile_view: {
        Row: {
          avatar: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string | null
          is_admin: boolean | null
          name: string | null
          updated_at: string | null
          wallet: number | null
        }
        Insert: {
          avatar?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string | null
          wallet?: number | null
        }
        Update: {
          avatar?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string | null
          wallet?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: { p_action: string; p_limit?: number; p_window_minutes?: number }
        Returns: boolean
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      draw_random_winners: {
        Args:
        | Record<PropertyKey, never>
        | { draw_uuid: string; num_winners?: number }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_taken_ticket_numbers: {
        Args: { draw_uuid: string }
        Returns: number[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_table_name: string
          p_record_id?: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: undefined
      }
      pick_draw_winner: {
        Args: { draw_uuid: string }
        Returns: Json
      }
      update_user_admin_status: {
        Args: { user_email: string; is_admin_status: boolean }
        Returns: undefined
      }
      user_entered_draw: {
        Args: { draw_uuid: string; user_uuid: string }
        Returns: boolean
      }
      validate_input: {
        Args: { p_input: string; p_type?: string; p_max_length?: number }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
