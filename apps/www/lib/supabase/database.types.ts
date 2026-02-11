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
      activity_log: {
        Row: {
          action: string
          category: string
          created_at: string
          entity_id: string | null
          entity_label: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          category: string
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string | null
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          message: string
          starts_at: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          starts_at?: string | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          starts_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
      book_collections: {
        Row: {
          added_at: string
          book_id: string
          collection_id: string
        }
        Insert: {
          added_at?: string
          book_id: string
          collection_id: string
        }
        Update: {
          added_at?: string
          book_id?: string
          collection_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_collections_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
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
      book_external_links: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          label: string | null
          link_type_id: string | null
          notes: string | null
          sort_order: number | null
          url: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id?: string
          label?: string | null
          link_type_id?: string | null
          notes?: string | null
          sort_order?: number | null
          url: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          label?: string | null
          link_type_id?: string | null
          notes?: string | null
          sort_order?: number | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_external_links_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_external_links_link_type_id_fkey"
            columns: ["link_type_id"]
            isOneToOne: false
            referencedRelation: "external_link_types"
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
      book_tags: {
        Row: {
          added_at: string
          book_id: string
          tag_id: string
        }
        Insert: {
          added_at?: string
          book_id: string
          tag_id: string
        }
        Update: {
          added_at?: string
          book_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_tags_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
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
          cover_image_url: string | null
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
          printer: string | null
          printer_id: string | null
          printing_place: string | null
          private_notes: string | null
          protective_enclosure: string | null
          publication_place: string | null
          publication_year: string | null
          publisher_id: string | null
          publisher_name: string | null
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
          cover_image_url?: string | null
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
          printer?: string | null
          printer_id?: string | null
          printing_place?: string | null
          private_notes?: string | null
          protective_enclosure?: string | null
          publication_place?: string | null
          publication_year?: string | null
          publisher_id?: string | null
          publisher_name?: string | null
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
          cover_image_url?: string | null
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
          printer?: string | null
          printer_id?: string | null
          printing_place?: string | null
          private_notes?: string | null
          protective_enclosure?: string | null
          publication_place?: string | null
          publication_year?: string | null
          publisher_id?: string | null
          publisher_name?: string | null
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
      collections: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_default: boolean
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      condition_history: {
        Row: {
          after_condition_id: string | null
          before_condition_id: string | null
          book_id: string
          cost: number | null
          cost_currency: string | null
          created_at: string | null
          description: string | null
          event_date: string | null
          event_type: string
          id: string
          notes: string | null
          performed_by: string | null
          position: number
          updated_at: string | null
        }
        Insert: {
          after_condition_id?: string | null
          before_condition_id?: string | null
          book_id: string
          cost?: number | null
          cost_currency?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          position?: number
          updated_at?: string | null
        }
        Update: {
          after_condition_id?: string | null
          before_condition_id?: string | null
          book_id?: string
          cost?: number | null
          cost_currency?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condition_history_after_condition_id_fkey"
            columns: ["after_condition_id"]
            isOneToOne: false
            referencedRelation: "conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condition_history_before_condition_id_fkey"
            columns: ["before_condition_id"]
            isOneToOne: false
            referencedRelation: "conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condition_history_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
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
      external_link_types: {
        Row: {
          category: string
          created_at: string | null
          domain: string | null
          id: string
          is_system: boolean | null
          label: string
          slug: string
          sort_order: number | null
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          domain?: string | null
          id?: string
          is_system?: boolean | null
          label: string
          slug: string
          sort_order?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          domain?: string | null
          id?: string
          is_system?: boolean | null
          label?: string
          slug?: string
          sort_order?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_notes: string | null
          admin_response: string | null
          browser_info: Json | null
          category: string | null
          created_at: string
          id: string
          message: string | null
          phone: string | null
          preferred_response: string | null
          preferred_time: string | null
          priority: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string
          steps_to_reproduce: string | null
          subject: string | null
          timezone: string | null
          type: string
          updated_at: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          admin_response?: string | null
          browser_info?: Json | null
          category?: string | null
          created_at?: string
          id?: string
          message?: string | null
          phone?: string | null
          preferred_response?: string | null
          preferred_time?: string | null
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string
          steps_to_reproduce?: string | null
          subject?: string | null
          timezone?: string | null
          type: string
          updated_at?: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          admin_response?: string | null
          browser_info?: Json | null
          category?: string | null
          created_at?: string
          id?: string
          message?: string | null
          phone?: string | null
          preferred_response?: string | null
          preferred_time?: string | null
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string
          steps_to_reproduce?: string | null
          subject?: string | null
          timezone?: string | null
          type?: string
          updated_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invite_code_redemptions: {
        Row: {
          code_id: string
          id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          code_id: string
          id?: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          code_id?: string
          id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_code_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "invite_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          benefit_days: number | null
          benefit_type: string
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          label: string | null
          max_uses: number | null
          source_name: string | null
          source_type: string
          times_used: number
        }
        Insert: {
          benefit_days?: number | null
          benefit_type?: string
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          max_uses?: number | null
          source_name?: string | null
          source_type?: string
          times_used?: number
        }
        Update: {
          benefit_days?: number | null
          benefit_type?: string
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          max_uses?: number | null
          source_name?: string | null
          source_type?: string
          times_used?: number
        }
        Relationships: []
      }
      isbn_providers: {
        Row: {
          base_url: string | null
          code: string
          country: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_enabled: boolean | null
          name: string
          provider_type: string
        }
        Insert: {
          base_url?: string | null
          code: string
          country?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          name: string
          provider_type: string
        }
        Update: {
          base_url?: string | null
          code?: string
          country?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          provider_type?: string
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
      provenance_entries: {
        Row: {
          association_note: string | null
          association_type: string | null
          book_id: string
          created_at: string | null
          date_from: string | null
          date_to: string | null
          evidence_description: string | null
          evidence_type: string[] | null
          id: string
          notes: string | null
          owner_name: string
          owner_type: string
          position: number
          price_currency: string | null
          price_paid: number | null
          transaction_detail: string | null
          transaction_type: string | null
          updated_at: string | null
        }
        Insert: {
          association_note?: string | null
          association_type?: string | null
          book_id: string
          created_at?: string | null
          date_from?: string | null
          date_to?: string | null
          evidence_description?: string | null
          evidence_type?: string[] | null
          id?: string
          notes?: string | null
          owner_name: string
          owner_type?: string
          position?: number
          price_currency?: string | null
          price_paid?: number | null
          transaction_detail?: string | null
          transaction_type?: string | null
          updated_at?: string | null
        }
        Update: {
          association_note?: string | null
          association_type?: string | null
          book_id?: string
          created_at?: string | null
          date_from?: string | null
          date_to?: string | null
          evidence_description?: string | null
          evidence_type?: string[] | null
          id?: string
          notes?: string | null
          owner_name?: string
          owner_type?: string
          position?: number
          price_currency?: string | null
          price_paid?: number | null
          transaction_detail?: string | null
          transaction_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provenance_entries_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      provenance_sources: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          provenance_entry_id: string
          reference: string | null
          source_type: string
          title: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          provenance_entry_id: string
          reference?: string | null
          source_type?: string
          title?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          provenance_entry_id?: string
          reference?: string | null
          source_type?: string
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provenance_sources_provenance_entry_id_fkey"
            columns: ["provenance_entry_id"]
            isOneToOne: false
            referencedRelation: "provenance_entries"
            referencedColumns: ["id"]
          },
        ]
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
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_active_link_types: {
        Row: {
          created_at: string | null
          link_type_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          link_type_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          link_type_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_active_link_types_link_type_id_fkey"
            columns: ["link_type_id"]
            isOneToOne: false
            referencedRelation: "external_link_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_isbn_providers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          provider_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          provider_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          provider_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_isbn_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "isbn_providers"
            referencedColumns: ["id"]
          },
        ]
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
          benefit_expires_at: string | null
          city: string | null
          country: string | null
          created_at: string | null
          default_currency: string | null
          default_size_unit: string | null
          display_name: string | null
          full_name: string | null
          id: string
          invite_code_id: string | null
          is_admin: boolean | null
          is_lifetime_free: boolean | null
          items_per_page_grid: number | null
          items_per_page_list: number | null
          locale: string | null
          membership_tier: string | null
          notes: string | null
          postal_code: string | null
          signup_source: string | null
          status: string | null
          status_reason: string | null
          street_address: string | null
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          admin_role?: string | null
          avatar_url?: string | null
          benefit_expires_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_size_unit?: string | null
          display_name?: string | null
          full_name?: string | null
          id: string
          invite_code_id?: string | null
          is_admin?: boolean | null
          is_lifetime_free?: boolean | null
          items_per_page_grid?: number | null
          items_per_page_list?: number | null
          locale?: string | null
          membership_tier?: string | null
          notes?: string | null
          postal_code?: string | null
          signup_source?: string | null
          status?: string | null
          status_reason?: string | null
          street_address?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          admin_role?: string | null
          avatar_url?: string | null
          benefit_expires_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_size_unit?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          invite_code_id?: string | null
          is_admin?: boolean | null
          is_lifetime_free?: boolean | null
          items_per_page_grid?: number | null
          items_per_page_list?: number | null
          locale?: string | null
          membership_tier?: string | null
          notes?: string | null
          postal_code?: string | null
          signup_source?: string | null
          status?: string | null
          status_reason?: string | null
          street_address?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_invite_code_id_fkey"
            columns: ["invite_code_id"]
            isOneToOne: false
            referencedRelation: "invite_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          calculated_at: string
          created_at: string
          id: string
          stats: Json
          user_id: string
        }
        Insert: {
          calculated_at?: string
          created_at?: string
          id?: string
          stats?: Json
          user_id: string
        }
        Update: {
          calculated_at?: string
          created_at?: string
          id?: string
          stats?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: { Args: { target_user_id: string }; Returns: boolean }
      find_fuzzy_title_duplicates: {
        Args: { similarity_threshold: number }
        Returns: {
          books: Json
          similarity: number
          title: string
        }[]
      }
      find_isbn10_duplicates: {
        Args: never
        Returns: {
          books: Json
          isbn_10: string
        }[]
      }
      find_isbn13_duplicates: {
        Args: never
        Returns: {
          books: Json
          isbn_13: string
        }[]
      }
      find_title_duplicates: {
        Args: never
        Returns: {
          books: Json
          title: string
        }[]
      }
      get_activity_count_filtered: {
        Args: {
          category_filter?: string
          search_filter?: string
          user_filter?: string
        }
        Returns: number
      }
      get_activity_count_for_admin: {
        Args: { since?: string }
        Returns: number
      }
      get_activity_page_for_admin: {
        Args: {
          category_filter?: string
          lim?: number
          off_set?: number
          search_filter?: string
          user_filter?: string
        }
        Returns: {
          action: string
          category: string
          created_at: string
          entity_id: string
          entity_label: string
          entity_type: string
          id: string
          metadata: Json
          source: string
          user_email: string
          user_id: string
        }[]
      }
      get_book_counts_for_admin: {
        Args: never
        Returns: {
          book_count: number
          user_id: string
        }[]
      }
      get_books_by_condition_for_admin: {
        Args: never
        Returns: {
          condition_name: string
          count: number
        }[]
      }
      get_books_by_month_for_admin: {
        Args: never
        Returns: {
          count: number
          month: string
        }[]
      }
      get_books_by_status_for_admin: {
        Args: never
        Returns: {
          count: number
          status: string
        }[]
      }
      get_books_per_user_for_admin: {
        Args: never
        Returns: {
          book_count: number
          email: string
          user_id: string
        }[]
      }
      get_code_redemptions_for_admin: {
        Args: { p_code_id: string }
        Returns: {
          book_count: number
          redeemed_at: string
          user_email: string
          user_id: string
          user_status: string
        }[]
      }
      get_invite_codes_for_admin: {
        Args: never
        Returns: {
          benefit_days: number
          benefit_type: string
          code: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          label: string
          max_uses: number
          source_name: string
          source_type: string
          times_used: number
        }[]
      }
      get_platform_stats_for_admin: {
        Args: never
        Returns: {
          books_no_condition: number
          books_no_isbn: number
          books_no_publisher: number
          total_books: number
          total_collections: number
          total_contributors: number
          total_external_links: number
          total_feedback: number
          total_provenance: number
          total_tags: number
          total_users: number
        }[]
      }
      get_public_stats: { Args: never; Returns: Json }
      get_recent_activity_for_admin: {
        Args: { category_filter?: string; lim?: number; user_filter?: string }
        Returns: {
          action: string
          category: string
          created_at: string
          entity_id: string
          entity_label: string
          entity_type: string
          id: string
          metadata: Json
          source: string
          user_email: string
          user_id: string
        }[]
      }
      get_signups_by_week_for_admin: {
        Args: never
        Returns: {
          count: number
          week: string
        }[]
      }
      get_top_publishers_for_admin: {
        Args: { lim?: number }
        Returns: {
          count: number
          publisher: string
        }[]
      }
      get_total_books_for_admin: { Args: never; Returns: number }
      get_user_collections_for_admin: {
        Args: { target_user_id: string }
        Returns: {
          id: string
          is_default: boolean
          name: string
        }[]
      }
      get_user_detail_for_admin: {
        Args: { target_user_id: string }
        Returns: {
          book_count: number
          collection_count: number
          recent_book_count: number
          ticket_count: number
          unique_contributors: number
          unique_tags: number
        }[]
      }
      get_user_isbn_providers: {
        Args: never
        Returns: {
          base_url: string
          code: string
          country: string
          is_active: boolean
          name: string
          priority: number
          provider_id: string
          provider_type: string
        }[]
      }
      get_user_recent_books_for_admin: {
        Args: { lim?: number; target_user_id: string }
        Returns: {
          created_at: string
          id: string
          status: string
          title: string
        }[]
      }
      get_users_for_admin: {
        Args: never
        Returns: {
          created_at: string
          email: string
          email_confirmed_at: string
          id: string
          last_sign_in_at: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      redeem_invite_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
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
