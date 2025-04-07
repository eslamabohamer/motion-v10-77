
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

interface SiteSection {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  display_order?: number;
  color?: string;
  icon?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function Index() {
  const [featuredSection, setFeaturedSection] = useState<SiteSection | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      // Get the first active section to feature on the homepage
      const { data, error } = await supabase
        .from('site_sections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(1);
        
      if (!error && data && data.length > 0) {
        setFeaturedSection(data[0] as SiteSection);
      }
    };
    
    fetchSections();
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <ServicesSection />
      <PortfolioPreview featuredSection={featuredSection} />
      <CompanyLogos />
      <Testimonials />
      <ContactCta />
      <Footer />
    </>
  );
}
