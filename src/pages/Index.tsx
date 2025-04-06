
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { PortfolioPreview } from '@/components/PortfolioPreview';
import { ServicesSection } from '@/components/Services';
import { Testimonials } from '@/components/Testimonials';
import { ContactCta } from '@/components/ContactCta';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <div className="relative z-10">
          <PortfolioPreview />
          <ServicesSection />
          <Testimonials />
          <ContactCta />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
