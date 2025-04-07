
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tyczqgeyhjxwfyjgwmio.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5Y3pxZ2V5aGp4d2Z5amd3bWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjczNjAsImV4cCI6MjA1OTU0MzM2MH0.mdHOJ_HoKARetqHF73e-UVqpg4SS37CuoSORUtSHtL8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Default avatar URLs for users without profile pictures
export const DEFAULT_AVATARS = [
  '/lovable-uploads/1060b64d-0acf-4337-bd99-60c3c328827f.png',
  '/placeholder.svg'
];

// Helper function to get a random default avatar
export const getDefaultAvatar = () => {
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
};

// Helper function to get display name or fallback to username/email
export const getDisplayNameOrEmail = (profile: any) => {
  if (profile?.display_name && !profile.display_name.includes('@')) {
    return profile.display_name;
  } 
  
  // If display_name is an email or null, try to create a username from it
  const email = profile?.display_name || '';
  if (email.includes('@')) {
    return email.split('@')[0]; // Return the part before @ as username
  }
  
  return 'Anonymous User';
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'supabase-auth',
    debug: import.meta.env.DEV // Enable debug logs in development
  },
  db: {
    schema: 'public'
  }
});

// Create or update storage bucket for user photos if needed
const createUserPhotosBucket = async () => {
  try {
    const { data, error } = await supabase.storage.getBucket('user-photos');
    
    if (error && error.message.includes('does not exist')) {
      // Create bucket if it doesn't exist
      await supabase.storage.createBucket('user-photos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      console.log('Created user-photos bucket');
    }
  } catch (error) {
    console.error('Error checking/creating storage bucket:', error);
  }
};

// Initialize storage for user photos (runs once when client is imported)
createUserPhotosBucket();
