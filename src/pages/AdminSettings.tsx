import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, RefreshCcw, Upload, Plus } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AccordionTable } from '@/components/ui/accordion-table';

interface CompanyLogo {
  id: string;
  name: string;
  logo_url: string;
  website?: string;
  display_order: number;
}

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Company Logos state
  const [newLogo, setNewLogo] = useState({
    name: '',
    logo_url: '',
    website: ''
  });
  
  // Default settings
  const defaultSettings = {
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
      animationSpeed: "normal", // "slow", "normal", "fast"
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

  // Fetch settings from database
  const { data: dbSettings, isLoading: isLoadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching settings:', error);
        throw error;
      }
      
      return data?.length > 0 ? data[0].settings : null;
    },
    retry: 1
  });

  // Fetch company logos
  const { data: companyLogos, isLoading: isLoadingLogos, refetch: refetchLogos } = useQuery({
    queryKey: ['companyLogos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_logos')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching company logos:', error);
        throw error;
      }
      
      return data as CompanyLogo[];
    },
    retry: 1
  });

  // Save settings mutation
  const { mutate: saveSettingsMutation } = useMutation({
    mutationFn: async (settingsData: any) => {
      const { data: existingData, error: fetchError } = await supabase
        .from('site_settings')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) {
        throw fetchError;
      }

      if (existingData && existingData.length > 0) {
        // Update existing settings
        const { error } = await supabase
          .from('site_settings')
          .update({ settings: settingsData })
          .eq('id', existingData[0].id);
          
        if (error) throw error;
        
        return existingData[0].id;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('site_settings')
          .insert({ settings: settingsData })
          .select('id');
          
        if (error) throw error;
        
        return data?.[0]?.id;
      }
    },
    onSuccess: () => {
      // Update localStorage after successful save
      localStorage.setItem('siteSettings', JSON.stringify(settings));
      toast.success("Settings saved successfully");
      refetchSettings();
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast.error("Failed to save settings");
      setIsLoading(false);
    }
  });

  // Save about me data mutation
  const { mutate: saveAboutDataMutation } = useMutation({
    mutationFn: async (aboutData: any) => {
      const { data: existingData, error: fetchError } = await supabase
        .from('about_me')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) {
        throw fetchError;
      }

      if (existingData && existingData.length > 0) {
        // Update existing settings
        const { error } = await supabase
          .from('about_me')
          .update({
            owner_name: aboutData.ownerName,
            owner_title: aboutData.ownerTitle,
            owner_bio: aboutData.ownerBio,
            owner_photo_url: aboutData.ownerPhotoUrl,
            owner_skills: aboutData.ownerSkills,
            owner_location: aboutData.ownerLocation,
            client_focused_text: aboutData.clientFocusedText,
            quality_first_text: aboutData.qualityFirstText
          })
          .eq('id', existingData[0].id);
          
        if (error) throw error;
        
        return existingData[0].id;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('about_me')
          .insert({
            owner_name: aboutData.ownerName,
            owner_title: aboutData.ownerTitle,
            owner_bio: aboutData.ownerBio,
            owner_photo_url: aboutData.ownerPhotoUrl,
            owner_skills: aboutData.ownerSkills,
            owner_location: aboutData.ownerLocation,
            client_focused_text: aboutData.clientFocusedText,
            quality_first_text: aboutData.qualityFirstText
          })
          .select('id');
          
        if (error) throw error;
        
        return data?.[0]?.id;
      }
    },
    onSuccess: () => {
      toast.success("About Me information saved successfully");
      refetchAbout();
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error saving about data:', error);
      toast.error("Failed to save About Me information");
      setIsLoading(false);
    }
  });

  // Save company logo mutation
  const { mutate: saveLogoMutation } = useMutation({
    mutationFn: async (logoData: Omit<CompanyLogo, 'id' | 'display_order'>) => {
      // Get the max display order
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('company_logos')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextDisplayOrder = maxOrderData && maxOrderData.length > 0 
        ? (maxOrderData[0].display_order + 1) 
        : 1;
      
      // Insert the new logo
      const { data, error } = await supabase
        .from('company_logos')
        .insert({
          name: logoData.name,
          logo_url: logoData.logo_url,
          website: logoData.website || null,
          display_order: nextDisplayOrder
        })
        .select('id');
        
      if (error) throw error;
      
      return data?.[0]?.id;
    },
    onSuccess: () => {
      toast.success("Logo added successfully");
      setNewLogo({
        name: '',
        logo_url: '',
        website: ''
      });
      refetchLogos();
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error saving logo:', error);
      toast.error("Failed to add logo");
      setIsLoading(false);
    }
  });

  // Update company logo mutation
  const { mutate: updateLogoMutation } = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CompanyLogo> }) => {
      const { error } = await supabase
        .from('company_logos')
        .update({
          name: data.name,
          logo_url: data.logo_url,
          website: data.website || null
        })
        .eq('id', id);
        
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      toast.success("Logo updated successfully");
      refetchLogos();
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error updating logo:', error);
      toast.error("Failed to update logo");
      setIsLoading(false);
    }
  });

  // Delete company logo mutation
  const { mutate: deleteLogoMutation } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_logos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      toast.success("Logo deleted successfully");
      refetchLogos();
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error deleting logo:', error);
      toast.error("Failed to delete logo");
      setIsLoading(false);
    }
  });

  // Initialize settings state from database or defaults
  const [settings, setSettings] = useState({...defaultSettings});

  // Update settings when DB data loads
  useEffect(() => {
    if (dbSettings) {
      setSettings(prevSettings => {
        // Create a deep copy of the previous settings
        const updatedSettings = JSON.parse(JSON.stringify(prevSettings));
        
        // Update with database settings - fix the type issue
        const dbSettingsObj = dbSettings as Record<string, any>;
        
        for (const sectionKey in dbSettingsObj) {
          if (typeof sectionKey === 'string' && updatedSettings[sectionKey as keyof typeof updatedSettings]) {
            updatedSettings[sectionKey as keyof typeof updatedSettings] = {
              ...updatedSettings[sectionKey as keyof typeof updatedSettings],
              ...dbSettingsObj[sectionKey]
            };
          }
        }
        
        return updatedSettings;
      });
    }
  }, [dbSettings]);

  // Update about settings when aboutData loads
  useEffect(() => {
    if (aboutData) {
      setSettings(prevSettings => {
        return {
          ...prevSettings,
          about: {
            ...prevSettings.about,
            ownerName: aboutData.owner_name,
            ownerTitle: aboutData.owner_title,
            ownerBio: aboutData.owner_bio,
            ownerPhotoUrl: aboutData.owner_photo_url || prevSettings.about.ownerPhotoUrl,
            ownerSkills: aboutData.owner_skills,
            ownerLocation: aboutData.owner_location || prevSettings.about.ownerLocation,
          }
        };
      });
    }
  }, [aboutData]);

  const handleSettingChange = (section: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    
    if (activeTab === 'about') {
      // Save about data to the about_me table
      saveAboutDataMutation({
        ownerName: settings.about.ownerName,
        ownerTitle: settings.about.ownerTitle,
        ownerBio: settings.about.ownerBio,
        ownerPhotoUrl: settings.about.ownerPhotoUrl,
        ownerSkills: settings.about.ownerSkills,
        ownerLocation: settings.about.ownerLocation,
        clientFocusedText: "I work closely with clients to understand their vision and deliver results that exceed expectations.",
        qualityFirstText: "Every project receives my full attention to detail, ensuring premium quality results."
      });
    } else {
      // Save other settings to the site_settings table
      saveSettingsMutation(settings);
    }
  };

  const handleResetSettings = (section: keyof typeof settings) => {
    if (window.confirm("Are you sure you want to reset these settings to their defaults?")) {
      setSettings(prev => ({
        ...prev,
        [section]: defaultSettings[section]
      }));
      toast.info(`${section.charAt(0).toUpperCase() + section.slice(1)} settings reset to defaults`);
    }
  };

  const handleLogoInputChange = (key: string, value: string) => {
    setNewLogo(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddLogo = () => {
    if (!newLogo.name || !newLogo.logo_url) {
      toast.error("Logo name and URL are required");
      return;
    }
    
    setIsLoading(true);
    saveLogoMutation(newLogo);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-6">
            Configure your website settings and preferences
          </p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="logos">Company Logos</TabsTrigger>
          <TabsTrigger value="about">About Me</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure the basic information for your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input 
                    id="siteName" 
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input 
                    id="logoUrl" 
                    value={settings.general.logoUrl}
                    onChange={(e) => handleSettingChange('general', 'logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL for your site logo (leave empty to use text logo)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea 
                    id="siteDescription" 
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail" 
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="showreelUrl">Showreel Video URL</Label>
                  <Input 
                    id="showreelUrl" 
                    value={settings.general.showreelUrl}
                    onChange={(e) => handleSettingChange('general', 'showreelUrl', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    YouTube or Vimeo URL for the showreel video on the homepage
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleResetSettings('general')}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="about">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>About Me Settings</CardTitle>
                <CardDescription>Configure your personal information for the About page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-2/3 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Your Name</Label>
                      <Input 
                        id="ownerName" 
                        value={settings.about.ownerName}
                        onChange={(e) => handleSettingChange('about', 'ownerName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ownerTitle">Your Title/Position</Label>
                      <Input 
                        id="ownerTitle" 
                        value={settings.about.ownerTitle}
                        onChange={(e) => handleSettingChange('about', 'ownerTitle', e.target.value)}
                        placeholder="Motion Graphics Artist & 3D Animator"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ownerLocation">Your Location</Label>
                      <Input 
                        id="ownerLocation" 
                        value={settings.about.ownerLocation}
                        onChange={(e) => handleSettingChange('about', 'ownerLocation', e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ownerSkills">Your Skills</Label>
                      <Input 
                        id="ownerSkills" 
                        value={settings.about.ownerSkills}
                        onChange={(e) => handleSettingChange('about', 'ownerSkills', e.target.value)}
                        placeholder="Motion Graphics, 3D Animation, Visual Effects"
                      />
                      <p className="text-xs text-muted-foreground">
                        Comma-separated list of your key skills
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/3 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerPhotoUrl">Your Photo URL</Label>
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="w-32 h-32">
                          <AvatarImage src={settings.about.ownerPhotoUrl} alt="Profile" />
                          <AvatarFallback>{settings.about.ownerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <Input 
                          id="ownerPhotoUrl" 
                          value={settings.about.ownerPhotoUrl}
                          onChange={(e) => handleSettingChange('about', 'ownerPhotoUrl', e.target.value)}
                          placeholder="https://example.com/your-photo.jpg"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Enter a URL for your profile photo
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ownerBio">Your Bio</Label>
                  <Textarea 
                    id="ownerBio" 
                    value={settings.about.ownerBio}
                    onChange={(e) => handleSettingChange('about', 'ownerBio', e.target.value)}
                    rows={5}
                    placeholder="Write a short biography about yourself, your experience, and your approach to motion graphics..."
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleResetSettings('about')}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="animation">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>3D Animation Settings</CardTitle>
                <CardDescription>Configure the visual effects and animations across your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable3DEffects">Enable 3D Effects</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle all 3D and advanced animation effects
                    </p>
                  </div>
                  <Switch 
                    id="enable3DEffects"
                    checked={settings.animation.enable3DEffects}
                    onCheckedChange={(checked) => handleSettingChange('animation', 'enable3DEffects', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animationIntensity">Animation Intensity</Label>
                    <span className="text-sm text-muted-foreground">{settings.animation.animationIntensity}%</span>
                  </div>
                  <Slider 
                    id="animationIntensity"
                    value={[settings.animation.animationIntensity]}
                    onValueChange={(value) => handleSettingChange('animation', 'animationIntensity', value[0])}
                    min={0}
                    max={100}
                    step={5}
                    disabled={!settings.animation.enable3DEffects}
                  />
                  <p className="text-xs text-muted-foreground">
                    Adjust the intensity of animations and effects
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="animationSpeed">Animation Speed</Label>
                  <ToggleGroup 
                    type="single" 
                    id="animationSpeed"
                    value={settings.animation.animationSpeed}
                    onValueChange={(value) => {
                      if (value) handleSettingChange('animation', 'animationSpeed', value);
                    }}
                    className="justify-start"
                    disabled={!settings.animation.enable3DEffects}
                  >
                    <ToggleGroupItem value="slow">Slow</ToggleGroupItem>
                    <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
                    <ToggleGroupItem value="fast">Fast</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-medium">Animation Types</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="scrollAnimations">Scroll Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Animate elements as you scroll
                      </p>
                    </div>
                    <Switch 
                      id="scrollAnimations"
                      checked={settings.animation.scrollAnimations}
                      onCheckedChange={(checked) => handleSettingChange('animation', 'scrollAnimations', checked)}
                      disabled={!settings.animation.enable3DEffects}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="hoverAnimations">Hover Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Animate elements when hovered
                      </p>
                    </div>
                    <Switch 
                      id="hoverAnimations"
                      checked={settings.animation.hoverAnimations}
                      onCheckedChange={(checked) => handleSettingChange('animation', 'hoverAnimations', checked)}
                      disabled={!settings.animation.enable3DEffects}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="loadingAnimations">Loading Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Animate elements when page first loads
                      </p>
                    </div>
                    <Switch 
                      id="loadingAnimations"
                      checked={settings.animation.loadingAnimations}
                      onCheckedChange={(checked) => handleSettingChange('animation', 'loadingAnimations', checked)}
                      disabled={!settings.animation.enable3DEffects}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="particleEffects">Particle Effects</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable floating particle animations in backgrounds
                      </p>
                    </div>
                    <Switch 
                      id="particleEffects"
                      checked={settings.animation.particleEffects}
                      onCheckedChange={(checked) => handleSettingChange('animation', 'particleEffects', checked)}
                      disabled={!settings.animation.enable3DEffects}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-medium">Color Settings</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="backgroundColor" 
                        type="color"
                        value={settings.animation.backgroundColor}
                        onChange={(e) => handleSettingChange('animation', 'backgroundColor', e.target.value)}
                        className="w-12 h-8 p-1"
                        disabled={!settings.animation.enable3DEffects}
                      />
                      <Input 
                        value={settings.animation.backgroundColor}
                        onChange={(e) => handleSettingChange('animation', 'backgroundColor', e.target.value)}
                        disabled={!settings.animation.enable3DEffects}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Primary Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="accentColor" 
                        type="color"
                        value={settings.animation.accentColor}
                        onChange={(e) => handleSettingChange('animation', 'accentColor', e.target.value)}
                        className="w-12 h-8 p-1"
                        disabled={!settings.animation.enable3DEffects}
                      />
                      <Input 
                        value={settings.animation.accentColor}
                        onChange={(e) => handleSettingChange('animation', 'accentColor', e.target.value)}
                        disabled={!settings.animation.enable3DEffects}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryAccentColor">Secondary Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="secondaryAccentColor" 
                        type="color"
                        value={settings.animation.secondaryAccentColor}
                        onChange={(e) => handleSettingChange('animation', 'secondaryAccentColor', e.target.value)}
                        className="w-12 h-8 p-1" 
                        disabled={!settings.animation.enable3DEffects}
                      />
                      <Input 
                        value={settings.animation.secondaryAccentColor}
                        onChange={(e) => handleSettingChange('animation', 'secondaryAccentColor', e.target.value)}
                        disabled={!settings.animation.enable3DEffects}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleResetSettings('animation')}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="performance">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Performance Settings</CardTitle>
                <CardDescription>Optimize your website performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableAnimations">Enable Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle all animations across the website
                    </p>
                  </div>
                  <Switch 
                    id="enableAnimations"
                    checked={settings.performance.enableAnimations}
                    onCheckedChange={(checked) => handleSettingChange('performance', 'enableAnimations', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableParallax">Enable Parallax Effects</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle parallax scrolling effects
                    </p>
                  </div>
                  <Switch 
                    id="enableParallax"
                    checked={settings.performance.enableParallax}
                    onCheckedChange={(checked) => handleSettingChange('performance', 'enableParallax', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lazyLoadImages">Lazy Load Images</Label>
                    <p className="text-sm text-muted-foreground">
                      Load images only when they come into viewport
                    </p>
                  </div>
                  <Switch 
                    id="lazyLoadImages"
                    checked={settings.performance.lazyLoadImages}
                    onCheckedChange={(checked) => handleSettingChange('performance', 'lazyLoadImages', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableImageOptimization">Image Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically optimize images for better performance
                    </p>
                  </div>
                  <Switch 
                    id="enableImageOptimization"
                    checked={settings.performance.enableImageOptimization}
                    onCheckedChange={(checked) => handleSettingChange('performance', 'enableImageOptimization', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cachingEnabled">Browser Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable browser caching for faster repeat visits
                    </p>
                  </div>
                  <Switch 
                    id="cachingEnabled"
                    checked={settings.performance.cachingEnabled}
                    onCheckedChange={(checked) => handleSettingChange('performance', 'cachingEnabled', checked)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleResetSettings('performance')}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="seo">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Optimize your site for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input 
                    id="metaTitle" 
                    value={settings.seo.metaTitle}
                    onChange={(e) => handleSettingChange('seo', 'metaTitle', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea 
                    id="metaDescription" 
                    value={settings.seo.metaDescription}
                    onChange={(e) => handleSettingChange('seo', 'metaDescription', e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Keep your description between 150-160 characters for best results
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ogImageUrl">Social Media Image URL</Label>
                  <Input 
                    id="ogImageUrl" 
                    value={settings.seo.ogImageUrl}
                    onChange={(e) => handleSettingChange('seo', 'ogImageUrl', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Image shown when your site is shared on social media (1200×630 pixels recommended)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Textarea 
                    id="keywords" 
                    value={settings.seo.keywords}
                    onChange={(e) => handleSettingChange('seo', 'keywords', e.target.value)}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of keywords related to your services
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleResetSettings('seo')}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="social">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Configure your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input 
                    id="instagramUrl" 
                    value={settings.social.instagramUrl}
                    onChange={(e) => handleSettingChange('social', 'instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input 
                    id="youtubeUrl" 
                    value={settings.social.youtubeUrl}
                    onChange={(e) => handleSettingChange('social', 'youtubeUrl', e.target.value)}
                    placeholder="https://youtube.com/c/yourchannel"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input 
                    id="linkedinUrl" 
                    value={settings.social.linkedinUrl}
                    onChange={(e) => handleSettingChange('social', 'linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter URL</Label>
                  <Input 
                    id="twitterUrl" 
                    value={settings.social.twitterUrl}
                    onChange={(e) => handleSettingChange('social', 'twitterUrl', e.target.value)}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleResetSettings('social')}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="logos">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Company Logos</CardTitle>
                <CardDescription>
                  Manage the logos of companies you've worked with to display on your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Company Logo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Company Logo</DialogTitle>
                      <DialogDescription>
                        Add details about a company you've worked with to display their logo on your site.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={newLogo.name}
                          onChange={(e) => handleLogoInputChange('name', e.target.value)}
                          placeholder="e.g. Adobe, Google, etc."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                          id="logoUrl"
                          value={newLogo.logo_url}
                          onChange={(e) => handleLogoInputChange('logo_url', e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                        {newLogo.logo_url && (
                          <div className="mt-2 p-2 border rounded flex justify-center">
                            <img 
                              src={newLogo.logo_url} 
                              alt="Logo Preview" 
                              className="h-16 object-contain" 
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
                        <Input
                          id="websiteUrl"
                          value={newLogo.website || ''}
                          onChange={(e) => handleLogoInputChange('website', e.target.value)}
                          placeholder="https://company-website.com"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" onClick={handleAddLogo} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Add Logo
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <div className="border rounded-md">
                  {isLoadingLogos ? (
                    <div className="p-8 flex justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : companyLogos && companyLogos.length > 0 ? (
                    <AccordionTable
                      items={companyLogos}
                      columns={[
                        { key: 'name', label: 'Company Name' },
                        { key: 'logo_url', label: 'Logo', type: 'image' },
                        { key: 'website', label: 'Website', type: 'url' }
                      ]}
                      onEdit={(id, data) => {
                        setIsLoading(true);
                        updateLogoMutation({ id, data });
                      }}
                      onDelete={(id) => {
                        if (window.confirm('Are you sure you want to delete this logo?')) {
                          setIsLoading(true);
                          deleteLogoMutation(id);
                        }
                      }}
                    />
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No company logos added yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
