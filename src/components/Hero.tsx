
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [enableParallax, setEnableParallax] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      setEnableParallax(true);
    }, 1000);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableParallax) return;
    
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Calculate distance from center
    const moveX = (clientX - centerX) / 40; // Reduce divisor for more movement
    const moveY = (clientY - centerY) / 40;
    
    setMousePosition({ x: moveX, y: moveY });
  };

  const toggleShowreel = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section 
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
      onMouseMove={handleMouseMove}
    >
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-background/90">
        {/* Abstract shapes with parallax effect */}
        <div 
          ref={backgroundRef}
          className="absolute inset-0"
          style={{
            transform: `translateX(${mousePosition.x * -1}px) translateY(${mousePosition.y * -1}px)`
          }}
        >
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-spin-slow" />
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="container mx-auto px-4 z-10 flex flex-col items-center text-center"
        style={{
          transform: `translateX(${mousePosition.x}px) translateY(${mousePosition.y}px)`
        }}
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-gradient">
          Motion Graphics Artist
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-in">
          Creating captivating visual experiences through the art of motion
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button className="bg-primary hover:bg-primary/90" size="lg">
            View Portfolio
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" onClick={toggleShowreel}>
            <Play className="mr-2 h-4 w-4" />
            Watch Showreel
          </Button>
        </div>
      </div>

      {/* Video Modal */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity",
          isPlaying ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={toggleShowreel}
      >
        <div 
          className={cn(
            "w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden transition-transform duration-300",
            isPlaying ? "scale-100" : "scale-90"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {isPlaying && (
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Showreel"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </div>
    </section>
  );
};
