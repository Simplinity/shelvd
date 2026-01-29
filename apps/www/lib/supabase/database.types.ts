export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Reference Tables (read-only)
      conditions: {
        Row: {
          id: number
          code: string
          name: string
          description: string | null
          sort_order: number
        }
        Insert: never
        Update: never
      }
      bindings: {
        Row: {
          id: number
          name: string
          description: string | null
        }
        Insert: never
        Update: never
      }
      book_parts: {
        Row: {
          id: number
          name: string
          description: string | null
          category: string | null
        }
        Insert: never
        Update: never
      }
      book_formats: {
        Row: {
          id: number
          name: string
          height_min_cm: number | null
          height_max_cm: number | null
          description: string | null
        }
        Insert: never
        Update: never
      }
      languages: {
        Row: {
          id: number
          code: string
          name: string
          native_name: string | null
        }
        Insert: never
        Update: never
      }
      contributor_roles: {
        Row: {
          id: number
          code: string
          name: string
          description: string | null
        }
        Insert: never
        Update: never
      }
      dewey_classifications: {
        Row: {
          id: number
          code: string
          name: string
          parent_code: string | null
        }
        Insert: never
        Update: never
      }
      bisac_codes: {
        Row: {
          id: number
          code: string
          name: string
          parent_code: string | null
        }
        Insert: never
        Update: never
      }

      // User Data Tables
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      contributors: {
        Row: {
          id: string
          user_id: string
          name: string
          sort_name: string | null
          birth_year: number | null
          death_year: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          sort_name?: string | null
          birth_year?: number | null
          death_year?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          sort_name?: string | null
          birth_year?: number | null
          death_year?: number | null
          notes?: string | null
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          user_id: string
          title: string
          subtitle: string | null
          edition: string | null
          year_published: number | null
          publisher: string | null
          place_published: string | null
          isbn: string | null
          pages: number | null
          condition_id: number | null
          binding_id: number | null
          format_id: number | null
          language_id: number | null
          dewey_id: number | null
          bisac_id: number | null
          purchase_price: number | null
          purchase_date: string | null
          purchase_location: string | null
          current_value: number | null
          notes: string | null
          is_signed: boolean
          is_first_edition: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          subtitle?: string | null
          edition?: string | null
          year_published?: number | null
          publisher?: string | null
          place_published?: string | null
          isbn?: string | null
          pages?: number | null
          condition_id?: number | null
          binding_id?: number | null
          format_id?: number | null
          language_id?: number | null
          dewey_id?: number | null
          bisac_id?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          purchase_location?: string | null
          current_value?: number | null
          notes?: string | null
          is_signed?: boolean
          is_first_edition?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          subtitle?: string | null
          edition?: string | null
          year_published?: number | null
          publisher?: string | null
          place_published?: string | null
          isbn?: string | null
          pages?: number | null
          condition_id?: number | null
          binding_id?: number | null
          format_id?: number | null
          language_id?: number | null
          dewey_id?: number | null
          bisac_id?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          purchase_location?: string | null
          current_value?: number | null
          notes?: string | null
          is_signed?: boolean
          is_first_edition?: boolean
          updated_at?: string
        }
      }
      book_contributors: {
        Row: {
          id: string
          book_id: string
          contributor_id: string
          role_id: number
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          contributor_id: string
          role_id: number
          created_at?: string
        }
        Update: {
          role_id?: number
        }
      }
      book_images: {
        Row: {
          id: string
          book_id: string
          url: string
          caption: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          url: string
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          url?: string
          caption?: string | null
          sort_order?: number
        }
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
  }
}

// Convenience types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Profile = Tables<'profiles'>
export type Book = Tables<'books'>
export type Contributor = Tables<'contributors'>
export type Condition = Tables<'conditions'>
export type Binding = Tables<'bindings'>
export type BookFormat = Tables<'book_formats'>
export type Language = Tables<'languages'>
export type ContributorRole = Tables<'contributor_roles'>
