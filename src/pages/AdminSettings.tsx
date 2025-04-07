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
import { Save, RefreshCcw, Upload, Plus, X } from 'lucide-react';
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

interface GeneralSettings {
  id: string;
  site_name: string;
  site_description: string;
  contact_email: string | null;
  showreel_url: string | null;
  logo_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PerformanceSettings {
  id: string;
  enable_animations: boolean | null;
  enable_parallax: boolean | null;
  lazy_load_images: boolean | null;
  enable_image_optimization: boolean | null;
  caching_enabled: boolean | null;
}

interface AnimationSettings {
  id: string;
  enable_3d_effects: boolean | null;
  animation_intensity: number | null;
  scroll_animations: boolean | null;
  hover_animations: boolean | null;
  loading_animations: boolean | null;
  particle_effects: boolean | null;
  background_color: string | null;
  accent_color: string | null;
  secondary_accent_color: string | null;
  animation_speed: string | null;
}

interface SeoSettings {
  id: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  keywords: string | null;
}

interface SocialSettings {
  id: string;
  instagram_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
}

interface AboutMeData {
  id: string;
  owner_name: string;
  owner_title: string;
  owner_bio: string;
  owner_photo_url: string | null;
  owner_skills: string;
  owner_location: string | null;
  client_focused_text: string | null;
  quality_first_text: string | null;
}

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  const [newLogo, setNewLogo] = useState({
    name: '',
    logo_url: '',
    website: ''
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings | null>(null);
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings | null>(null);
  const [seoSettings, setSeoSettings] = useState<SeoSettings | null>(null);
  const [socialSettings, setSocialSettings] = useState<SocialSettings | null>(null);
  const [aboutMe, setAboutMe] = useState<AboutMeData | null>(null);

  const { data: generalData, isLoading: isLoadingGeneral, refetch: refetchGeneral } = useQuery({
    queryKey: ['generalSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('general_settings')
        .select('*')
        .limit(1) as unknown as {
          data: GeneralSettings[] | null;
          error: Error | null;
        };
      
      if (error) {
        console.error('Error fetching general settings:', error);
        throw error;
      }
      
      return data?.length > 0 ? data[0] : null;
    },
    retry: 1
  });

  const { data: performanceData, isLoading: isLoadingPerformance, refetch: refetchPerformance } = useQuery({
    queryKey: ['performanceSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_settings')
        .select('*')
        .limit(1) as unknown as {
          data: PerformanceSettings[] | null;
          error: Error | null;
        };
      
      if (error) {
        console.error('Error fetching performance settings:', error);
        throw error;
      }
      
      return data?.length > 0 ? data[0] : null;
    },
    retry: 1
  });

  const { data: animationData, isLoading: isLoadingAnimation, refetch: refetchAnimation } = useQuery({
    queryKey: ['animationSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('animation_settings')
        .select('*')
        .limit(1) as unknown as {
          data: AnimationSettings[] | null;
          error: Error | null;
        };
      
      if (error) {
        console.error('Error fetching animation settings:', error);
        throw error;
      }
      
      return data?.length > 0 ? data[0] : null;
    },
    retry: 1
  });

  const { data: seoData, isLoading: isLoadingSeo, refetch: refetchSeo } = useQuery({
    queryKey: ['seoSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .limit(1) as unknown as {
          data: SeoSettings[] | null;
          error: Error | null;
        };
      
      if (error) {
        console.error('Error fetching SEO settings:', error);
        throw error;
      }
      
      return data?.length > 0 ? data[0] : null;
    },
    retry: 1
  });

