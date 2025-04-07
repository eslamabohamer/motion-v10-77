
-- Create user ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_ratings table
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Allow public reads
CREATE POLICY "Allow public read access to user_ratings" 
  ON user_ratings FOR SELECT USING (true);

-- Allow authenticated users to insert their own ratings
CREATE POLICY "Allow authenticated users to insert own ratings" 
  ON user_ratings FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own ratings
CREATE POLICY "Allow users to update own ratings" 
  ON user_ratings FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- Create storage for user photos
INSERT INTO storage.buckets (id, name, public) VALUES
  ('user-photos', 'user-photos', true)
ON CONFLICT DO NOTHING;

-- Set up storage policies
CREATE POLICY "Allow public access to user-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-photos');

CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-photos');

CREATE POLICY "Allow users to update their own uploads"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to get updated profile info
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Allow public read access to profiles" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow users to update own profile" 
  ON public.profiles FOR UPDATE TO authenticated 
  USING (auth.uid() = id);

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
