
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  video_url: string | null;
  description: string;
}

const Portfolio = () => {
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching projects:', error);
          return;
        }
        
        setProjects(data || []);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(data?.map((project: PortfolioItem) => project.category) || [])];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Portfolio</h1>
              <p className="text-muted-foreground mb-12 max-w-2xl">
                Browse through my collection of motion graphics projects, each showcasing creativity, technical skill, and strategic thinking.
              </p>
            </motion.div>
            
            {/* Category Filter with 3D effect */}
            <motion.div 
              className="flex flex-wrap gap-2 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeCategory === category
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:scale-105"
                  )}
                  style={{
                    transform: activeCategory === category ? 'translateZ(5px)' : 'translateZ(0px)',
                    transformStyle: 'preserve-3d'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: activeCategory === category ? '0 15px 30px rgba(0,0,0,0.15)' : '0 10px 20px rgba(0,0,0,0.1)' 
                  }}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="aspect-video bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                    whileHover={{ y: -10, scale: 1.02 }}
                  >
                    <Link 
                      to={`/portfolio/${project.id}`} 
                      className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-xl block"
                      style={{ 
                        transformStyle: 'preserve-3d',
                        perspective: '1000px'
                      }}
                    >
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                            {project.title}
                          </h2>
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                            {project.category}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <span className="inline-flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                          View Details <ExternalLink className="ml-1 h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Portfolio;
