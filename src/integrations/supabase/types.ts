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
      comandas: {
        Row: {
          cliente: string
          criada_em: string
          id: number
          itens: Json
          total: number
        }
        Insert: {
          cliente: string
          criada_em?: string
          id?: number
          itens?: Json
          total?: number
        }
        Update: {
          cliente?: string
          criada_em?: string
          id?: number
          itens?: Json
          total?: number
        }
        Relationships: []
      }
      comandas_fechadas: {
        Row: {
          cliente: string
          comanda_id: number
          criada_em: string
          fechada_em: string
          forma_pagamento: string
          id: number
          itens: Json
          taxa_aplicada: number
          total: number
        }
        Insert: {
          cliente: string
          comanda_id: number
          criada_em: string
          fechada_em?: string
          forma_pagamento: string
          id?: number
          itens?: Json
          taxa_aplicada?: number
          total?: number
        }
        Update: {
          cliente?: string
          comanda_id?: number
          criada_em?: string
          fechada_em?: string
          forma_pagamento?: string
          id?: number
          itens?: Json
          taxa_aplicada?: number
          total?: number
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          estoque_configurado: boolean
          id: number
          proximo_numero: number
          updated_at: string
        }
        Insert: {
          estoque_configurado?: boolean
          id?: number
          proximo_numero?: number
          updated_at?: string
        }
        Update: {
          estoque_configurado?: boolean
          id?: number
          proximo_numero?: number
          updated_at?: string
        }
        Relationships: []
      }
      estoque: {
        Row: {
          created_at: string
          id: number
          nome: string
          preco_custo: number
          preco_venda: number
          quantidade: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          nome: string
          preco_custo?: number
          preco_venda?: number
          quantidade?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string
          preco_custo?: number
          preco_venda?: number
          quantidade?: number
          updated_at?: string
        }
        Relationships: []
      }
      historico_diario: {
        Row: {
          comandas: number
          created_at: string
          data: string
          id: number
          por_forma_pagamento: Json
          ticket_medio: number
          vendas: number
        }
        Insert: {
          comandas?: number
          created_at?: string
          data: string
          id?: number
          por_forma_pagamento?: Json
          ticket_medio?: number
          vendas?: number
        }
        Update: {
          comandas?: number
          created_at?: string
          data?: string
          id?: number
          por_forma_pagamento?: Json
          ticket_medio?: number
          vendas?: number
        }
        Relationships: []
      }
      perdas: {
        Row: {
          custo_total: number
          horario: string
          id: string
          produto: string
          quantidade: number
        }
        Insert: {
          custo_total: number
          horario?: string
          id?: string
          produto: string
          quantidade: number
        }
        Update: {
          custo_total?: number
          horario?: string
          id?: string
          produto?: string
          quantidade?: number
        }
        Relationships: []
      }
      taxas: {
        Row: {
          credito: number
          debito: number
          id: number
          pix: number
          updated_at: string
        }
        Insert: {
          credito?: number
          debito?: number
          id?: number
          pix?: number
          updated_at?: string
        }
        Update: {
          credito?: number
          debito?: number
          id?: number
          pix?: number
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
    Enums: {},
  },
} as const
