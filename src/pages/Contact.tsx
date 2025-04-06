
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Contact</h1>
          <p className="text-muted-foreground">Coming soon - Contact form for project inquiries.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
