
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tyczqgeyhjxwfyjgwmio.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5Y3pxZ2V5aGp4d2Z5amd3bWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjczNjAsImV4cCI6MjA1OTU0MzM2MH0.mdHOJ_HoKARetqHF73e-UVqpg4SS37CuoSORUtSHtL8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Since we can't directly modify the types.ts file, we'll create a custom client
// that includes the new tables we've added
type CustomDatabase = Database & {
  public: {
    Tables: {
      team_members: {
        Row: {
          id: string;
          name: string;
          position: string;
          bio: string | null;
          photo_url: string | null;
          social_links: Record<string, string> | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          position: string;
          bio?: string | null;
          photo_url?: string | null;
          social_links?: Record<string, string> | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          position?: string;
          bio?: string | null;
          photo_url?: string | null;
          social_links?: Record<string, string> | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_sections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          color: string;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_sections: {
        Row: {
          id: string;
          project_id: string;
          section_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          section_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          section_id?: string;
          created_at?: string;
        };
      };
    } & Database['public']['Tables'];
  };
};

export const supabase = createClient<CustomDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper functions
export const getDefaultAvatar = () => "/placeholder.svg";

export const getDisplayNameOrEmail = (profile: any) => {
  return profile?.display_name || profile?.email || 'Anonymous User';
};

export const deleteUserRating = async (id: string) => {
  return await supabase.from('user_ratings').delete().eq('id', id);
};

export const refreshSiteSettings = async () => {
  try {
    // Fetch settings from various tables
    const [
      { data: generalData, error: generalError },
      { data: performanceData, error: performanceError },
      { data: animationData, error: animationError },
      { data: seoData, error: seoError },
      { data: socialData, error: socialError }
    ] = await Promise.all([
      supabase.from('general_settings').select('*').limit(1),
      supabase.from('performance_settings').select('*').limit(1),
      supabase.from('animation_settings').select('*').limit(1),
      supabase.from('seo_settings').select('*').limit(1),
      supabase.from('social_settings').select('*').limit(1)
    ]);
    
    if (generalError || performanceError || animationError || seoError || socialError) {
      throw new Error('Error fetching settings');
    }
    
    // Create a combined settings object
    const settings = {
      general: generalData?.[0] || {},
      performance: performanceData?.[0] || {},
      animation: animationData?.[0] || {},
      seo: seoData?.[0] || {},
      social: socialData?.[0] || {}
    };
    
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    return settings;
  } catch (error) {
    console.error('Error refreshing settings:', error);
    throw error;
  }
};
