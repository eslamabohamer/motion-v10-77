
import { supabase } from '@/integrations/supabase/client';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  showreelUrl: string;
  logoUrl: string;
}

interface PerformanceSettings {
  enableAnimations: boolean;
  enableParallax: boolean;
  lazyLoadImages: boolean;
  enableImageOptimization: boolean;
  cachingEnabled: boolean;
}

interface AnimationSettings {
  enable3DEffects: boolean;
  animationIntensity: number;
  scrollAnimations: boolean;
  hoverAnimations: boolean;
  loadingAnimations: boolean;
  particleEffects: boolean;
  backgroundColor: string;
  accentColor: string;
  secondaryAccentColor: string;
  animationSpeed: "slow" | "normal" | "fast";
}

interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  keywords: string;
}

interface SocialSettings {
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
}

interface AboutSettings {
  ownerName: string;
  ownerTitle: string;
  ownerBio: string;
  ownerPhotoUrl: string;
  ownerSkills: string;
  ownerLocation: string;
}

export interface SiteSettings {
  general: GeneralSettings;
  performance: PerformanceSettings;
  animation: AnimationSettings;
  seo: SeoSettings;
  social: SocialSettings;
  about: AboutSettings;
}

// Default settings to use when no settings exist in the database
export const defaultSettings: SiteSettings = {
  general: {
    siteName: "Motion Graphics Artist",
    siteDescription: "Creating captivating visual experiences through the art of motion",
    contactEmail: "contact@example.com",
    showreelUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    logoUrl: "",
  },
  performance: {
    enableAnimations: true,
    enableParallax: true,
    lazyLoadImages: true,
    enableImageOptimization: true,
    cachingEnabled: true,
  },
  animation: {
    enable3DEffects: true,
    animationIntensity: 75,
    scrollAnimations: true,
    hoverAnimations: true,
    loadingAnimations: true,
    particleEffects: false,
    backgroundColor: "#1A1F2C",
    accentColor: "#4a6cf7",
    secondaryAccentColor: "#9b87f5",
    animationSpeed: "normal",
  },
  seo: {
    metaTitle: "Motion Graphics Artist Portfolio",
    metaDescription: "Professional motion graphics and animation portfolio showcasing creative visual storytelling",
    ogImageUrl: "https://example.com/og-image.jpg",
    keywords: "motion graphics, animation, visual effects, 3D animation, explainer videos",
  },
  social: {
    instagramUrl: "https://instagram.com",
    youtubeUrl: "https://youtube.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://twitter.com",
  },
  about: {
    ownerName: "Muhammad Ali",
    ownerTitle: "Motion Graphics Artist & 3D Animator",
    ownerBio: "I'm a passionate motion graphics artist with over 8 years of experience creating stunning visual animations for brands worldwide. My work focuses on bringing ideas to life through creative storytelling and cutting-edge animation techniques.",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&auto=format&fit=crop",
    ownerSkills: "Motion Graphics, 3D Animation, Visual Effects, After Effects, Cinema 4D, Blender",
    ownerLocation: "Cairo, Egypt",
  }
};

export const getSettings = async (): Promise<SiteSettings> => {
  try {
    // Fetch settings from the database
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    // If there are settings, return them
    if (data && data.length > 0) {
      return data[0].settings as SiteSettings;
    }
    
    // If no settings exist, insert the defaults and return them
    await supabase
      .from('site_settings')
      .insert([{ settings: defaultSettings }]);
    
    return defaultSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings if there's an error
    return defaultSettings;
  }
};

export const saveSettings = async (settings: SiteSettings): Promise<{ success: boolean; error?: string }> => {
  try {
    // Insert new settings record
    const { error } = await supabase
      .from('site_settings')
      .insert([{ settings }]);
    
    if (error) throw error;
    
    // Also store in localStorage as backup/cache
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save settings' 
    };
  }
};
