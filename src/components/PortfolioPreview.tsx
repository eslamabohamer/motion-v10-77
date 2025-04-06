
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  video_url: string | null;
  description: string;
}

export const PortfolioPreview = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
          
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
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const moveX = (clientX - centerX) / 25;
    const moveY = (clientY - centerY) / 25;
    
    setMousePosition({ x: moveX, y: moveY });
  };

  return (
    <section 
      className="py-24 bg-background"
      onMouseMove={handleMouseMove}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Work</h2>
            <p className="text-muted-foreground max-w-xl">
              Explore a selection of my recent motion graphics projects, showcasing versatility across different styles and industries.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild className="mt-4 md:mt-0">
            <Link to="/portfolio" className="flex items-center">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* 3D Grid Background */}
        <div className="relative">
          <div 
            className="absolute inset-0 dots-grid opacity-30 -z-10"
            style={{
              transform: `perspective(1000px) rotateX(60deg) translateZ(-100px) scale(1.5)`,
            }}
          />
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div 
                  key={index} 
                  className="h-[300px] bg-muted animate-pulse rounded-lg perspective-1000 preserve-3d"
                  style={{
                    transform: `perspective(1000px) rotateX(${-mousePosition.y * 0.03}deg) rotateY(${mousePosition.x * 0.03}deg)`,
                  }}
                />
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
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                  style={{
                    transform: hoverIndex === index 
                      ? `perspective(1000px) rotateX(${-mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg) scale(1.03)`
                      : `perspective(1000px) rotateX(${-mousePosition.y * 0.02}deg) rotateY(${mousePosition.x * 0.02}deg)`,
                    transition: 'transform 0.3s ease',
                    zIndex: hoverIndex === index ? 10 : 1,
                  }}
                >
                  <PortfolioCard item={item} isHighlighted={hoverIndex === index} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

interface PortfolioCardProps {
  item: PortfolioItem;
  isHighlighted?: boolean;
}

const PortfolioCard = ({ item, isHighlighted = false }: PortfolioCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setPosition({ x, y });
  };

  return (
    <div 
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-lg parallax-card h-[300px] transition-all duration-300 shadow-lg",
        isHighlighted ? "shadow-2xl ring-2 ring-primary/20" : "hover:shadow-xl"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered ? `perspective(1000px) rotateX(${position.y * 12}deg) rotateY(${-position.x * 12}deg) scale(1.02)` : 'perspective(1000px) rotateX(0) rotateY(0)',
        transition: 'transform 0.3s ease'
      }}
    >
      {/* Background Glow */}
      {isHovered && (
        <div 
          className="absolute -inset-[100px] bg-primary/5 blur-[100px] rounded-full z-0 pointer-events-none"
          style={{
            opacity: isHovered ? 0.8 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />
      )}
      
      {/* Background Image with enhanced 3D movement */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out"
        style={{ 
          backgroundImage: `url(${item.image_url})`,
          transform: isHovered ? `translateX(${position.x * -15}px) translateY(${position.y * -15}px) scale(1.1)` : 'translateX(0) translateY(0) scale(1)'
        }}
      />
      
      {/* Enhanced 3D overlay with depth */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent transition-opacity duration-300",
          isHovered ? "opacity-90" : "opacity-75"
        )}
        style={{
          transform: isHovered ? `translateZ(-10px)` : 'translateZ(0)',
        }}
      />
      
      {/* 3D floating particles (only visible on hover) */}
      {isHovered && (
        <>
          <div 
            className="absolute w-2 h-2 rounded-full bg-primary/70 animate-pulse-slow"
            style={{ 
              top: '20%', 
              left: '30%',
              transform: `translateZ(30px) translateX(${position.x * -20}px) translateY(${position.y * -20}px)`,
            }}
          />
          <div 
            className="absolute w-3 h-3 rounded-full bg-secondary/70 animate-pulse-slow"
            style={{ 
              top: '60%', 
              right: '20%',
              transform: `translateZ(40px) translateX(${position.x * -30}px) translateY(${position.y * -30}px)`,
            }}
          />
          <div 
            className="absolute w-1.5 h-1.5 rounded-full bg-accent/70 animate-pulse-slow"
            style={{ 
              bottom: '25%', 
              left: '40%',
              transform: `translateZ(20px) translateX(${position.x * -10}px) translateY(${position.y * -10}px)`,
            }}
          />
        </>
      )}
      
      {/* Content with enhanced 3D pop effect */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end parallax-card-content">
        <div 
          className="transform transition-transform duration-300" 
          style={{ 
            transform: isHovered ? 'translateZ(40px)' : 'translateZ(0)',
            transformStyle: 'preserve-3d'
          }}
        >
          <span 
            className="inline-block text-xs font-medium text-primary mb-2 bg-primary/10 px-2 py-1 rounded backdrop-blur-sm"
            style={{ transform: isHovered ? 'translateZ(10px)' : 'translateZ(0)' }}
          >
            {item.category}
          </span>
          <h3 
            className="text-xl font-bold mb-2 group-hover:text-gradient transition-colors"
            style={{ 
              transform: isHovered ? 'translateZ(20px)' : 'translateZ(0)',
              textShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            {item.title}
          </h3>
          <p 
            className={cn(
              "text-sm text-muted-foreground mb-4 line-clamp-2 transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{ transform: isHovered ? 'translateZ(15px)' : 'translateZ(0)' }}
          >
            {item.description}
          </p>
          <Link 
            to={`/portfolio/${item.id}`}
            className={cn(
              "inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0)' }}
          >
            View Project <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
