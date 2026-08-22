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
      subscribers: {
        Row: {
          categories: Json | null
          consent: boolean | null
          created_at: string
          email: string
          id: string
          market: string | null
          metadata: Json | null
          phone: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          categories?: Json | null
          consent?: boolean | null
          created_at?: string
          email: string
          id?: string
          market?: string | null
          metadata?: Json | null
          phone?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          categories?: Json | null
          consent?: boolean | null
          created_at?: string
          email?: string
          id?: string
          market?: string | null
          metadata?: Json | null
          phone?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery: {
        Row: {
          county_rates: Json | null
          created_at: string | null
          details: string | null
          enabled: boolean | null
          flat_fee: number | null
          fragile_surcharge: number | null
          free_above: number | null
          id: string
          message: string | null
          tier_surcharges: Json | null
          updated_at: string | null
          va_details: string | null
          va_enabled: boolean | null
          va_flat_fee: number | null
          va_fragile_surcharge: number | null
          va_free_above: number | null
          va_locality_rates: Json | null
          va_message: string | null
          va_outside_quote: boolean | null
          va_tier_surcharges: Json | null
        }
        Insert: {
          county_rates?: Json | null
          created_at?: string | null
          details?: string | null
          enabled?: boolean | null
          flat_fee?: number | null
          free_above?: number | null
          id?: string
          message?: string | null
          updated_at?: string | null
        }
        Update: {
          county_rates?: Json | null
          created_at?: string | null
          details?: string | null
          enabled?: boolean | null
          flat_fee?: number | null
          free_above?: number | null
          id?: string
          message?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          amount_paid: number | null
          county: string | null
          created_at: string
          currency: string | null
          delivery_fee: number | null
          delivery_notes: string | null
          email: string | null
          full_name: string
          id: string
          items: Json | null
          metadata: Json | null
          order_number: string | null
          paid_at: string | null
          payment_status: string | null
          phone: string
          source: string | null
          status: string
          subtotal: number | null
          total: number | null
          town: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amount_paid?: number | null
          country?: string | null
          county?: string | null
          delivery_quote_pending?: boolean | null
          market?: string | null
          postal_code?: string | null
          state?: string | null
          created_at?: string
          currency?: string | null
          delivery_fee?: number | null
          delivery_notes?: string | null
          email?: string | null
          full_name: string
          id?: string
          items?: Json | null
          metadata?: Json | null
          order_number?: string | null
          paid_at?: string | null
          payment_status?: string | null
          phone: string
          source?: string | null
          status?: string
          subtotal?: number | null
          total?: number | null
          town?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amount_paid?: number | null
          country?: string | null
          county?: string | null
          delivery_quote_pending?: boolean | null
          market?: string | null
          postal_code?: string | null
          state?: string | null
          created_at?: string
          currency?: string | null
          delivery_fee?: number | null
          delivery_notes?: string | null
          email?: string | null
          full_name?: string
          id?: string
          items?: Json | null
          metadata?: Json | null
          order_number?: string | null
          paid_at?: string | null
          payment_status?: string | null
          phone?: string
          source?: string | null
          status?: string
          subtotal?: number | null
          total?: number | null
          town?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      _assets_v: {
        Row: {
          created_at: string
          id: string
          latest: boolean | null
          parent_id: string | null
          updated_at: string
          version__status:
            | Database["public"]["Enums"]["enum__assets_v_version_status"]
            | null
          version_brand: string | null
          version_category:
            | Database["public"]["Enums"]["enum__assets_v_version_category"]
            | null
          version_condition:
            | Database["public"]["Enums"]["enum__assets_v_version_condition"]
            | null
          version_created_at: string | null
          version_currency: string | null
          version_description: string | null
          version_dimensions: string | null
          version_division:
            | Database["public"]["Enums"]["enum__assets_v_version_division"]
            | null
          version_era: string | null
          version_gallery: Json | null
          version_is_featured: boolean | null
          version_location: string | null
          version_metadata: Json | null
          version_price: number | null
          version_price_on_request: boolean | null
          version_primary_image_url: string | null
          version_provenance: string | null
          version_slug: string | null
          version_sort_order: number | null
          version_status:
            | Database["public"]["Enums"]["enum_asset_availability"]
            | null
          version_tags: Json | null
          version_title: string | null
          version_updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          latest?: boolean | null
          parent_id?: string | null
          updated_at?: string
          version__status?:
            | Database["public"]["Enums"]["enum__assets_v_version_status"]
            | null
          version_brand?: string | null
          version_category?:
            | Database["public"]["Enums"]["enum__assets_v_version_category"]
            | null
          version_condition?:
            | Database["public"]["Enums"]["enum__assets_v_version_condition"]
            | null
          version_created_at?: string | null
          version_currency?: string | null
          version_description?: string | null
          version_dimensions?: string | null
          version_division?:
            | Database["public"]["Enums"]["enum__assets_v_version_division"]
            | null
          version_era?: string | null
          version_gallery?: Json | null
          version_is_featured?: boolean | null
          version_location?: string | null
          version_metadata?: Json | null
          version_price?: number | null
          version_price_on_request?: boolean | null
          version_primary_image_url?: string | null
          version_provenance?: string | null
          version_slug?: string | null
          version_sort_order?: number | null
          version_status?:
            | Database["public"]["Enums"]["enum_asset_availability"]
            | null
          version_tags?: Json | null
          version_title?: string | null
          version_updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          latest?: boolean | null
          parent_id?: string | null
          updated_at?: string
          version__status?:
            | Database["public"]["Enums"]["enum__assets_v_version_status"]
            | null
          version_brand?: string | null
          version_category?:
            | Database["public"]["Enums"]["enum__assets_v_version_category"]
            | null
          version_condition?:
            | Database["public"]["Enums"]["enum__assets_v_version_condition"]
            | null
          version_created_at?: string | null
          version_currency?: string | null
          version_description?: string | null
          version_dimensions?: string | null
          version_division?:
            | Database["public"]["Enums"]["enum__assets_v_version_division"]
            | null
          version_era?: string | null
          version_gallery?: Json | null
          version_is_featured?: boolean | null
          version_location?: string | null
          version_metadata?: Json | null
          version_price?: number | null
          version_price_on_request?: boolean | null
          version_primary_image_url?: string | null
          version_provenance?: string | null
          version_slug?: string | null
          version_sort_order?: number | null
          version_status?:
            | Database["public"]["Enums"]["enum_asset_availability"]
            | null
          version_tags?: Json | null
          version_title?: string | null
          version_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "_assets_v_parent_id_assets_id_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      _assets_v_version_images: {
        Row: {
          _order: number
          _parent_id: string
          _uuid: string | null
          alt: string | null
          id: string
          image_id: string | null
        }
        Insert: {
          _order: number
          _parent_id: string
          _uuid?: string | null
          alt?: string | null
          id?: string
          image_id?: string | null
        }
        Update: {
          _order?: number
          _parent_id?: string
          _uuid?: string | null
          alt?: string | null
          id?: string
          image_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "_assets_v_version_images_image_id_media_id_fk"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_assets_v_version_images_parent_id_fk"
            columns: ["_parent_id"]
            isOneToOne: false
            referencedRelation: "_assets_v"
            referencedColumns: ["id"]
          },
        ]
      }
      _sale_events_v: {
        Row: {
          created_at: string
          id: string
          latest: boolean | null
          parent_id: string | null
          updated_at: string
          version__status:
            | Database["public"]["Enums"]["enum__sale_events_v_version_status"]
            | null
          version_address: string | null
          version_cover_image_url: string | null
          version_created_at: string | null
          version_description: string | null
          version_division:
            | Database["public"]["Enums"]["enum__sale_events_v_version_division"]
            | null
          version_ends_at: string | null
          version_event_type:
            | Database["public"]["Enums"]["enum__sale_events_v_version_event_type"]
            | null
          version_is_featured: boolean | null
          version_location: string | null
          version_metadata: Json | null
          version_slug: string | null
          version_starts_at: string | null
          version_status:
            | Database["public"]["Enums"]["enum_sale_event_lifecycle"]
            | null
          version_title: string | null
          version_updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          latest?: boolean | null
          parent_id?: string | null
          updated_at?: string
          version__status?:
            | Database["public"]["Enums"]["enum__sale_events_v_version_status"]
            | null
          version_address?: string | null
          version_cover_image_url?: string | null
          version_created_at?: string | null
          version_description?: string | null
          version_division?:
            | Database["public"]["Enums"]["enum__sale_events_v_version_division"]
            | null
          version_ends_at?: string | null
          version_event_type?:
            | Database["public"]["Enums"]["enum__sale_events_v_version_event_type"]
            | null
          version_is_featured?: boolean | null
          version_location?: string | null
          version_metadata?: Json | null
          version_slug?: string | null
          version_starts_at?: string | null
          version_status?:
            | Database["public"]["Enums"]["enum_sale_event_lifecycle"]
            | null
          version_title?: string | null
          version_updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          latest?: boolean | null
          parent_id?: string | null
          updated_at?: string
          version__status?:
            | Database["public"]["Enums"]["enum__sale_events_v_version_status"]
            | null
          version_address?: string | null
          version_cover_image_url?: string | null
          version_created_at?: string | null
          version_description?: string | null
          version_division?:
            | Database["public"]["Enums"]["enum__sale_events_v_version_division"]
            | null
          version_ends_at?: string | null
          version_event_type?:
            | Database["public"]["Enums"]["enum__sale_events_v_version_event_type"]
            | null
          version_is_featured?: boolean | null
          version_location?: string | null
          version_metadata?: Json | null
          version_slug?: string | null
          version_starts_at?: string | null
          version_status?:
            | Database["public"]["Enums"]["enum_sale_event_lifecycle"]
            | null
          version_title?: string | null
          version_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "_sale_events_v_parent_id_sale_events_id_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sale_events"
            referencedColumns: ["id"]
          },
        ]
      }
      _services_v: {
        Row: {
          created_at: string
          id: string
          latest: boolean | null
          parent_id: string | null
          updated_at: string
          version__status:
            | Database["public"]["Enums"]["enum__services_v_version_status"]
            | null
          version_created_at: string | null
          version_description: string | null
          version_division:
            | Database["public"]["Enums"]["enum__services_v_version_division"]
            | null
          version_hero_image_url: string | null
          version_icon:
            | Database["public"]["Enums"]["enum__services_v_version_icon"]
            | null
          version_offerings: Json | null
          version_slug: string | null
          version_sort_order: number | null
          version_summary: string | null
          version_title: string | null
          version_updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          latest?: boolean | null
          parent_id?: string | null
          updated_at?: string
          version__status?:
            | Database["public"]["Enums"]["enum__services_v_version_status"]
            | null
          version_created_at?: string | null
          version_description?: string | null
          version_division?:
            | Database["public"]["Enums"]["enum__services_v_version_division"]
            | null
          version_hero_image_url?: string | null
          version_icon?:
            | Database["public"]["Enums"]["enum__services_v_version_icon"]
            | null
          version_offerings?: Json | null
          version_slug?: string | null
          version_sort_order?: number | null
          version_summary?: string | null
          version_title?: string | null
          version_updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          latest?: boolean | null
          parent_id?: string | null
          updated_at?: string
          version__status?:
            | Database["public"]["Enums"]["enum__services_v_version_status"]
            | null
          version_created_at?: string | null
          version_description?: string | null
          version_division?:
            | Database["public"]["Enums"]["enum__services_v_version_division"]
            | null
          version_hero_image_url?: string | null
          version_icon?:
            | Database["public"]["Enums"]["enum__services_v_version_icon"]
            | null
          version_offerings?: Json | null
          version_slug?: string | null
          version_sort_order?: number | null
          version_summary?: string | null
          version_title?: string | null
          version_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "_services_v_parent_id_services_id_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      _site_stats_v: {
        Row: {
          created_at: string
          id: string
          latest: boolean | null
          parent_id: string | null
          updated_at: string
          version__status:
            | Database["public"]["Enums"]["enum__site_stats_v_version_status"]
            | null
          version_created_at: string | null
          version_key: string | null
          version_label: string | null
          version_prefix: string | null
          version_sort_order: number | null
          version_suffix: string | null
          version_updated_at: string | null
          version_value: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          latest?: boolean | null
          parent_id?: string | null
          updated_at?: string
          version__status?:
            | Database["public"]["Enums"]["enum__site_stats_v_version_status"]
            | null
          version_created_at?: string | null
          version_key?: string | null
          version_label?: string | null
          version_prefix?: string | null
          version_sort_order?: number | null
          version_suffix?: string | null
          version_updated_at?: string | null
          version_value?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          latest?: boolean | null
          parent_id?: string | null
          updated_at?: string
          version__status?:
            | Database["public"]["Enums"]["enum__site_stats_v_version_status"]
            | null
          version_created_at?: string | null
          version_key?: string | null
          version_label?: string | null
          version_prefix?: string | null
          version_sort_order?: number | null
          version_suffix?: string | null
          version_updated_at?: string | null
          version_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "_site_stats_v_parent_id_site_stats_id_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      _testimonials_v: {
        Row: {
          created_at: string
          id: string
          latest: boolean | null
          parent_id: string | null
          updated_at: string
          version__status:
            | Database["public"]["Enums"]["enum__testimonials_v_version_status"]
            | null
          version_author_name: string | null
          version_author_role: string | null
          version_avatar_url: string | null
          version_client_segment:
            | Database["public"]["Enums"]["enum__testimonials_v_version_client_segment"]
            | null
          version_created_at: string | null
          version_is_featured: boolean | null
          version_location: string | null
          version_quote: string | null
          version_rating: number | null
          version_sort_order: number | null
          version_updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          latest?: boolean | null
          parent_id?: string | null
          updated_at?: string
          version__status?:
            | Database["public"]["Enums"]["enum__testimonials_v_version_status"]
            | null
          version_author_name?: string | null
          version_author_role?: string | null
          version_avatar_url?: string | null
          version_client_segment?:
            | Database["public"]["Enums"]["enum__testimonials_v_version_client_segment"]
            | null
          version_created_at?: string | null
          version_is_featured?: boolean | null
          version_location?: string | null
          version_quote?: string | null
          version_rating?: number | null
          version_sort_order?: number | null
          version_updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          latest?: boolean | null
          parent_id?: string | null
          updated_at?: string
          version__status?:
            | Database["public"]["Enums"]["enum__testimonials_v_version_status"]
            | null
          version_author_name?: string | null
          version_author_role?: string | null
          version_avatar_url?: string | null
          version_client_segment?:
            | Database["public"]["Enums"]["enum__testimonials_v_version_client_segment"]
            | null
          version_created_at?: string | null
          version_is_featured?: boolean | null
          version_location?: string | null
          version_quote?: string | null
          version_rating?: number | null
          version_sort_order?: number | null
          version_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "_testimonials_v_parent_id_testimonials_id_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          _status: Database["public"]["Enums"]["enum_assets_status"] | null
          brand: string | null
          category: Database["public"]["Enums"]["enum_assets_category"] | null
          category_other: string | null
          condition: Database["public"]["Enums"]["enum_assets_condition"] | null
          created_at: string
          currency: string | null
          delivery_tier: string | null
          description: string | null
          dimensions: string | null
          division: Database["public"]["Enums"]["enum_assets_division"] | null
          era: string | null
          fragile: boolean | null
          gallery: Json | null
          id: string
          is_featured: boolean | null
          location: string | null
          market: string | null
          metadata: Json | null
          price: number | null
          price_max: number | null
          price_on_request: boolean | null
          primary_image_url: string | null
          provenance: string | null
          slug: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["enum_asset_availability"] | null
          tags: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          _status?: Database["public"]["Enums"]["enum_assets_status"] | null
          brand?: string | null
          category?: Database["public"]["Enums"]["enum_assets_category"] | null
          condition?:
            | Database["public"]["Enums"]["enum_assets_condition"]
            | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimensions?: string | null
          division?: Database["public"]["Enums"]["enum_assets_division"] | null
          era?: string | null
          gallery?: Json | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          market?: string | null
          metadata?: Json | null
          price?: number | null
          price_on_request?: boolean | null
          primary_image_url?: string | null
          provenance?: string | null
          slug?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["enum_asset_availability"] | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          _status?: Database["public"]["Enums"]["enum_assets_status"] | null
          brand?: string | null
          category?: Database["public"]["Enums"]["enum_assets_category"] | null
          condition?:
            | Database["public"]["Enums"]["enum_assets_condition"]
            | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimensions?: string | null
          division?: Database["public"]["Enums"]["enum_assets_division"] | null
          era?: string | null
          gallery?: Json | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          market?: string | null
          metadata?: Json | null
          price?: number | null
          price_on_request?: boolean | null
          primary_image_url?: string | null
          provenance?: string | null
          slug?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["enum_asset_availability"] | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      assets_images: {
        Row: {
          _order: number
          _parent_id: string
          alt: string | null
          id: string
          image_id: string | null
        }
        Insert: {
          _order: number
          _parent_id: string
          alt?: string | null
          id: string
          image_id?: string | null
        }
        Update: {
          _order?: number
          _parent_id?: string
          alt?: string | null
          id?: string
          image_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_images_image_id_media_id_fk"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_images_parent_id_fk"
            columns: ["_parent_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          asset_category:
            | Database["public"]["Enums"]["enum_inquiries_asset_category"]
            | null
          asset_description: string | null
          client_segment:
            | Database["public"]["Enums"]["enum_inquiries_client_segment"]
            | null
          company: string | null
          consent: boolean | null
          created_at: string
          email: string
          estimated_currency: string | null
          estimated_value: number | null
          expat_direction: string | null
          full_name: string
          id: string
          inquiry_type: Database["public"]["Enums"]["enum_inquiries_inquiry_type"]
          location: string | null
          message: string | null
          metadata: Json | null
          phone: string | null
          preferred_contact: string | null
          service_division:
            | Database["public"]["Enums"]["enum_inquiries_service_division"]
            | null
          source: string | null
          status: Database["public"]["Enums"]["enum_inquiries_status"]
          subject: string | null
          updated_at: string
        }
        Insert: {
          asset_category?:
            | Database["public"]["Enums"]["enum_inquiries_asset_category"]
            | null
          asset_description?: string | null
          client_segment?:
            | Database["public"]["Enums"]["enum_inquiries_client_segment"]
            | null
          company?: string | null
          consent?: boolean | null
          created_at?: string
          email: string
          estimated_currency?: string | null
          estimated_value?: number | null
          expat_direction?: string | null
          full_name: string
          id?: string
          inquiry_type?: Database["public"]["Enums"]["enum_inquiries_inquiry_type"]
          location?: string | null
          message?: string | null
          metadata?: Json | null
          phone?: string | null
          preferred_contact?: string | null
          service_division?:
            | Database["public"]["Enums"]["enum_inquiries_service_division"]
            | null
          source?: string | null
          status?: Database["public"]["Enums"]["enum_inquiries_status"]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          asset_category?:
            | Database["public"]["Enums"]["enum_inquiries_asset_category"]
            | null
          asset_description?: string | null
          client_segment?:
            | Database["public"]["Enums"]["enum_inquiries_client_segment"]
            | null
          company?: string | null
          consent?: boolean | null
          created_at?: string
          email?: string
          estimated_currency?: string | null
          estimated_value?: number | null
          expat_direction?: string | null
          full_name?: string
          id?: string
          inquiry_type?: Database["public"]["Enums"]["enum_inquiries_inquiry_type"]
          location?: string | null
          message?: string | null
          metadata?: Json | null
          phone?: string | null
          preferred_contact?: string | null
          service_division?:
            | Database["public"]["Enums"]["enum_inquiries_service_division"]
            | null
          source?: string | null
          status?: Database["public"]["Enums"]["enum_inquiries_status"]
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt: string | null
          created_at: string
          credit: string | null
          filename: string | null
          filesize: number | null
          focal_x: number | null
          focal_y: number | null
          height: number | null
          id: string
          mime_type: string | null
          prefix: string | null
          sizes_card_filename: string | null
          sizes_card_filesize: number | null
          sizes_card_height: number | null
          sizes_card_mime_type: string | null
          sizes_card_url: string | null
          sizes_card_width: number | null
          sizes_hero_filename: string | null
          sizes_hero_filesize: number | null
          sizes_hero_height: number | null
          sizes_hero_mime_type: string | null
          sizes_hero_url: string | null
          sizes_hero_width: number | null
          sizes_thumbnail_filename: string | null
          sizes_thumbnail_filesize: number | null
          sizes_thumbnail_height: number | null
          sizes_thumbnail_mime_type: string | null
          sizes_thumbnail_url: string | null
          sizes_thumbnail_width: number | null
          thumbnail_u_r_l: string | null
          updated_at: string
          url: string | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          created_at?: string
          credit?: string | null
          filename?: string | null
          filesize?: number | null
          focal_x?: number | null
          focal_y?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          prefix?: string | null
          sizes_card_filename?: string | null
          sizes_card_filesize?: number | null
          sizes_card_height?: number | null
          sizes_card_mime_type?: string | null
          sizes_card_url?: string | null
          sizes_card_width?: number | null
          sizes_hero_filename?: string | null
          sizes_hero_filesize?: number | null
          sizes_hero_height?: number | null
          sizes_hero_mime_type?: string | null
          sizes_hero_url?: string | null
          sizes_hero_width?: number | null
          sizes_thumbnail_filename?: string | null
          sizes_thumbnail_filesize?: number | null
          sizes_thumbnail_height?: number | null
          sizes_thumbnail_mime_type?: string | null
          sizes_thumbnail_url?: string | null
          sizes_thumbnail_width?: number | null
          thumbnail_u_r_l?: string | null
          updated_at?: string
          url?: string | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          created_at?: string
          credit?: string | null
          filename?: string | null
          filesize?: number | null
          focal_x?: number | null
          focal_y?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          prefix?: string | null
          sizes_card_filename?: string | null
          sizes_card_filesize?: number | null
          sizes_card_height?: number | null
          sizes_card_mime_type?: string | null
          sizes_card_url?: string | null
          sizes_card_width?: number | null
          sizes_hero_filename?: string | null
          sizes_hero_filesize?: number | null
          sizes_hero_height?: number | null
          sizes_hero_mime_type?: string | null
          sizes_hero_url?: string | null
          sizes_hero_width?: number | null
          sizes_thumbnail_filename?: string | null
          sizes_thumbnail_filesize?: number | null
          sizes_thumbnail_height?: number | null
          sizes_thumbnail_mime_type?: string | null
          sizes_thumbnail_url?: string | null
          sizes_thumbnail_width?: number | null
          thumbnail_u_r_l?: string | null
          updated_at?: string
          url?: string | null
          width?: number | null
        }
        Relationships: []
      }
      payload_kv: {
        Row: {
          data: Json
          id: string
          key: string
        }
        Insert: {
          data: Json
          id?: string
          key: string
        }
        Update: {
          data?: Json
          id?: string
          key?: string
        }
        Relationships: []
      }
      payload_locked_documents: {
        Row: {
          created_at: string
          global_slug: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          global_slug?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          global_slug?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      payload_locked_documents_rels: {
        Row: {
          assets_id: string | null
          id: number
          inquiries_id: string | null
          media_id: string | null
          order: number | null
          parent_id: string
          path: string
          sale_events_id: string | null
          services_id: string | null
          site_stats_id: string | null
          testimonials_id: string | null
          users_id: string | null
        }
        Insert: {
          assets_id?: string | null
          id?: number
          inquiries_id?: string | null
          media_id?: string | null
          order?: number | null
          parent_id: string
          path: string
          sale_events_id?: string | null
          services_id?: string | null
          site_stats_id?: string | null
          testimonials_id?: string | null
          users_id?: string | null
        }
        Update: {
          assets_id?: string | null
          id?: number
          inquiries_id?: string | null
          media_id?: string | null
          order?: number | null
          parent_id?: string
          path?: string
          sale_events_id?: string | null
          services_id?: string | null
          site_stats_id?: string | null
          testimonials_id?: string | null
          users_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payload_locked_documents_rels_assets_fk"
            columns: ["assets_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payload_locked_documents_rels_inquiries_fk"
            columns: ["inquiries_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payload_locked_documents_rels_media_fk"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payload_locked_documents_rels_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "payload_locked_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payload_locked_documents_rels_sale_events_fk"
            columns: ["sale_events_id"]
            isOneToOne: false
            referencedRelation: "sale_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payload_locked_documents_rels_services_fk"
            columns: ["services_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payload_locked_documents_rels_site_stats_fk"
            columns: ["site_stats_id"]
            isOneToOne: false
            referencedRelation: "site_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payload_locked_documents_rels_testimonials_fk"
            columns: ["testimonials_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payload_locked_documents_rels_users_fk"
            columns: ["users_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payload_migrations: {
        Row: {
          batch: number | null
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          batch?: number | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          batch?: number | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payload_preferences: {
        Row: {
          created_at: string
          id: string
          key: string | null
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key?: string | null
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string | null
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      payload_preferences_rels: {
        Row: {
          id: number
          order: number | null
          parent_id: string
          path: string
          users_id: string | null
        }
        Insert: {
          id?: number
          order?: number | null
          parent_id: string
          path: string
          users_id?: string | null
        }
        Update: {
          id?: number
          order?: number | null
          parent_id?: string
          path?: string
          users_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payload_preferences_rels_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "payload_preferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payload_preferences_rels_users_fk"
            columns: ["users_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_events: {
        Row: {
          _status: Database["public"]["Enums"]["enum_sale_events_status"] | null
          address: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          division:
            | Database["public"]["Enums"]["enum_sale_events_division"]
            | null
          ends_at: string | null
          event_type:
            | Database["public"]["Enums"]["enum_sale_events_event_type"]
            | null
          id: string
          is_featured: boolean | null
          location: string | null
          metadata: Json | null
          slug: string | null
          starts_at: string | null
          status:
            | Database["public"]["Enums"]["enum_sale_event_lifecycle"]
            | null
          title: string | null
          updated_at: string
        }
        Insert: {
          _status?:
            | Database["public"]["Enums"]["enum_sale_events_status"]
            | null
          address?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          division?:
            | Database["public"]["Enums"]["enum_sale_events_division"]
            | null
          ends_at?: string | null
          event_type?:
            | Database["public"]["Enums"]["enum_sale_events_event_type"]
            | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          metadata?: Json | null
          slug?: string | null
          starts_at?: string | null
          status?:
            | Database["public"]["Enums"]["enum_sale_event_lifecycle"]
            | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          _status?:
            | Database["public"]["Enums"]["enum_sale_events_status"]
            | null
          address?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          division?:
            | Database["public"]["Enums"]["enum_sale_events_division"]
            | null
          ends_at?: string | null
          event_type?:
            | Database["public"]["Enums"]["enum_sale_events_event_type"]
            | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          metadata?: Json | null
          slug?: string | null
          starts_at?: string | null
          status?:
            | Database["public"]["Enums"]["enum_sale_event_lifecycle"]
            | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          _status: Database["public"]["Enums"]["enum_services_status"] | null
          created_at: string
          description: string | null
          division: Database["public"]["Enums"]["enum_services_division"] | null
          hero_image_url: string | null
          icon: Database["public"]["Enums"]["enum_services_icon"] | null
          id: string
          offerings: Json | null
          slug: string | null
          sort_order: number | null
          summary: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          _status?: Database["public"]["Enums"]["enum_services_status"] | null
          created_at?: string
          description?: string | null
          division?:
            | Database["public"]["Enums"]["enum_services_division"]
            | null
          hero_image_url?: string | null
          icon?: Database["public"]["Enums"]["enum_services_icon"] | null
          id?: string
          offerings?: Json | null
          slug?: string | null
          sort_order?: number | null
          summary?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          _status?: Database["public"]["Enums"]["enum_services_status"] | null
          created_at?: string
          description?: string | null
          division?:
            | Database["public"]["Enums"]["enum_services_division"]
            | null
          hero_image_url?: string | null
          icon?: Database["public"]["Enums"]["enum_services_icon"] | null
          id?: string
          offerings?: Json | null
          slug?: string | null
          sort_order?: number | null
          summary?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          _status: Database["public"]["Enums"]["enum_site_stats_status"] | null
          created_at: string
          id: string
          key: string | null
          label: string | null
          prefix: string | null
          sort_order: number | null
          suffix: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          _status?: Database["public"]["Enums"]["enum_site_stats_status"] | null
          created_at?: string
          id?: string
          key?: string | null
          label?: string | null
          prefix?: string | null
          sort_order?: number | null
          suffix?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          _status?: Database["public"]["Enums"]["enum_site_stats_status"] | null
          created_at?: string
          id?: string
          key?: string | null
          label?: string | null
          prefix?: string | null
          sort_order?: number | null
          suffix?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          _status:
            | Database["public"]["Enums"]["enum_testimonials_status"]
            | null
          author_name: string | null
          author_role: string | null
          avatar_url: string | null
          client_segment:
            | Database["public"]["Enums"]["enum_testimonials_client_segment"]
            | null
          created_at: string
          id: string
          is_featured: boolean | null
          location: string | null
          quote: string | null
          rating: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          _status?:
            | Database["public"]["Enums"]["enum_testimonials_status"]
            | null
          author_name?: string | null
          author_role?: string | null
          avatar_url?: string | null
          client_segment?:
            | Database["public"]["Enums"]["enum_testimonials_client_segment"]
            | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          location?: string | null
          quote?: string | null
          rating?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          _status?:
            | Database["public"]["Enums"]["enum_testimonials_status"]
            | null
          author_name?: string | null
          author_role?: string | null
          avatar_url?: string | null
          client_segment?:
            | Database["public"]["Enums"]["enum_testimonials_client_segment"]
            | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          location?: string | null
          quote?: string | null
          rating?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          hash: string | null
          id: string
          lock_until: string | null
          login_attempts: number | null
          name: string | null
          reset_password_expiration: string | null
          reset_password_token: string | null
          role: Database["public"]["Enums"]["enum_users_role"]
          salt: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          hash?: string | null
          id?: string
          lock_until?: string | null
          login_attempts?: number | null
          name?: string | null
          reset_password_expiration?: string | null
          reset_password_token?: string | null
          role?: Database["public"]["Enums"]["enum_users_role"]
          salt?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          hash?: string | null
          id?: string
          lock_until?: string | null
          login_attempts?: number | null
          name?: string | null
          reset_password_expiration?: string | null
          reset_password_token?: string | null
          role?: Database["public"]["Enums"]["enum_users_role"]
          salt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      users_sessions: {
        Row: {
          _order: number
          _parent_id: string
          created_at: string | null
          expires_at: string
          id: string
        }
        Insert: {
          _order: number
          _parent_id: string
          created_at?: string | null
          expires_at: string
          id: string
        }
        Update: {
          _order?: number
          _parent_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_sessions_parent_id_fk"
            columns: ["_parent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      // ── Marketplace tables (added by migration 20260626000001) ──────────────
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          phone: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          free_listings_used: number
          free_listings_sold: number
          is_verified: boolean
          is_active: boolean
          metadata: Json
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          free_listings_used?: number
          free_listings_sold?: number
          is_verified?: boolean
          is_active?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          free_listings_used?: number
          free_listings_sold?: number
          is_verified?: boolean
          is_active?: boolean
          metadata?: Json
        }
        Relationships: []
      }
      user_listings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          slug: string
          title: string
          description: string | null
          category: Database["public"]["Enums"]["asset_category"]
          condition: Database["public"]["Enums"]["asset_condition"] | null
          price: number
          currency: string
          location: string | null
          primary_image_url: string | null
          tags: string[]
          status: "draft" | "pending_review" | "active" | "sold" | "withdrawn" | "rejected"
          is_free_listing: boolean
          listing_fee_paid: boolean
          listing_fee_amount: number
          sold_price: number | null
          sold_at: string | null
          commission_rate: number
          commission_amount: number | null
          commission_collected: boolean
          views: number
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          slug: string
          title: string
          description?: string | null
          category?: Database["public"]["Enums"]["asset_category"]
          condition?: Database["public"]["Enums"]["asset_condition"] | null
          price: number
          currency?: string
          location?: string | null
          primary_image_url?: string | null
          tags?: string[]
          status?: "draft" | "pending_review" | "active" | "sold" | "withdrawn" | "rejected"
          is_free_listing?: boolean
          listing_fee_paid?: boolean
          listing_fee_amount?: number
          sold_price?: number | null
          sold_at?: string | null
          commission_rate?: number
          commission_amount?: number | null
          commission_collected?: boolean
          views?: number
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          slug?: string
          title?: string
          description?: string | null
          category?: Database["public"]["Enums"]["asset_category"]
          condition?: Database["public"]["Enums"]["asset_condition"] | null
          price?: number
          currency?: string
          location?: string | null
          primary_image_url?: string | null
          tags?: string[]
          status?: "draft" | "pending_review" | "active" | "sold" | "withdrawn" | "rejected"
          is_free_listing?: boolean
          listing_fee_paid?: boolean
          listing_fee_amount?: number
          sold_price?: number | null
          sold_at?: string | null
          commission_rate?: number
          commission_amount?: number | null
          commission_collected?: boolean
          views?: number
          metadata?: Json
        }
        Relationships: []
      }
      user_listing_images: {
        Row: {
          id: string
          created_at: string
          listing_id: string
          url: string
          alt: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          listing_id: string
          url: string
          alt?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          created_at?: string
          listing_id?: string
          url?: string
          alt?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      listing_payments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          listing_id: string
          user_id: string
          transaction_type: "listing_fee" | "commission"
          amount: number
          currency: string
          status: "pending" | "completed" | "failed"
          mpesa_phone: string | null
          mpesa_checkout_request_id: string | null
          mpesa_merchant_request_id: string | null
          mpesa_transaction_id: string | null
          mpesa_result_code: number | null
          mpesa_result_desc: string | null
          paid_at: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          listing_id: string
          user_id: string
          transaction_type: "listing_fee" | "commission"
          amount: number
          currency?: string
          status?: "pending" | "completed" | "failed"
          mpesa_phone?: string | null
          mpesa_checkout_request_id?: string | null
          mpesa_merchant_request_id?: string | null
          mpesa_transaction_id?: string | null
          mpesa_result_code?: number | null
          mpesa_result_desc?: string | null
          paid_at?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          listing_id?: string
          user_id?: string
          transaction_type?: "listing_fee" | "commission"
          amount?: number
          currency?: string
          status?: "pending" | "completed" | "failed"
          mpesa_phone?: string | null
          mpesa_checkout_request_id?: string | null
          mpesa_merchant_request_id?: string | null
          mpesa_transaction_id?: string | null
          mpesa_result_code?: number | null
          mpesa_result_desc?: string | null
          paid_at?: string | null
          metadata?: Json
        }
        Relationships: []
      }
      unmatched_payments: {
        Row: {
          id: string
          created_at: string
          provider: string
          reference: string
          amount: number | null
          currency: string | null
          listing_id: string | null
          reason: string
          resolved_at: string | null
          payload: Json
        }
        Insert: {
          id?: string
          created_at?: string
          provider?: string
          reference: string
          amount?: number | null
          currency?: string | null
          listing_id?: string | null
          reason: string
          resolved_at?: string | null
          payload?: Json
        }
        Update: {
          id?: string
          created_at?: string
          provider?: string
          reference?: string
          amount?: number | null
          currency?: string | null
          listing_id?: string | null
          reason?: string
          resolved_at?: string | null
          payload?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      /**
       * Atomic view-count bump for a marketplace listing. Hand-added ahead of
       * the next `supabase gen types` run; see supabase/listing-views.sql.
       */
      increment_listing_views: {
        Args: { p_listing_id: string; p_increment?: number }
        Returns: number
      }
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
      enum__assets_v_version_category:
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
      enum__assets_v_version_condition:
        | "new"
        | "excellent"
        | "very_good"
        | "good"
        | "fair"
      enum__assets_v_version_division:
        | "estate_sales"
        | "commercial_liquidation"
        | "concierge"
        | "expat_services"
      enum__assets_v_version_status: "draft" | "published"
      enum__sale_events_v_version_division:
        | "estate_sales"
        | "commercial_liquidation"
        | "concierge"
        | "expat_services"
      enum__sale_events_v_version_event_type:
        | "estate_sale"
        | "online_auction"
        | "liquidation"
        | "private_event"
      enum__sale_events_v_version_status: "draft" | "published"
      enum__services_v_version_division:
        | "estate_sales"
        | "commercial_liquidation"
        | "concierge"
        | "expat_services"
      enum__services_v_version_icon: "estate" | "commercial" | "concierge"
      enum__services_v_version_status: "draft" | "published"
      enum__site_stats_v_version_status: "draft" | "published"
      enum__testimonials_v_version_client_segment:
        | "individual"
        | "family"
        | "estate_executor"
        | "business_owner"
        | "expat"
        | "embassy"
        | "corporation"
      enum__testimonials_v_version_status: "draft" | "published"
      enum_asset_availability:
        | "available"
        | "reserved"
        | "pending"
        | "sold"
        | "withdrawn"
      enum_assets_category:
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
      enum_assets_condition: "new" | "excellent" | "very_good" | "good" | "fair"
      enum_assets_division:
        | "estate_sales"
        | "commercial_liquidation"
        | "concierge"
        | "expat_services"
      enum_assets_status: "draft" | "published"
      enum_inquiries_asset_category:
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
      enum_inquiries_client_segment:
        | "individual"
        | "family"
        | "estate_executor"
        | "business_owner"
        | "expat"
        | "embassy"
        | "corporation"
      enum_inquiries_inquiry_type: "consultation" | "asset_review"
      enum_inquiries_service_division:
        | "estate_sales"
        | "commercial_liquidation"
        | "concierge"
        | "expat_services"
      enum_inquiries_status:
        | "new"
        | "contacted"
        | "qualified"
        | "won"
        | "lost"
        | "archived"
      enum_sale_event_lifecycle: "upcoming" | "live" | "ended" | "cancelled"
      enum_sale_events_division:
        | "estate_sales"
        | "commercial_liquidation"
        | "concierge"
        | "expat_services"
      enum_sale_events_event_type:
        | "estate_sale"
        | "online_auction"
        | "liquidation"
        | "private_event"
      enum_sale_events_status: "draft" | "published"
      enum_services_division:
        | "estate_sales"
        | "commercial_liquidation"
        | "concierge"
        | "expat_services"
      enum_services_icon: "estate" | "commercial" | "concierge"
      enum_services_status: "draft" | "published"
      enum_site_stats_status: "draft" | "published"
      enum_testimonials_client_segment:
        | "individual"
        | "family"
        | "estate_executor"
        | "business_owner"
        | "expat"
        | "embassy"
        | "corporation"
      enum_testimonials_status: "draft" | "published"
      enum_users_role: "admin" | "editor"
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
      enum__assets_v_version_category: [
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
      enum__assets_v_version_condition: [
        "new",
        "excellent",
        "very_good",
        "good",
        "fair",
      ],
      enum__assets_v_version_division: [
        "estate_sales",
        "commercial_liquidation",
        "concierge",
        "expat_services",
      ],
      enum__assets_v_version_status: ["draft", "published"],
      enum__sale_events_v_version_division: [
        "estate_sales",
        "commercial_liquidation",
        "concierge",
        "expat_services",
      ],
      enum__sale_events_v_version_event_type: [
        "estate_sale",
        "online_auction",
        "liquidation",
        "private_event",
      ],
      enum__sale_events_v_version_status: ["draft", "published"],
      enum__services_v_version_division: [
        "estate_sales",
        "commercial_liquidation",
        "concierge",
        "expat_services",
      ],
      enum__services_v_version_icon: ["estate", "commercial", "concierge"],
      enum__services_v_version_status: ["draft", "published"],
      enum__site_stats_v_version_status: ["draft", "published"],
      enum__testimonials_v_version_client_segment: [
        "individual",
        "family",
        "estate_executor",
        "business_owner",
        "expat",
        "embassy",
        "corporation",
      ],
      enum__testimonials_v_version_status: ["draft", "published"],
      enum_asset_availability: [
        "available",
        "reserved",
        "pending",
        "sold",
        "withdrawn",
      ],
      enum_assets_category: [
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
      enum_assets_condition: ["new", "excellent", "very_good", "good", "fair"],
      enum_assets_division: [
        "estate_sales",
        "commercial_liquidation",
        "concierge",
        "expat_services",
      ],
      enum_assets_status: ["draft", "published"],
      enum_inquiries_asset_category: [
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
      enum_inquiries_client_segment: [
        "individual",
        "family",
        "estate_executor",
        "business_owner",
        "expat",
        "embassy",
        "corporation",
      ],
      enum_inquiries_inquiry_type: ["consultation", "asset_review"],
      enum_inquiries_service_division: [
        "estate_sales",
        "commercial_liquidation",
        "concierge",
        "expat_services",
      ],
      enum_inquiries_status: [
        "new",
        "contacted",
        "qualified",
        "won",
        "lost",
        "archived",
      ],
      enum_sale_event_lifecycle: ["upcoming", "live", "ended", "cancelled"],
      enum_sale_events_division: [
        "estate_sales",
        "commercial_liquidation",
        "concierge",
        "expat_services",
      ],
      enum_sale_events_event_type: [
        "estate_sale",
        "online_auction",
        "liquidation",
        "private_event",
      ],
      enum_sale_events_status: ["draft", "published"],
      enum_services_division: [
        "estate_sales",
        "commercial_liquidation",
        "concierge",
        "expat_services",
      ],
      enum_services_icon: ["estate", "commercial", "concierge"],
      enum_services_status: ["draft", "published"],
      enum_site_stats_status: ["draft", "published"],
      enum_testimonials_client_segment: [
        "individual",
        "family",
        "estate_executor",
        "business_owner",
        "expat",
        "embassy",
        "corporation",
      ],
      enum_testimonials_status: ["draft", "published"],
      enum_users_role: ["admin", "editor"],
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
