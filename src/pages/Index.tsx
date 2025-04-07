
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/Services"; 
import { PortfolioPreview } from "@/components/PortfolioPreview";
import { Testimonials } from "@/components/Testimonials";
import { ContactCta } from "@/components/ContactCta";
import { CompanyLogos } from "@/components/CompanyLogos";
import { useEffect } from "react";

export default function Index() {
  // Set the title for the homepage
  useEffect(() => {
    document.title = "Motion Graphics Artist | Portfolio";
    
    // Apply background color to body based on settings
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.design && settings.design.background) {
          // If no custom background is set, ensure body has the default background
          if (settings.design.background.type === 'gradient') {
            document.body.style.backgroundColor = settings.design.background.gradientFrom || '#1A1F2C';
          }
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    
    return () => {
      // Reset body style when component unmounts
      document.body.style.backgroundColor = '';
    };
  }, []);
  
  return (
    <>
      <Navbar />
      <Hero />
      <PortfolioPreview />
      <ServicesSection />
      <CompanyLogos />
      <Testimonials />
      <ContactCta />
      <Footer />
    </>
  );
}
