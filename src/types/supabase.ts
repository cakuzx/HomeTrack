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
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          unit: string | null
          min_quantity: number | null
          current_quantity: number | null
          status: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          unit?: string | null
          min_quantity?: number | null
          current_quantity?: number | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          unit?: string | null
          min_quantity?: number | null
          current_quantity?: number | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          id: string
          product_id: string
          user_id: string
          purchase_date: string
          expiry_date: string | null
          quantity: number
          price: number
          store: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          purchase_date: string
          expiry_date?: string | null
          quantity: number
          price: number
          store?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          purchase_date?: string
          expiry_date?: string | null
          quantity?: number
          price?: number
          store?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      shopping_list: {
        Row: {
          id: string
          product_id: string
          user_id: string
          added_date: string | null
          priority: string | null
          is_purchased: boolean | null
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          added_date?: string | null
          priority?: string | null
          is_purchased?: boolean | null
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          added_date?: string | null
          priority?: string | null
          is_purchased?: boolean | null
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
  }
}
