
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ServicesSection } from '@/components/Services';

const Services = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <ServicesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Services;
