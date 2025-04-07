
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { PortfolioPreview } from "@/components/PortfolioPreview";
import { Testimonials } from "@/components/Testimonials";
import { ContactCta } from "@/components/ContactCta";
import { CompanyLogos } from "@/components/CompanyLogos";

export default function Index() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <PortfolioPreview />
      <CompanyLogos />
      <Testimonials />
      <ContactCta />
      <Footer />
    </>
  );
}
