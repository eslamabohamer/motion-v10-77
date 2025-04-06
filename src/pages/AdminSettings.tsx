
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
import { Save, RefreshCcw } from 'lucide-react';

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Mock settings for demo - in a real app these would be stored in the database
  const [settings, setSettings] = useState({
    general: {
      siteName: "Motion Graphics Artist",
      siteDescription: "Creating captivating visual experiences through the art of motion",
      contactEmail: "contact@example.com",
      showreelUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    performance: {
      enableAnimations: true,
      enableParallax: true,
      lazyLoadImages: true,
      enableImageOptimization: true,
      cachingEnabled: true,
    },
    seo: {
      metaTitle: "Motion Graphics Artist Portfolio",
      metaDescription: "Professional motion graphics and animation portfolio showcasing creative visual storytelling",
      ogImageUrl: "https://example.com/og-image.jpg",
      keywords: "motion graphics, animation, visual effects, 3D animation, explainer videos",
    }
  });

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
    
    // Simulate saving to database
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Settings saved successfully");
    }, 800);
  };

  const handleResetSettings = (section: keyof typeof settings) => {
    if (window.confirm("Are you sure you want to reset these settings to their defaults?")) {
      // This would reset to default values in a real application
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
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default AdminSettings;
