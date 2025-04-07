
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/Services"; 
import { PortfolioPreview } from "@/components/PortfolioPreview";
import { Testimonials } from "@/components/Testimonials";
import { ContactCta } from "@/components/ContactCta";
import { CompanyLogos } from "@/components/CompanyLogos";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [isLoadingColors, setIsLoadingColors] = useState(true);

  useEffect(() => {
    // Prevent re-renders by using localStorage caching
    const cachedColors = localStorage.getItem('customColors');
    
    // Apply custom colors from database
    const applyCustomColors = async () => {
      try {
        // If we have cached colors, use them immediately
        if (cachedColors) {
          const colors = JSON.parse(cachedColors);
          applyColorsToDOM(colors);
          setIsLoadingColors(false);
          return;
        }
        
        // Fetch animation settings which contain the colors
        const { data, error } = await supabase
          .from('animation_settings')
          .select('accent_color, secondary_accent_color, background_color')
          .single();
          
        if (error) {
          console.error('Error fetching colors:', error);
          setIsLoadingColors(false);
          return;
        }
        
        if (data) {
          // Cache the colors in localStorage
          localStorage.setItem('customColors', JSON.stringify(data));
          applyColorsToDOM(data);
        }
      } catch (err) {
        console.error('Error applying custom colors:', err);
      } finally {
        setIsLoadingColors(false);
      }
    };

    applyCustomColors();
  }, []);
  
  // Helper function to apply colors to DOM
  const applyColorsToDOM = (colors: any) => {
    document.documentElement.style.setProperty('--custom-accent-color', colors.accent_color);
    document.documentElement.style.setProperty('--custom-secondary-accent-color', colors.secondary_accent_color);
    document.documentElement.style.setProperty('--custom-background-color', colors.background_color);
    
    // Add class to body for applying custom colors
    document.body.classList.add('apply-custom-colors');
  };
  
  return (
    <div className="apply-custom-colors">
      <Navbar />
      <Hero />
      <ServicesSection />
      <PortfolioPreview />
      <CompanyLogos />
      <Testimonials />
      <ContactCta />
      <Footer />
    </div>
  );
}
