
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Check auth status and fetch profile data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          // Redirect to login if not authenticated
          navigate('/admin/login');
          return;
        }
        
        const user = data.session.user;
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          if (profileError.code === 'PGRST116') {
            // Profile not found, create one
            await supabase.from('profiles').insert({
              id: user.id,
              display_name: user.user_metadata.display_name || user.email?.split('@')[0] || 'User',
              avatar_url: user.user_metadata.avatar_url,
            });
            
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            setProfile(newProfile);
            setDisplayName(newProfile?.display_name || '');
            setGender(newProfile?.gender || 'male');
            setAvatarUrl(newProfile?.avatar_url || null);
          }
        } else {
          setProfile(profileData);
          setDisplayName(profileData?.display_name || '');
          setGender(profileData?.gender || 'male');
          setAvatarUrl(profileData?.avatar_url || null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        toast.error('Failed to fetch profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      // Check if file is an image
      if (!file.type.match('image.*')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Check if file size is less than 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarUrl(e.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) {
      return avatarUrl; // Return existing URL if no new file
    }
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(filePath, avatarFile, {
          upsert: true // Overwrite if exists
        });
      
      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return null;
      }
      
      const { data } = supabase.storage
        .from('user-photos')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    
    try {
      const userId = profile.id;
      let photoUrl = avatarUrl;
      
      // Upload avatar if changed
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(userId);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          gender: gender,
          avatar_url: photoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          gender: gender,
          avatar_url: photoUrl
        }
      });
      
      toast.success('Profile updated successfully');
      
      // Update local profile state
      setProfile({
        ...profile,
        display_name: displayName,
        gender: gender,
        avatar_url: photoUrl
      });
      
      setAvatarFile(null); // Clear file selection
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="container max-w-3xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar 
                  className="w-32 h-32 cursor-pointer border-2 border-primary/20 hover:border-primary transition-all"
                  onClick={handleImageClick}
                >
                  <AvatarImage src={avatarUrl || ''} alt="User avatar" />
                  <AvatarFallback className="text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleImageClick}
                    className="text-xs"
                    size="sm"
                  >
                    <Upload className="mr-2 h-3 w-3" /> Change Photo
                  </Button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Click to upload a profile picture (max 5MB)
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">Display Name</label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <RadioGroup 
                  value={gender} 
                  onValueChange={(value) => setGender(value as 'male' | 'female')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="profile-male" />
                    <Label htmlFor="profile-male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="profile-female" />
                    <Label htmlFor="profile-female">Female</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
