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
import { Save, RefreshCcw, Upload } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
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

  // Initialize settings state from database or defaults
  const [settings, setSettings] = useState(defaultSettings);

  // Update settings when DB data loads
  useEffect(() => {
    if (dbSettings) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...dbSettings
      }));
    }
  }, [dbSettings]);

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
    saveSettingsMutation(settings);
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
                          <AvatarFallback>MA</AvatarFallback>
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
      </Tabs>
    </div>
  );
};

export default AdminSettings;
