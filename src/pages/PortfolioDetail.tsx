
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const PortfolioDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Project Details</h1>
          <p className="text-muted-foreground">Viewing project with ID: {id}</p>
          <p className="text-muted-foreground">Coming soon - Portfolio detail page.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioDetail;
