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
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          customer_id: string | null
          id: string
          postal_code: string | null
          state: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          postal_code?: string | null
          state: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          postal_code?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: number
          price: number
          quantity: number
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: number
          price: number
          quantity: number
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: number
          price?: number
          quantity?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string
          created_at: string
          currency: string
          customer_id: string
          exchange_rate_id: string | null
          id: number
          payment_status: string
          status: string
          total_amount: number
          total_cup: number | null
        }
        Insert: {
          address_id: string
          created_at?: string
          currency?: string
          customer_id: string
          exchange_rate_id?: string | null
          id?: number
          payment_status?: string
          status?: string
          total_amount: number
          total_cup?: number | null
        }
        Update: {
          address_id?: string
          created_at?: string
          currency?: string
          customer_id?: string
          exchange_rate_id?: string | null
          id?: number
          payment_status?: string
          status?: string
          total_amount?: number
          total_cup?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_exchange_rate_id_fkey"
            columns: ["exchange_rate_id"]
            isOneToOne: false
            referencedRelation: "exchange_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          creado_por: string | null
          id: string
          valor_cup_por_usd: number
          vigente_desde: string
        }
        Insert: {
          creado_por?: string | null
          id?: string
          valor_cup_por_usd: number
          vigente_desde?: string
        }
        Update: {
          creado_por?: string | null
          id?: string
          valor_cup_por_usd?: number
          vigente_desde?: string
        }
        Relationships: []
      }
      payment_accounts: {
        Row: {
          activa: boolean
          created_at: string
          id: string
          prioridad: number
          referencia: string
          tipo: string
          titular: string
        }
        Insert: {
          activa?: boolean
          created_at?: string
          id?: string
          prioridad?: number
          referencia: string
          tipo: string
          titular: string
        }
        Update: {
          activa?: boolean
          created_at?: string
          id?: string
          prioridad?: number
          referencia?: string
          tipo?: string
          titular?: string
        }
        Relationships: []
      }
      payment_proofs: {
        Row: {
          created_at: string
          estado: string
          id: string
          imagen_url: string
          nota_operador: string | null
          operador_id: string | null
          order_id: number
          payment_account_id: string | null
          reviewed_at: string | null
        }
        Insert: {
          created_at?: string
          estado?: string
          id?: string
          imagen_url: string
          nota_operador?: string | null
          operador_id?: string | null
          order_id: number
          payment_account_id?: string | null
          reviewed_at?: string | null
        }
        Update: {
          created_at?: string
          estado?: string
          id?: string
          imagen_url?: string
          nota_operador?: string | null
          operador_id?: string | null
          order_id?: number
          payment_account_id?: string | null
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_payment_account_id_fkey"
            columns: ["payment_account_id"]
            isOneToOne: false
            referencedRelation: "payment_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      combos: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          precio_combo_usd: number
          slug: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          precio_combo_usd: number
          slug: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          precio_combo_usd?: number
          slug?: string
        }
        Relationships: []
      }
      combo_items: {
        Row: {
          cantidad: number
          combo_id: string
          id: string
          variant_id: string
        }
        Insert: {
          cantidad?: number
          combo_id: string
          id?: string
          variant_id: string
        }
        Update: {
          cantidad?: number
          combo_id?: string
          id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "combo_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combo_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_roles: {
        Row: {
          activo: boolean
          id: string
          nombre: string
          porcentaje: number
        }
        Insert: {
          activo?: boolean
          id?: string
          nombre: string
          porcentaje: number
        }
        Update: {
          activo?: boolean
          id?: string
          nombre?: string
          porcentaje?: number
        }
        Relationships: []
      }
      liquidations: {
        Row: {
          created_at: string
          delivery_role_id: string
          id: string
          monto_calculado: number
          order_id: number
          pagado: boolean
          periodo: string
        }
        Insert: {
          created_at?: string
          delivery_role_id: string
          id?: string
          monto_calculado: number
          order_id: number
          pagado?: boolean
          periodo?: string
        }
        Update: {
          created_at?: string
          delivery_role_id?: string
          id?: string
          monto_calculado?: number
          order_id?: number
          pagado?: boolean
          periodo?: string
        }
        Relationships: [
          {
            foreignKeyName: "liquidations_delivery_role_id_fkey"
            columns: ["delivery_role_id"]
            isOneToOne: false
            referencedRelation: "delivery_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liquidations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          created_at: string
          description: Json
          features: string[]
          id: string
          images: string[]
          name: string
          slug: string
        }
        Insert: {
          brand: string
          created_at?: string
          description: Json
          features: string[]
          id?: string
          images: string[]
          name: string
          slug: string
        }
        Update: {
          brand?: string
          created_at?: string
          description?: Json
          features?: string[]
          id?: string
          images?: string[]
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          role: string
          user_id: string | null
        }
        Insert: {
          id?: number
          role: string
          user_id?: string | null
        }
        Update: {
          id?: number
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      variants: {
        Row: {
          color: string
          color_name: string
          id: string
          price: number
          product_id: string
          stock: number
          storage: string
        }
        Insert: {
          color: string
          color_name: string
          id?: string
          price: number
          product_id: string
          stock: number
          storage: string
        }
        Update: {
          color?: string
          color_name?: string
          id?: string
          price?: number
          product_id?: string
          stock?: number
          storage?: string
        }
        Relationships: [
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
