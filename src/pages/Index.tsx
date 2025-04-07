
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/Services"; 
import { PortfolioPreview } from "@/components/PortfolioPreview";
import { Testimonials } from "@/components/Testimonials";
import { ContactCta } from "@/components/ContactCta";
import { CompanyLogos } from "@/components/CompanyLogos";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  useEffect(() => {
    // Apply custom colors from database
    const applyCustomColors = async () => {
      try {
        // Fetch animation settings which contain the colors
        const { data, error } = await supabase
          .from('animation_settings')
          .select('accent_color, secondary_accent_color, background_color')
          .single();
          
        if (error) {
          console.error('Error fetching colors:', error);
          return;
        }
        
        if (data) {
          // Apply colors as CSS variables
          document.documentElement.style.setProperty('--custom-accent-color', data.accent_color);
          document.documentElement.style.setProperty('--custom-secondary-accent-color', data.secondary_accent_color);
          document.documentElement.style.setProperty('--custom-background-color', data.background_color);
          
          // Add class to body for applying custom colors
          document.body.classList.add('apply-custom-colors');
        }
      } catch (err) {
        console.error('Error applying custom colors:', err);
      }
    };

    applyCustomColors();
  }, []);
  
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
