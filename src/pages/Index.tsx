
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { PortfolioPreview } from '@/components/PortfolioPreview';
import { ServicesSection } from '@/components/Services';
import { Testimonials } from '@/components/Testimonials';
import { ContactCta } from '@/components/ContactCta';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [animations3DEnabled, setAnimations3DEnabled] = useState(true);

  useEffect(() => {
    // Load animation settings directly from the database
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('settings')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching animation settings:', error);
          return;
        }
        
        // If we have settings in the database, use them
        if (data && data.length > 0 && data[0].settings) {
          const dbSettings = data[0].settings as Record<string, any>;
          
          if (dbSettings.animation && dbSettings.animation.enable3DEffects !== undefined) {
            setAnimations3DEnabled(dbSettings.animation.enable3DEffects);
            
            // Show toast notification about 3D effects status
            if (!dbSettings.animation.enable3DEffects) {
              toast.info('3D effects are currently disabled. Enable them in Admin Settings.', {
                duration: 5000,
                action: {
                  label: 'Settings',
                  onClick: () => window.location.href = '/admin/settings'
                }
              });
            }
          }
        } 
        // As a fallback, try to load from localStorage
        else {
          const savedSettings = localStorage.getItem('siteSettings');
          if (savedSettings) {
            try {
              const settings = JSON.parse(savedSettings);
              if (settings.animation && settings.animation.enable3DEffects !== undefined) {
                setAnimations3DEnabled(settings.animation.enable3DEffects);
                
                // Show toast notification about 3D effects status
                if (!settings.animation.enable3DEffects) {
                  toast.info('3D effects are currently disabled. Enable them in Admin Settings.', {
                    duration: 5000,
                    action: {
                      label: 'Settings',
                      onClick: () => window.location.href = '/admin/settings'
                    }
                  });
                }
              }
            } catch (error) {
              console.error('Error parsing saved settings:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
      }
    };
    
    fetchSettings();
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Hero />
        <div className="max-w-full w-full mx-auto">
          <PortfolioPreview />
          <ServicesSection />
          <Testimonials />
          <ContactCta />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
