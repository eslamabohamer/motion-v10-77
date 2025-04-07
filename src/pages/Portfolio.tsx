
import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  
  useEffect(() => {
    // Set active category based on URL param
    if (categorySlug && categorySlug !== 'all') {
      // Convert slug to display format (e.g., "motion-graphics" -> "Motion Graphics")
      const formattedCategory = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      setActiveCategory(formattedCategory);
    } else {
      setActiveCategory('All');
    }
  }, [categorySlug]);
  
  // Memoize filter function to avoid unnecessary re-computation
  const filteredProjects = useCallback(() => {
    return activeCategory === 'All' 
      ? projects 
      : projects.filter(project => project.category === activeCategory);
  }, [projects, activeCategory]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, category, image_url, video_url, description')
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

  const handleCategoryClick = (category: string) => {
    if (category === 'All') {
      navigate('/portfolio');
    } else {
      // Convert category to URL-friendly slug (e.g., "Motion Graphics" -> "motion-graphics")
      const slug = category.toLowerCase().replace(/\s+/g, '-');
      navigate(`/portfolio/${slug}`);
    }
    setActiveCategory(category);
  };
  
  const projectsToShow = filteredProjects();
  
  // Improved image loading handling
  useEffect(() => {
    // Prefetch images for better user experience
    if (projects.length > 0) {
      const images = projects.map(project => project.image_url);
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [projects]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-3">Portfolio</h1>
              <p className="text-muted-foreground mb-8 max-w-2xl">
                Browse through my collection of motion graphics projects.
              </p>
            </motion.div>
            
            {/* Simplified Category Filter */}
            <motion.div 
              className="flex flex-wrap gap-2 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeCategory === category
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {category}
                </button>
              ))}
            </motion.div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="aspect-video bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : projectsToShow.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsToShow.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * (index % 6) }}
                    className="h-full"
                  >
                    <Link 
                      to={`/portfolio/project/${project.id}`} 
                      className="group h-full overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md block"
                    >
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
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
