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
      about_me: {
        Row: {
          client_focused_text: string | null
          created_at: string | null
          id: string
          owner_bio: string
          owner_location: string | null
          owner_name: string
          owner_photo_url: string | null
          owner_skills: string
          owner_title: string
          quality_first_text: string | null
          updated_at: string | null
        }
        Insert: {
          client_focused_text?: string | null
          created_at?: string | null
          id?: string
          owner_bio: string
          owner_location?: string | null
          owner_name: string
          owner_photo_url?: string | null
          owner_skills: string
          owner_title: string
          quality_first_text?: string | null
          updated_at?: string | null
        }
        Update: {
          client_focused_text?: string | null
          created_at?: string | null
          id?: string
          owner_bio?: string
          owner_location?: string | null
          owner_name?: string
          owner_photo_url?: string | null
          owner_skills?: string
          owner_title?: string
          quality_first_text?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_credentials: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      animation_settings: {
        Row: {
          accent_color: string | null
          animation_intensity: number | null
          animation_speed: string | null
          background_color: string | null
          created_at: string | null
          enable_3d_effects: boolean | null
          hover_animations: boolean | null
          id: string
          loading_animations: boolean | null
          particle_effects: boolean | null
          scroll_animations: boolean | null
          secondary_accent_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          animation_intensity?: number | null
          animation_speed?: string | null
          background_color?: string | null
          created_at?: string | null
          enable_3d_effects?: boolean | null
          hover_animations?: boolean | null
          id?: string
          loading_animations?: boolean | null
          particle_effects?: boolean | null
          scroll_animations?: boolean | null
          secondary_accent_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          animation_intensity?: number | null
          animation_speed?: string | null
          background_color?: string | null
          created_at?: string | null
          enable_3d_effects?: boolean | null
          hover_animations?: boolean | null
          id?: string
          loading_animations?: boolean | null
          particle_effects?: boolean | null
          scroll_animations?: boolean | null
          secondary_accent_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_logos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          logo_url: string
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          display_order: number
          id?: string
          logo_url: string
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          logo_url?: string
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      design_settings: {
        Row: {
          background: Json | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          background?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          background?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      general_settings: {
        Row: {
          contact_email: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          showreel_url: string | null
          site_description: string
          site_name: string
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          showreel_url?: string | null
          site_description?: string
          site_name?: string
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          showreel_url?: string | null
          site_description?: string
          site_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean | null
          subject?: string
        }
        Relationships: []
      }
      performance_settings: {
        Row: {
          caching_enabled: boolean | null
          created_at: string | null
          enable_animations: boolean | null
          enable_image_optimization: boolean | null
          enable_parallax: boolean | null
          id: string
          lazy_load_images: boolean | null
          updated_at: string | null
        }
        Insert: {
          caching_enabled?: boolean | null
          created_at?: string | null
          enable_animations?: boolean | null
          enable_image_optimization?: boolean | null
          enable_parallax?: boolean | null
          id?: string
          lazy_load_images?: boolean | null
          updated_at?: string | null
        }
        Update: {
          caching_enabled?: boolean | null
          created_at?: string | null
          enable_animations?: boolean | null
          enable_image_optimization?: boolean | null
          enable_parallax?: boolean | null
          id?: string
          lazy_load_images?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          created_at: string
          description: string
          featured: boolean | null
          id: string
          image_url: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          featured?: boolean | null
          id?: string
          image_url: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          featured?: boolean | null
          id?: string
          image_url?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          created_at: string | null
          id: string
          keywords: string | null
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          keywords?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          keywords?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_features: {
        Row: {
          created_at: string
          feature: string
          id: string
          service_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          service_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_features_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          description: string
          icon: string
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_settings: {
        Row: {
          created_at: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author: string
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          position: string
          rating: number
        }
        Insert: {
          author: string
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          position: string
          rating: number
        }
        Update: {
          author?: string
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          position?: string
          rating?: number
        }
        Relationships: []
      }
      user_ratings: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          photo_url: string | null
          project_id: string
          rating: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          photo_url?: string | null
          project_id: string
          rating: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          photo_url?: string | null
          project_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_message: {
        Args: {
          p_name: string
          p_email: string
          p_subject: string
          p_message: string
        }
        Returns: string
      }
      demote_to_user: {
        Args: {
          user_id_to_demote: string
        }
        Returns: boolean
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      promote_to_admin: {
        Args: {
          user_id_to_promote: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
