
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SiteSection {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  video_url: string | null;
  description: string;
}

interface PortfolioPreviewProps {
  featuredSection?: SiteSection | null;
}

export const PortfolioPreview = ({ featuredSection }: PortfolioPreviewProps) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animations3DEnabled, setAnimations3DEnabled] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  // Create fixed transform values to use in the item animations
  const transformValues = [
    useTransform(scrollYProgress, [0, 1], [50, 0]),
    useTransform(scrollYProgress, [0, 1], [60, 0]),
    useTransform(scrollYProgress, [0, 1], [70, 0]),
    useTransform(scrollYProgress, [0, 1], [80, 0]),
  ];
  
  const opacityValues = [
    useTransform(scrollYProgress, [0, 0.3], [0, 1]),
    useTransform(scrollYProgress, [0, 0.35], [0, 1]),
    useTransform(scrollYProgress, [0, 0.4], [0, 1]),
    useTransform(scrollYProgress, [0, 0.45], [0, 1]),
  ];

  useEffect(() => {
    // Load animation settings from localStorage
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.animation && settings.animation.enable3DEffects !== undefined) {
          setAnimations3DEnabled(settings.animation.enable3DEffects);
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    
    const fetchPortfolioItems = async () => {
      try {
        let query = supabase
          .from('projects')
          .select('id, title, category, image_url, video_url, description')
          .order('created_at', { ascending: false });
        
        // If we have a featured section, filter by that section
        if (featuredSection) {
          // Get projects associated with this section
          const { data: projectSections, error: sectionsError } = await supabase
            .from('project_sections')
            .select('project_id')
            .eq('section_id', featuredSection.id);
            
          if (sectionsError) {
            console.error('Error fetching project sections:', sectionsError);
          } else if (projectSections && projectSections.length > 0) {
            // Filter projects by the ones in this section
            const projectIds = projectSections.map(ps => ps.project_id);
            query = query.in('id', projectIds);
          }
        }
        
        // Limit to 4 items for the preview
        const { data, error } = await query.limit(4);
          
        if (error) {
          console.error('Error fetching portfolio items:', error);
          return;
        }
        
        setPortfolioItems(data || []);
      } catch (error) {
        console.error('Error fetching portfolio items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioItems();
  }, [featuredSection]);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={animations3DEnabled ? { y, opacity } : {}}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {featuredSection ? `${featuredSection.name} Work` : 'Featured Work'}
            </h2>
            <p className="text-muted-foreground max-w-xl">
              {featuredSection 
                ? `Explore a selection of my recent ${featuredSection.name.toLowerCase()} projects.`
                : 'Explore a selection of my recent motion graphics projects.'}
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild className="mt-4 md:mt-0">
            <Link to={featuredSection ? `/portfolio?section=${featuredSection.slug}` : "/portfolio"} className="flex items-center">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-[300px] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={animations3DEnabled ? { 
                  y: transformValues[Math.min(index, 3)], 
                  opacity: opacityValues[Math.min(index, 3)]
                } : {}}
              >
                <PortfolioCard item={item} enable3D={animations3DEnabled} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

interface PortfolioCardProps {
  item: PortfolioItem;
  enable3D: boolean;
}

const PortfolioCard = ({ item, enable3D }: PortfolioCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use memoized function for better performance
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovered || !enable3D) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setPosition({ x, y });
  }, [isHovered, enable3D]);

  return (
    <div 
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-lg h-[300px] transition-all duration-300 shadow-lg hover:shadow-xl",
        enable3D && "hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={enable3D ? {
        transform: isHovered ? `perspective(1000px) rotateX(${position.y * 5}deg) rotateY(${-position.x * 5}deg)` : 'perspective(1000px)',
        transition: 'transform 0.2s ease'
      } : {}}
    >
      {/* Background Image with optimized 3D movement */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out"
        style={{ 
          backgroundImage: `url(${item.image_url})`,
          transform: enable3D && isHovered ? 
            `translateX(${position.x * -10}px) translateY(${position.y * -10}px) scale(1.05)` : 
            'scale(1)'
        }}
      />
      
      {/* Simplified overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent transition-opacity duration-300",
          isHovered ? "opacity-90" : "opacity-70"
        )}
      />
      
      {/* Content with simplified 3D effect */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className={enable3D ? "transform transition-transform duration-300" : ""} 
          style={enable3D && isHovered ? { transform: `translateZ(20px)` } : {}}>
          <span className="inline-block text-xs font-medium text-primary mb-2 bg-primary/10 px-2 py-1 rounded">
            {item.category}
          </span>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p 
            className={cn(
              "text-sm text-muted-foreground mb-4 line-clamp-2 transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            {item.description}
          </p>
          <Link 
            to={`/portfolio/${item.id}`}
            className={cn(
              "inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            View Project <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
