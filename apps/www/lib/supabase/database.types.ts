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
      bindings: {
        Row: {
          alias: string | null
          created_at: string | null
          description: string | null
          group_name: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          alias?: string | null
          created_at?: string | null
          description?: string | null
          group_name?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          alias?: string | null
          created_at?: string | null
          description?: string | null
          group_name?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      bisac_codes: {
        Row: {
          code: string
          created_at: string | null
          parent_code: string | null
          subject: string
        }
        Insert: {
          code: string
          created_at?: string | null
          parent_code?: string | null
          subject: string
        }
        Update: {
          code?: string
          created_at?: string | null
          parent_code?: string | null
          subject?: string
        }
        Relationships: []
      }
      book_contributors: {
        Row: {
          book_id: string
          contributor_id: string
          created_at: string | null
          credited_as: string | null
          id: string
          role_id: string
          sort_order: number
        }
        Insert: {
          book_id: string
          contributor_id: string
          created_at?: string | null
          credited_as?: string | null
          id?: string
          role_id: string
          sort_order?: number
        }
        Update: {
          book_id?: string
          contributor_id?: string
          created_at?: string | null
          credited_as?: string | null
          id?: string
          role_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "book_contributors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_contributors_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_contributors_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "contributor_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_formats: {
        Row: {
          abbreviation: string | null
          created_at: string | null
          height_cm: number | null
          height_inches: number | null
          id: string
          joint_info: string | null
          leaves: number | null
          name: string
          pages: number | null
          type: string | null
          width_cm: number | null
          width_inches: number | null
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string | null
          height_cm?: number | null
          height_inches?: number | null
          id?: string
          joint_info?: string | null
          leaves?: number | null
          name: string
          pages?: number | null
          type?: string | null
          width_cm?: number | null
          width_inches?: number | null
        }
        Update: {
          abbreviation?: string | null
          created_at?: string | null
          height_cm?: number | null
          height_inches?: number | null
          id?: string
          joint_info?: string | null
          leaves?: number | null
          name?: string
          pages?: number | null
          type?: string | null
          width_cm?: number | null
          width_inches?: number | null
        }
        Relationships: []
      }
      book_images: {
        Row: {
          book_id: string
          book_part_id: string | null
          caption: string | null
          created_at: string | null
          file_size_bytes: number | null
          height: number | null
          id: string
          is_primary: boolean | null
          mime_type: string | null
          original_filename: string | null
          sort_order: number
          storage_path: string
          width: number | null
        }
        Insert: {
          book_id: string
          book_part_id?: string | null
          caption?: string | null
          created_at?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          mime_type?: string | null
          original_filename?: string | null
          sort_order?: number
          storage_path: string
          width?: number | null
        }
        Update: {
          book_id?: string
          book_part_id?: string | null
          caption?: string | null
          created_at?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          mime_type?: string | null
          original_filename?: string | null
          sort_order?: number
          storage_path?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "book_images_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_images_book_part_id_fkey"
            columns: ["book_part_id"]
            isOneToOne: false
            referencedRelation: "book_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      book_parts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          matter: string
          purpose: string
          sort_order: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          matter: string
          purpose: string
          sort_order?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          matter?: string
          purpose?: string
          sort_order?: number
        }
        Relationships: []
      }
      books: {
        Row: {
          acquired_currency: string | null
          acquired_date: string | null
          acquired_from: string | null
          acquired_notes: string | null
          acquired_price: number | null
          action_needed: string | null
          bibliography: string | null
          binding_id: string | null
          bisac_code: string | null
          bisac_code_2: string | null
          bisac_code_3: string | null
          catalog_entry: string | null
          collection_id: string | null
          colophon_text: string | null
          condition_id: string | null
          condition_notes: string | null
          cover_type: string | null
          created_at: string | null
          ddc: string | null
          dedication_text: string | null
          depth_mm: number | null
          dust_jacket_condition_id: string | null
          edge_treatment: string | null
          edition: string | null
          edition_notes: string | null
          endpapers_type: string | null
          estimated_value: number | null
          filemaker_id: string | null
          format_id: string | null
          has_dust_jacket: boolean | null
          height_cm: number | null
          height_mm: number | null
          highest_price: number | null
          id: string
          illustrations: string | null
          illustrations_description: string | null
          impression: string | null
          internal_notes: string | null
          is_signed: boolean | null
          isbn_10: string | null
          isbn_13: string | null
          issue_state: string | null
          language_id: string | null
          lcc: string | null
          lccn: string | null
          location_id: string | null
          lowest_price: number | null
          oclc_number: string | null
          original_language_id: string | null
          original_title: string | null
          page_count: number | null
          pagination: string | null
          pagination_description: string | null
          paper_type: string | null
          place_printed: string | null
          price_currency: string | null
          price_estimated: number | null
          price_highest: number | null
          price_lowest: number | null
          price_sales: number | null
          printer: string | null
          printer_id: string | null
          printing_place: string | null
          private_notes: string | null
          protective_enclosure: string | null
          provenance: string | null
          publication_place: string | null
          publication_year: string | null
          publisher_id: string | null
          publisher_name: string | null
          purchase_currency: string | null
          purchase_source: string | null
          sales_price: number | null
          series: string | null
          series_number: string | null
          shelf: string | null
          shelf_section: string | null
          signature_details: string | null
          signatures_description: string | null
          status: string
          storage_location: string | null
          storage_section: string | null
          storage_shelf: string | null
          subtitle: string | null
          summary: string | null
          text_block_condition: string | null
          title: string
          topic: string | null
          udc: string | null
          updated_at: string | null
          user_catalog_id: string | null
          user_id: string
          valuation_date: string | null
          volumes: string | null
          weight_g: number | null
          weight_grams: number | null
          width_cm: number | null
          width_mm: number | null
        }
        Insert: {
          acquired_currency?: string | null
          acquired_date?: string | null
          acquired_from?: string | null
          acquired_notes?: string | null
          acquired_price?: number | null
          action_needed?: string | null
          bibliography?: string | null
          binding_id?: string | null
          bisac_code?: string | null
          bisac_code_2?: string | null
          bisac_code_3?: string | null
          catalog_entry?: string | null
          collection_id?: string | null
          colophon_text?: string | null
          condition_id?: string | null
          condition_notes?: string | null
          cover_type?: string | null
          created_at?: string | null
          ddc?: string | null
          dedication_text?: string | null
          depth_mm?: number | null
          dust_jacket_condition_id?: string | null
          edge_treatment?: string | null
          edition?: string | null
          edition_notes?: string | null
          endpapers_type?: string | null
          estimated_value?: number | null
          filemaker_id?: string | null
          format_id?: string | null
          has_dust_jacket?: boolean | null
          height_cm?: number | null
          height_mm?: number | null
          highest_price?: number | null
          id?: string
          illustrations?: string | null
          illustrations_description?: string | null
          impression?: string | null
          internal_notes?: string | null
          is_signed?: boolean | null
          isbn_10?: string | null
          isbn_13?: string | null
          issue_state?: string | null
          language_id?: string | null
          lcc?: string | null
          lccn?: string | null
          location_id?: string | null
          lowest_price?: number | null
          oclc_number?: string | null
          original_language_id?: string | null
          original_title?: string | null
          page_count?: number | null
          pagination?: string | null
          pagination_description?: string | null
          paper_type?: string | null
          place_printed?: string | null
          price_currency?: string | null
          price_estimated?: number | null
          price_highest?: number | null
          price_lowest?: number | null
          price_sales?: number | null
          printer?: string | null
          printer_id?: string | null
          printing_place?: string | null
          private_notes?: string | null
          protective_enclosure?: string | null
          provenance?: string | null
          publication_place?: string | null
          publication_year?: string | null
          publisher_id?: string | null
          publisher_name?: string | null
          purchase_currency?: string | null
          purchase_source?: string | null
          sales_price?: number | null
          series?: string | null
          series_number?: string | null
          shelf?: string | null
          shelf_section?: string | null
          signature_details?: string | null
          signatures_description?: string | null
          status?: string
          storage_location?: string | null
          storage_section?: string | null
          storage_shelf?: string | null
          subtitle?: string | null
          summary?: string | null
          text_block_condition?: string | null
          title: string
          topic?: string | null
          udc?: string | null
          updated_at?: string | null
          user_catalog_id?: string | null
          user_id: string
          valuation_date?: string | null
          volumes?: string | null
          weight_g?: number | null
          weight_grams?: number | null
          width_cm?: number | null
          width_mm?: number | null
        }
        Update: {
          acquired_currency?: string | null
          acquired_date?: string | null
          acquired_from?: string | null
          acquired_notes?: string | null
          acquired_price?: number | null
          action_needed?: string | null
          bibliography?: string | null
          binding_id?: string | null
          bisac_code?: string | null
          bisac_code_2?: string | null
          bisac_code_3?: string | null
          catalog_entry?: string | null
          collection_id?: string | null
          colophon_text?: string | null
          condition_id?: string | null
          condition_notes?: string | null
          cover_type?: string | null
          created_at?: string | null
          ddc?: string | null
          dedication_text?: string | null
          depth_mm?: number | null
          dust_jacket_condition_id?: string | null
          edge_treatment?: string | null
          edition?: string | null
          edition_notes?: string | null
          endpapers_type?: string | null
          estimated_value?: number | null
          filemaker_id?: string | null
          format_id?: string | null
          has_dust_jacket?: boolean | null
          height_cm?: number | null
          height_mm?: number | null
          highest_price?: number | null
          id?: string
          illustrations?: string | null
          illustrations_description?: string | null
          impression?: string | null
          internal_notes?: string | null
          is_signed?: boolean | null
          isbn_10?: string | null
          isbn_13?: string | null
          issue_state?: string | null
          language_id?: string | null
          lcc?: string | null
          lccn?: string | null
          location_id?: string | null
          lowest_price?: number | null
          oclc_number?: string | null
          original_language_id?: string | null
          original_title?: string | null
          page_count?: number | null
          pagination?: string | null
          pagination_description?: string | null
          paper_type?: string | null
          place_printed?: string | null
          price_currency?: string | null
          price_estimated?: number | null
          price_highest?: number | null
          price_lowest?: number | null
          price_sales?: number | null
          printer?: string | null
          printer_id?: string | null
          printing_place?: string | null
          private_notes?: string | null
          protective_enclosure?: string | null
          provenance?: string | null
          publication_place?: string | null
          publication_year?: string | null
          publisher_id?: string | null
          publisher_name?: string | null
          purchase_currency?: string | null
          purchase_source?: string | null
          sales_price?: number | null
          series?: string | null
          series_number?: string | null
          shelf?: string | null
          shelf_section?: string | null
          signature_details?: string | null
          signatures_description?: string | null
          status?: string
          storage_location?: string | null
          storage_section?: string | null
          storage_shelf?: string | null
          subtitle?: string | null
          summary?: string | null
          text_block_condition?: string | null
          title?: string
          topic?: string | null
          udc?: string | null
          updated_at?: string | null
          user_catalog_id?: string | null
          user_id?: string
          valuation_date?: string | null
          volumes?: string | null
          weight_g?: number | null
          weight_grams?: number | null
          width_cm?: number | null
          width_mm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "books_binding_id_fkey"
            columns: ["binding_id"]
            isOneToOne: false
            referencedRelation: "bindings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_bisac_code_fkey"
            columns: ["bisac_code"]
            isOneToOne: false
            referencedRelation: "bisac_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "books_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_dust_jacket_condition_id_fkey"
            columns: ["dust_jacket_condition_id"]
            isOneToOne: false
            referencedRelation: "conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "book_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "user_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_original_language_id_fkey"
            columns: ["original_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      conditions: {
        Row: {
          abbreviation: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          abbreviation: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          abbreviation?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      contributor_aliases: {
        Row: {
          alias_type: string
          contributor_id: string
          created_at: string | null
          id: string
          language_id: string | null
          name: string
        }
        Insert: {
          alias_type: string
          contributor_id: string
          created_at?: string | null
          id?: string
          language_id?: string | null
          name: string
        }
        Update: {
          alias_type?: string
          contributor_id?: string
          created_at?: string | null
          id?: string
          language_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributor_aliases_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributor_aliases_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      contributor_roles: {
        Row: {
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      contributors: {
        Row: {
          birth_year: number | null
          canonical_name: string
          created_at: string | null
          created_by_user_id: string | null
          death_year: number | null
          display_name: string | null
          family_name: string | null
          filemaker_id: string | null
          given_names: string | null
          id: string
          is_verified: boolean | null
          isni: string | null
          name_prefix: string | null
          name_suffix: string | null
          sort_name: string
          type: string | null
          viaf_id: string | null
          wikidata_id: string | null
        }
        Insert: {
          birth_year?: number | null
          canonical_name: string
          created_at?: string | null
          created_by_user_id?: string | null
          death_year?: number | null
          display_name?: string | null
          family_name?: string | null
          filemaker_id?: string | null
          given_names?: string | null
          id?: string
          is_verified?: boolean | null
          isni?: string | null
          name_prefix?: string | null
          name_suffix?: string | null
          sort_name: string
          type?: string | null
          viaf_id?: string | null
          wikidata_id?: string | null
        }
        Update: {
          birth_year?: number | null
          canonical_name?: string
          created_at?: string | null
          created_by_user_id?: string | null
          death_year?: number | null
          display_name?: string | null
          family_name?: string | null
          filemaker_id?: string | null
          given_names?: string | null
          id?: string
          is_verified?: boolean | null
          isni?: string | null
          name_prefix?: string | null
          name_suffix?: string | null
          sort_name?: string
          type?: string | null
          viaf_id?: string | null
          wikidata_id?: string | null
        }
        Relationships: []
      }
      dewey_classifications: {
        Row: {
          created_at: string | null
          ddc: string
          first_summary: string
          second_summary: string | null
          third_summary: string | null
        }
        Insert: {
          created_at?: string | null
          ddc: string
          first_summary: string
          second_summary?: string | null
          third_summary?: string | null
        }
        Update: {
          created_at?: string | null
          ddc?: string
          first_summary?: string
          second_summary?: string | null
          third_summary?: string | null
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name_en: string
          name_native: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name_en: string
          name_native?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name_en?: string
          name_native?: string | null
        }
        Relationships: []
      }
      publishers: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          created_by_user_id: string | null
          founded_year: number | null
          id: string
          is_verified: boolean | null
          name: string
          viaf_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          founded_year?: number | null
          id?: string
          is_verified?: boolean | null
          name: string
          viaf_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          founded_year?: number | null
          id?: string
          is_verified?: boolean | null
          name?: string
          viaf_id?: string | null
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          admin_role: string | null
          avatar_url: string | null
          created_at: string | null
          default_currency: string | null
          default_size_unit: string | null
          display_name: string | null
          id: string
          is_admin: boolean | null
          is_lifetime_free: boolean | null
          membership_tier: string | null
          notes: string | null
          signup_source: string | null
          status: string | null
          status_reason: string | null
          updated_at: string | null
        }
        Insert: {
          admin_role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_size_unit?: string | null
          display_name?: string | null
          id: string
          is_admin?: boolean | null
          is_lifetime_free?: boolean | null
          membership_tier?: string | null
          notes?: string | null
          signup_source?: string | null
          status?: string | null
          status_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_size_unit?: string | null
          display_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_lifetime_free?: boolean | null
          membership_tier?: string | null
          notes?: string | null
          signup_source?: string | null
          status?: string | null
          status_reason?: string | null
          updated_at?: string | null
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
      book_status:
        | "in_collection"
        | "wishlist"
        | "on_sale"
        | "sold"
        | "lent"
        | "ordered"
        | "lost"
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
      book_status: [
        "in_collection",
        "wishlist",
        "on_sale",
        "sold",
        "lent",
        "ordered",
        "lost",
      ],
    },
  },
} as const
