
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [enableParallax, setEnableParallax] = useState(true);

  // Use useMemo to avoid recalculating on every render
  const backgroundElements = useMemo(() => [
    { top: '1/4', right: '1/4', width: 72, height: 72, color: 'primary', delay: 0 },
    { bottom: '1/4', left: '1/3', width: 96, height: 96, color: 'secondary', delay: 0.1 },
    { top: '1/3', left: '1/4', width: 64, height: 64, color: 'accent', delay: 0.2 },
  ], []);

  useEffect(() => {
    // Detect if device is mobile or has reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Disable parallax on mobile or if user prefers reduced motion
    if (prefersReducedMotion || isMobile) {
      setEnableParallax(false);
    }

    // Clean up any event listeners
    return () => {
      // No event listeners to clean up in this optimized version
    };
  }, []);

  // Throttle mouse move event
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableParallax) return;
    
    // Throttle using requestAnimationFrame for better performance
    window.requestAnimationFrame(() => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Reduce movement factor for better performance
      const moveX = (clientX - centerX) / 50;
      const moveY = (clientY - centerY) / 50;
      
      setMousePosition({ x: moveX, y: moveY });
    });
  };

  const toggleShowreel = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section 
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
      onMouseMove={enableParallax ? handleMouseMove : undefined}
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/lovable-uploads/b6b10c11-daca-40d3-814f-996a2f82ea00.png')`, 
            filter: "brightness(0.9)",
            transform: enableParallax ? `translateX(${mousePosition.x * 0.05}px) translateY(${mousePosition.y * 0.05}px)` : 'none'
          }}
        />
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />
      </div>

      {/* Content with optimized animation */}
      <div 
        className="container mx-auto px-4 z-10 flex flex-col items-center text-center will-change-transform"
        style={{
          transform: enableParallax ? `translateX(${mousePosition.x * 0.5}px) translateY(${mousePosition.y * 0.5}px)` : 'none'
        }}
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-gradient will-change-transform"
        >
          Motion Graphics Artist
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl text-foreground max-w-2xl mb-10 bg-background/30 backdrop-blur-sm p-4 rounded-lg"
        >
          Creating captivating visual experiences through the art of motion
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" size="lg" asChild>
            <Link to="/portfolio">
              View Portfolio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={toggleShowreel}
            className="backdrop-blur-sm bg-background/50 border-primary/20 shadow-lg"
          >
            <Play className="mr-2 h-4 w-4" />
            Watch Showreel
          </Button>
        </motion.div>
      </div>

      {/* Optimized Video Modal - Only rendered when needed */}
      {isPlaying && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={toggleShowreel}
        >
          <div 
            className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Showreel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
};