  const { data: socialData, isLoading: isLoadingSocial, refetch: refetchSocial } = useQuery({
    queryKey: ['socialSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_settings')
        .select('*')
        .limit(1) as unknown as {
          data: SocialSettings[] | null;
          error: Error | null;
        };
      
      if (error) {
        console.error('Error fetching social settings:', error);
        throw error;
      }
      
      return data?.length > 0 ? data[0] : null;
    },
    retry: 1
  });

  const { data: aboutData, isLoading: isLoadingAbout, refetch: refetchAbout } = useQuery({
    queryKey: ['aboutMe'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_me')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching about me data:', error);
        throw error;
      }
      
      return data?.length > 0 ? data[0] : null;
    },
    retry: 1
  });

  const { data: companyLogos, isLoading: isLoadingLogos, refetch: refetchLogos } = useQuery({
    queryKey: ['companyLogos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_logos')
        .select('*')
        .order('display_order', { ascending: true }) as unknown as {
          data: CompanyLogo[] | null;
          error: Error | null;
        };
      
      if (error) {
        console.error('Error fetching company logos:', error);
        throw error;
      }
      
      return data || [];
    },
    retry: 1
  });

  useEffect(() => {
    if (generalData) setGeneralSettings(generalData);
    if (performanceData) setPerformanceSettings(performanceData);
    if (animationData) setAnimationSettings(animationData);
    if (seoData) setSeoSettings(seoData);
    if (socialData) setSocialSettings(socialData);
    if (aboutData) setAboutMe(aboutData);
  }, [generalData, performanceData, animationData, seoData, socialData, aboutData]);

  const { mutate: saveGeneralSettings } = useMutation({
    mutationFn: async (data: Partial<GeneralSettings>) => {
      if (generalSettings?.id) {
        const { error } = await supabase
          .from('general_settings')
          .update(data)
          .eq('id', generalSettings.id) as unknown as {
            error: Error | null;
          };
          
        if (error) throw error;
        return generalSettings.id;
      } else {
        const { data: insertData, error } = await supabase
          .from('general_settings')
          .insert(data)
          .select('id') as unknown as {
            data: { id: string }[] | null;
            error: Error | null;
          };
          
        if (error) throw error;
        return insertData?.[0]?.id;
      }
    },
    onSuccess: () => {
      toast.success("General settings saved successfully");
      refetchGeneral();
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error saving general settings:', error);
      toast.error("Failed to save general settings");
      setIsLoading(false);
    }
  });

  const { mutate: savePerformanceSettings } = useMutation({
    mutationFn: async (data: Partial<PerformanceSettings>) => {
      if (performanceSettings?.id) {
        const { error } = await supabase
          .from('performance_settings')
          .update(data)
          .eq('id', performanceSettings.id) as unknown as {
            error: Error | null;
          };
          
        if (error) throw error;
        return performanceSettings.id;
      } else {
        const { data: insertData, error } = await supabase
          .from('performance_settings')
          .insert(data)
          .select('id') as unknown as {
            data: { id: string }[] | null;
            error: Error | null;
          };
          
        if (error) throw error;
        return insertData?.[0]?.id;
      }
    },
    onSuccess: () => {
      toast.success("Performance settings saved successfully");
      refetchPerformance();
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error saving performance settings:', error);
      toast.error("Failed to save performance settings");
      setIsLoading(false);
    }
  });

  const { mutate: saveAnimationSettings } = useMutation({
    mutationFn: async (data: Partial<AnimationSettings>) => {
      if (animationSettings?.id) {
        const { error } = await supabase
          .from('animation_settings')
          .update(data)
          .eq('id', animationSettings.id) as unknown as {
            error: Error | null;
          };
          
        if (error) throw error;
        return animationSettings.id;
      } else {
        const { data: insertData, error } = await supabase
          .from('animation_settings')
          .insert(data)
          .select('id') as unknown as {
            data: { id: string }[] | null;
            error: Error | null;
          };
          
        if (error) throw error;
        return insertData?.[0]?.id;
      }
    },
    onSuccess: () => {
      toast.success("Animation settings saved successfully");
      refetchAnimation();
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error saving animation settings:', error);
      toast.error("Failed to save animation settings");
      setIsLoading(false);
    }
  });

  const { mutate: saveSeoSettings } = useMutation({
    mutationFn: async (data: Partial<SeoSettings>) => {
      if (seoSettings?.id) {
        const { error } = await supabase
          .from('seo_settings')
          .update(data)
          .eq('id', seoSettings.id) as unknown as {
            error: Error | null;
          };
          
        if (error) throw error;
        return seoSettings.id;
      } else {
        const { data: insertData, error } = await supabase
          .from('seo_settings')
          .insert(data)
          .select('id') as unknown as {
            data: { id: string }[] | null;
            error: Error | null;
          };
          
        if (error) throw error;
        return insertData?.[0]?.id;
      }
    },
    onSuccess: () => {
      toast.success("SEO settings saved successfully");
      refetchSeo();
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error saving SEO settings:', error);
      toast.error("Failed to save SEO settings");
      setIsLoading(false);
    }
  });

  const { mutate: saveSocialSettings } = useMutation({
    mutationFn: async (data: Partial<SocialSettings>) => {
      if (socialSettings?.id) {
        const { error } = await supabase
          .from('social_settings')
          .update(data)
          .eq('id', socialSettings.id) as unknown as {
            error: Error | null;
          };
          
        if (error) throw error;
        return socialSettings.id;
      } else {
        const { data: insertData, error } = await supabase
          .from('social_settings')
          .insert(data)
          .select('id') as unknown as {
            data: { id: string }[] | null;
            error: Error | null;
          };
          
        if (error) throw error;
        return insertData?.[0]?.id;
      }
    },
    onSuccess: () => {
      toast.success("Social media links saved successfully");
      refetchSocial();
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error saving social media links:', error);
      toast.error("Failed to save social media links");
      setIsLoading(false);
    }
  });

  const { mutate: saveAboutMeData } = useMutation({
    mutationFn: async (data: Partial<AboutMeData>) => {
      const isNewRecord = !aboutMe?.id;
      
      if (isNewRecord) {
        const dataToSave = {
          owner_name: data.owner_name || '',
          owner_title: data.owner_title || '',
          owner_bio: data.owner_bio || '',
          owner_skills: data.owner_skills || '',
          owner_location: data.owner_location,
          owner_photo_url: data.owner_photo_url,
          client_focused_text: data.client_focused_text,
          quality_first_text: data.quality_first_text
        };
        
        const { data: insertData, error } = await supabase
          .from('about_me')
          .insert(dataToSave)
          .select('id');
          
        if (error) throw error;
        return insertData?.[0]?.id;
      } else {
        const { error } = await supabase
          .from('about_me')
          .update(data)
          .eq('id', aboutMe.id);
          
        if (error) throw error;
        return aboutMe.id;
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

  const { mutate: saveLogoMutation } = useMutation({
    mutationFn: async (logoData: Omit<CompanyLogo, 'id' | 'display_order'>) => {
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('company_logos')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1) as unknown as {
          data: { display_order: number }[] | null;
          error: Error | null;
        };
      
      const nextDisplayOrder = maxOrderData && maxOrderData.length > 0 
        ? (maxOrderData[0].display_order + 1) 
        : 1;
      
      const { data, error } = await supabase
        .from('company_logos')
        .insert({
          name: logoData.name,
          logo_url: logoData.logo_url,
          website: logoData.website || null,
          display_order: nextDisplayOrder
        })
        .select('id') as unknown as {
          data: { id: string }[] | null;
          error: Error | null;
        };
        
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

  const { mutate: updateLogoMutation } = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CompanyLogo> }) => {
      const { error } = await supabase
        .from('company_logos')
        .update({
          name: data.name,
          logo_url: data.logo_url,
          website: data.website || null
        })
        .eq('id', id) as unknown as {
          error: Error | null;
        };
        
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

  const { mutate: deleteLogoMutation } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_logos')
        .delete()
        .eq('id', id) as unknown as {
          error: Error | null;
        };
        
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

  const handleSaveSettings = () => {
    setIsLoading(true);
    
    switch (activeTab) {
      case 'general':
        saveGeneralSettings(generalSettings || {});
        break;
      case 'performance':
        savePerformanceSettings(performanceSettings || {});
        break;
      case 'animation':
        saveAnimationSettings(animationSettings || {});
        break;
      case 'seo':
        saveSeoSettings(seoSettings || {});
        break;
      case 'social':
        saveSocialSettings(socialSettings || {});
        break;
      case 'about':
        saveAboutMeData(aboutMe || {});
        break;
      default:
        setIsLoading(false);
        break;
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
          <TabsTrigger value="logos">Company Logos</TabsTrigger>
          <TabsTrigger value="about">About Me</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          {isLoadingGeneral ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
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
                      value={generalSettings?.site_name || ''}
                      onChange={(e) => setGeneralSettings(prev => prev ? {...prev, site_name: e.target.value} : null)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input 
                      id="logoUrl" 
                      value={generalSettings?.logo_url || ''}
                      onChange={(e) => setGeneralSettings(prev => prev ? {...prev, logo_url: e.target.value} : null)}
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
                      value={generalSettings?.site_description || ''}
                      onChange={(e) => setGeneralSettings(prev => prev ? {...prev, site_description: e.target.value} : null)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input 
                      id="contactEmail" 
                      type="email"
                      value={generalSettings?.contact_email || ''}
                      onChange={(e) => setGeneralSettings(prev => prev ? {...prev, contact_email: e.target.value} : null)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="showreelUrl">Showreel Video URL</Label>
                    <Input 
                      id="showreelUrl" 
                      value={generalSettings?.showreel_url || ''}
                      onChange={(e) => setGeneralSettings(prev => prev ? {...prev, showreel_url: e.target.value} : null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      YouTube or Vimeo URL for the showreel video on the homepage
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">
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
          )}
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
        
        <TabsContent value="about">
          {isLoadingAbout ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
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
                          value={aboutMe?.owner_name || ''}
                          onChange={(e) => setAboutMe(prev => prev ? {...prev, owner_name: e.target.value} : null)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ownerTitle">Your Title/Position</Label>
                        <Input 
                          id="ownerTitle" 
                          value={aboutMe?.owner_title || ''}
                          onChange={(e) => setAboutMe(prev => prev ? {...prev, owner_title: e.target.value} : null)}
                          placeholder="Motion Graphics Artist & 3D Animator"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ownerLocation">Your Location</Label>
                        <Input 
                          id="ownerLocation" 
                          value={aboutMe?.owner_location || ''}
                          onChange={(e) => setAboutMe(prev => prev ? {...prev, owner_location: e.target.value} : null)}
                          placeholder="City, Country"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ownerSkills">Your Skills</Label>
                        <Input 
                          id="ownerSkills" 
                          value={aboutMe?.owner_skills || ''}
                          onChange={(e) => setAboutMe(prev => prev ? {...prev, owner_skills: e.target.value} : null)}
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
                            <AvatarImage src={aboutMe?.owner_photo_url || ''} alt="Profile photo" />
                            <AvatarFallback>{aboutMe?.owner_name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <Input
                            id="ownerPhotoUrl"
                            value={aboutMe?.owner_photo_url || ''}
                            onChange={(e) => setAboutMe(prev => prev ? {...prev, owner_photo_url: e.target.value} : null)}
                            placeholder="https://example.com/profile.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
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
          )}
        </TabsContent>
        
        <TabsContent value="animation">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Animation settings configuration panel.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Performance settings configuration panel.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="seo">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">SEO settings configuration panel.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="social">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Social media settings configuration panel.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
