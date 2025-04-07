
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/Services"; 
import { PortfolioPreview } from "@/components/PortfolioPreview";
import { Testimonials } from "@/components/Testimonials";
import { ContactCta } from "@/components/ContactCta";
import { CompanyLogos } from "@/components/CompanyLogos";

export default function Index() {
  return (
    <>
      <Navbar />
      <Hero />
      <ServicesSection />
      <PortfolioPreview />
      <CompanyLogos />
      <Testimonials />
      <ContactCta />
      <Footer />
    </>
  );
}
