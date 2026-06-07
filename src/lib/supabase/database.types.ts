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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      asset_images: {
        Row: {
          alt: string | null
          asset_id: string
          created_at: string
          id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          asset_id: string
          created_at?: string
          id?: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          asset_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_images_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          brand: string | null
          category: Database["public"]["Enums"]["asset_category"]
          condition: Database["public"]["Enums"]["asset_condition"] | null
          created_at: string
          currency: string
          description: string | null
          dimensions: string | null
          division: Database["public"]["Enums"]["service_division"]
          era: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          location: string | null
          metadata: Json
          price: number | null
          price_on_request: boolean
          primary_image_url: string | null
          provenance: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["asset_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: Database["public"]["Enums"]["asset_category"]
          condition?: Database["public"]["Enums"]["asset_condition"] | null
          created_at?: string
          currency?: string
          description?: string | null
          dimensions?: string | null
          division?: Database["public"]["Enums"]["service_division"]
          era?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          metadata?: Json
          price?: number | null
          price_on_request?: boolean
          primary_image_url?: string | null
          provenance?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["asset_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: Database["public"]["Enums"]["asset_category"]
          condition?: Database["public"]["Enums"]["asset_condition"] | null
          created_at?: string
          currency?: string
          description?: string | null
          dimensions?: string | null
          division?: Database["public"]["Enums"]["service_division"]
          era?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          metadata?: Json
          price?: number | null
          price_on_request?: boolean
          primary_image_url?: string | null
          provenance?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["asset_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          asset_category: Database["public"]["Enums"]["asset_category"] | null
          asset_description: string | null
          client_segment: Database["public"]["Enums"]["client_segment"] | null
          company: string | null
          consent: boolean
          created_at: string
          email: string
          estimated_currency: string
          estimated_value: number | null
          expat_direction: string | null
          full_name: string
          id: string
          inquiry_type: Database["public"]["Enums"]["inquiry_type"]
          location: string | null
          message: string | null
          metadata: Json
          phone: string | null
          preferred_contact: string | null
          service_division:
            | Database["public"]["Enums"]["service_division"]
            | null
          source: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          subject: string | null
          updated_at: string
        }
        Insert: {
          asset_category?: Database["public"]["Enums"]["asset_category"] | null
          asset_description?: string | null
          client_segment?: Database["public"]["Enums"]["client_segment"] | null
          company?: string | null
          consent?: boolean
          created_at?: string
          email: string
          estimated_currency?: string
          estimated_value?: number | null
          expat_direction?: string | null
          full_name: string
          id?: string
          inquiry_type: Database["public"]["Enums"]["inquiry_type"]
          location?: string | null
          message?: string | null
          metadata?: Json
          phone?: string | null
          preferred_contact?: string | null
          service_division?:
            | Database["public"]["Enums"]["service_division"]
            | null
          source?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          asset_category?: Database["public"]["Enums"]["asset_category"] | null
          asset_description?: string | null
          client_segment?: Database["public"]["Enums"]["client_segment"] | null
          company?: string | null
          consent?: boolean
          created_at?: string
          email?: string
          estimated_currency?: string
          estimated_value?: number | null
          expat_direction?: string | null
          full_name?: string
          id?: string
          inquiry_type?: Database["public"]["Enums"]["inquiry_type"]
          location?: string | null
          message?: string | null
          metadata?: Json
          phone?: string | null
          preferred_contact?: string | null
          service_division?:
            | Database["public"]["Enums"]["service_division"]
            | null
          source?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sale_events: {
        Row: {
          address: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          division: Database["public"]["Enums"]["service_division"]
          ends_at: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_featured: boolean
          is_published: boolean
          location: string | null
          metadata: Json
          slug: string
          starts_at: string | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          division?: Database["public"]["Enums"]["service_division"]
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          metadata?: Json
          slug: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          division?: Database["public"]["Enums"]["service_division"]
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          metadata?: Json
          slug?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          division: Database["public"]["Enums"]["service_division"]
          hero_image_url: string | null
          icon: string | null
          id: string
          is_published: boolean
          offerings: string[]
          slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          division: Database["public"]["Enums"]["service_division"]
          hero_image_url?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          offerings?: string[]
          slug: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          division?: Database["public"]["Enums"]["service_division"]
          hero_image_url?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          offerings?: string[]
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          key: string
          label: string
          prefix: string | null
          sort_order: number
          suffix: string | null
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          key: string
          label: string
          prefix?: string | null
          sort_order?: number
          suffix?: string | null
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          key?: string
          label?: string
          prefix?: string | null
          sort_order?: number
          suffix?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_role: string | null
          avatar_url: string | null
          client_segment: Database["public"]["Enums"]["client_segment"] | null
          created_at: string
          id: string
          is_featured: boolean
          is_published: boolean
          location: string | null
          quote: string
          rating: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          avatar_url?: string | null
          client_segment?: Database["public"]["Enums"]["client_segment"] | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          quote: string
          rating?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          avatar_url?: string | null
          client_segment?: Database["public"]["Enums"]["client_segment"] | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          quote?: string
          rating?: number | null
          sort_order?: number
          updated_at?: string
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
      asset_category:
        | "furniture"
        | "fine_art"
        | "jewelry"
        | "vehicles"
        | "collectibles"
        | "designer"
        | "lighting"
        | "rugs"
        | "antiques"
        | "equipment"
        | "fleet"
        | "inventory"
        | "office"
        | "other"
      asset_condition: "new" | "excellent" | "very_good" | "good" | "fair"
      asset_status: "available" | "reserved" | "pending" | "sold" | "withdrawn"
      client_segment:
        | "individual"
        | "family"
        | "estate_executor"
        | "business_owner"
        | "expat"
        | "embassy"
        | "corporation"
      event_status: "upcoming" | "live" | "ended" | "cancelled"
      event_type:
        | "estate_sale"
        | "online_auction"
        | "liquidation"
        | "private_event"
      inquiry_status:
        | "new"
        | "contacted"
        | "qualified"
        | "won"
        | "lost"
        | "archived"
      inquiry_type: "consultation" | "asset_review"
      service_division:
        | "estate_sales"
        | "commercial_liquidation"
        | "concierge"
        | "expat_services"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      asset_category: [
        "furniture",
        "fine_art",
        "jewelry",
        "vehicles",
        "collectibles",
        "designer",
        "lighting",
        "rugs",
        "antiques",
        "equipment",
        "fleet",
        "inventory",
        "office",
        "other",
      ],
      asset_condition: ["new", "excellent", "very_good", "good", "fair"],
      asset_status: ["available", "reserved", "pending", "sold", "withdrawn"],
      client_segment: [
        "individual",
        "family",
        "estate_executor",
        "business_owner",
        "expat",
        "embassy",
        "corporation",
      ],
      event_status: ["upcoming", "live", "ended", "cancelled"],
      event_type: [
        "estate_sale",
        "online_auction",
        "liquidation",
        "private_event",
      ],
      inquiry_status: [
        "new",
        "contacted",
        "qualified",
        "won",
        "lost",
        "archived",
      ],
      inquiry_type: ["consultation", "asset_review"],
      service_division: [
        "estate_sales",
        "commercial_liquidation",
        "concierge",
        "expat_services",
      ],
    },
  },
} as const
