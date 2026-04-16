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
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string
          id: string
          post_id: string
          texto: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          texto: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          texto?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      motivational_tips: {
        Row: {
          created_at: string
          emoji: string
          id: string
          texto: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          texto: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          texto?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          tipo: Database["public"]["Enums"]["post_type"]
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          tipo?: Database["public"]["Enums"]["post_type"]
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          tipo?: Database["public"]["Enums"]["post_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          dias_treinados: number
          email: string | null
          expira_em: string | null
          id: string
          nivel: string
          nome: string
          objetivo: string
          plano: Database["public"]["Enums"]["app_plan"]
          status: Database["public"]["Enums"]["plan_status"]
          streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          dias_treinados?: number
          email?: string | null
          expira_em?: string | null
          id?: string
          nivel?: string
          nome?: string
          objetivo?: string
          plano?: Database["public"]["Enums"]["app_plan"]
          status?: Database["public"]["Enums"]["plan_status"]
          streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          dias_treinados?: number
          email?: string | null
          expira_em?: string | null
          id?: string
          nivel?: string
          nome?: string
          objetivo?: string
          plano?: Database["public"]["Enums"]["app_plan"]
          status?: Database["public"]["Enums"]["plan_status"]
          streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          beneficios: string
          categoria: Database["public"]["Enums"]["recipe_category"]
          created_at: string
          emoji: string
          id: string
          ingredientes: string[]
          min_plan: Database["public"]["Enums"]["app_plan"]
          modo_preparo: string[]
          nome: string
          objetivo: string
          quando_consumir: string
        }
        Insert: {
          beneficios: string
          categoria: Database["public"]["Enums"]["recipe_category"]
          created_at?: string
          emoji?: string
          id?: string
          ingredientes?: string[]
          min_plan?: Database["public"]["Enums"]["app_plan"]
          modo_preparo?: string[]
          nome: string
          objetivo: string
          quando_consumir: string
        }
        Update: {
          beneficios?: string
          categoria?: Database["public"]["Enums"]["recipe_category"]
          created_at?: string
          emoji?: string
          id?: string
          ingredientes?: string[]
          min_plan?: Database["public"]["Enums"]["app_plan"]
          modo_preparo?: string[]
          nome?: string
          objetivo?: string
          quando_consumir?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          motivo: string
          post_id: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          motivo: string
          post_id: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          id?: string
          motivo?: string
          post_id?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          created_at: string
          descricao: string
          dias: Json
          id: string
          min_plan: Database["public"]["Enums"]["app_plan"]
          nivel: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao: string
          dias?: Json
          id?: string
          min_plan?: Database["public"]["Enums"]["app_plan"]
          nivel?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string
          dias?: Json
          id?: string
          min_plan?: Database["public"]["Enums"]["app_plan"]
          nivel?: string
          nome?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          duracao_min: number
          emoji: string
          exercicios: Json
          foco: Database["public"]["Enums"]["workout_focus"]
          id: string
          min_plan: Database["public"]["Enums"]["app_plan"]
          nivel: string
          nome: string
          series: number
        }
        Insert: {
          created_at?: string
          duracao_min: number
          emoji?: string
          exercicios?: Json
          foco: Database["public"]["Enums"]["workout_focus"]
          id?: string
          min_plan?: Database["public"]["Enums"]["app_plan"]
          nivel?: string
          nome: string
          series?: number
        }
        Update: {
          created_at?: string
          duracao_min?: number
          emoji?: string
          exercicios?: Json
          foco?: Database["public"]["Enums"]["workout_focus"]
          id?: string
          min_plan?: Database["public"]["Enums"]["app_plan"]
          nivel?: string
          nome?: string
          series?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_plan: "plus" | "pro"
      app_role: "admin" | "moderator" | "user"
      plan_status: "ativo" | "teste" | "expirado" | "pendente" | "rejeitado"
      post_type: "livre" | "progresso" | "pergunta"
      recipe_category:
        | "sopa_detox"
        | "cha"
        | "refeicao_leve"
        | "salada"
        | "suco"
      report_status: "pendente" | "resolvido" | "ignorado"
      workout_focus: "barriga" | "gluteo" | "pernas" | "corpo_todo" | "cardio"
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
      app_plan: ["plus", "pro"],
      app_role: ["admin", "moderator", "user"],
      plan_status: ["ativo", "teste", "expirado", "pendente", "rejeitado"],
      post_type: ["livre", "progresso", "pergunta"],
      recipe_category: ["sopa_detox", "cha", "refeicao_leve", "salada", "suco"],
      report_status: ["pendente", "resolvido", "ignorado"],
      workout_focus: ["barriga", "gluteo", "pernas", "corpo_todo", "cardio"],
    },
  },
} as const
