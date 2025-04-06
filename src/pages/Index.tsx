
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { PortfolioPreview } from '@/components/PortfolioPreview';
import { ServicesSection } from '@/components/Services';
import { Testimonials } from '@/components/Testimonials';
import { ContactCta } from '@/components/ContactCta';
import { Footer } from '@/components/Footer';

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
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <Navbar />
      <Hero />
      <PortfolioPreview />
      <ServicesSection />
      <Testimonials />
      <ContactCta />
      <Footer />
    </div>
  );
};

export default Index;
