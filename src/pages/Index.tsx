
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
import { fetchSiteSections } from "@/utils/supabaseUtils";

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
  const [allSections, setAllSections] = useState<SiteSection[]>([]);

  useEffect(() => {
    const fetchSections = async () => {
      const { data, error } = await fetchSiteSections();
        
      if (!error && data && data.length > 0) {
        // Filter only active sections and sort by display order
        const activeSections = data.filter(section => section.is_active);
        setAllSections(activeSections);
        
        // Set the first section as featured
        setFeaturedSection(activeSections[0]);
      }
    };
    
    fetchSections();
  }, []);

  return (
    <>
      <Navbar />
      <Hero sections={allSections} />
      <ServicesSection />
      <PortfolioPreview featuredSection={featuredSection} />
      <CompanyLogos />
      <Testimonials />
      <ContactCta />
      <Footer />
    </>
  );
}
