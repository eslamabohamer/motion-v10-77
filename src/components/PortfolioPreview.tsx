
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Sample portfolio data
const portfolioItems = [
  {
    id: 1,
    title: "Abstract Waves",
    category: "Motion Graphics",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "A mesmerizing exploration of dynamic wave forms in motion."
  },
  {
    id: 2,
    title: "Brand Evolution",
    category: "Corporate",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Visual identity animation for a tech startup's rebranding."
  },
  {
    id: 3,
    title: "Particle Universe",
    category: "3D Animation",
    image: "https://images.unsplash.com/photo-1636953056323-9c09fdd74fa6",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "An immersive journey through a universe of dynamic particles."
  },
  {
    id: 4,
    title: "Kinetic Typography",
    category: "Typography",
    image: "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Expressive typography that moves with purpose and emotion."
  }
];

export const PortfolioPreview = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolioItems.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string;
  video: string;
  description: string;
}

interface PortfolioCardProps {
  item: PortfolioItem;
}

const PortfolioCard = ({ item }: PortfolioCardProps) => {
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
      className="group relative overflow-hidden rounded-lg parallax-card h-[300px] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered ? `perspective(1000px) rotateX(${position.y * 5}deg) rotateY(${-position.x * 5}deg)` : 'perspective(1000px) rotateX(0) rotateY(0)'
      }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out"
        style={{ 
          backgroundImage: `url(${item.image})`,
          transform: isHovered ? `translateX(${position.x * -10}px) translateY(${position.y * -10}px) scale(1.1)` : 'translateX(0) translateY(0) scale(1)'
        }}
      />
      
      {/* Overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent transition-opacity duration-300",
        isHovered ? "opacity-90" : "opacity-70"
      )} />
      
      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end parallax-card-content">
        <div className="transform transition-transform duration-300" style={{ 
          transform: isHovered ? 'translateZ(30px)' : 'translateZ(0)'
        }}>
          <span className="inline-block text-xs font-medium text-primary mb-2 bg-primary/10 px-2 py-1 rounded">
            {item.category}
          </span>
          <h3 className="text-xl font-bold mb-2 group-hover:text-gradient transition-colors">
            {item.title}
          </h3>
          <p className={cn(
            "text-sm text-muted-foreground mb-4 line-clamp-2 transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
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
