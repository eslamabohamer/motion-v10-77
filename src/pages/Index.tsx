
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { PortfolioPreview } from '@/components/PortfolioPreview';
import { ServicesSection } from '@/components/Services';
import { Testimonials } from '@/components/Testimonials';
import { ContactCta } from '@/components/ContactCta';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';

const Index = () => {
  const [animations3DEnabled, setAnimations3DEnabled] = useState(true);

  useEffect(() => {
    // Load animation settings from localStorage
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
