
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface CompanyLogo {
  id: string;
  name: string;
  logo_url: string;
  website?: string;
  display_order: number;
}

export const CompanyLogos = () => {
  const [logos, setLogos] = useState<CompanyLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        // Type assertion since we can't modify the types.ts file
        const { data, error } = await supabase
          .from('company_logos')
          .select('*')
          .order('display_order', { ascending: true }) as unknown as { 
            data: CompanyLogo[] | null; 
            error: Error | null 
          };
          
        if (error) {
          throw error;
        }
        
        setLogos(data || []);
      } catch (error) {
        console.error('Error fetching company logos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogos();
  }, []);

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (logos.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Companies I've Worked With</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Proud to have collaborated with these amazing companies on various creative projects.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <a 
                href={logo.website || '#'} 
                target={logo.website ? "_blank" : "_self"}
                rel="noopener noreferrer" 
                className="group"
              >
                <div className="h-16 w-full flex items-center justify-center mb-2">
                  <img 
                    src={logo.logo_url} 
                    alt={`${logo.name} logo`}
                    className="max-h-full max-w-full object-contain transition-opacity group-hover:opacity-80"
                  />
                </div>
                <p className="text-sm text-center font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {logo.name}
                </p>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
