
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [enableParallax, setEnableParallax] = useState(true);

  useEffect(() => {
    // Detect if device is mobile or has reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Disable parallax on mobile or if user prefers reduced motion
    if (prefersReducedMotion || isMobile) {
      setEnableParallax(false);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableParallax) return;
    
    // Throttle mouse move calculations to improve performance
    // Only update position every 50ms
    if (!window.requestAnimationFrame) return;
    
    window.requestAnimationFrame(() => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Reduce movement factor for better performance
      const moveX = (clientX - centerX) / 35;
      const moveY = (clientY - centerY) / 35;
      
      setMousePosition({ x: moveX, y: moveY });
    });
  };

  const toggleShowreel = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section 
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
      onMouseMove={handleMouseMove}
    >
      {/* Simplified background elements with reduced blur effects */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-background/90">
        <div 
          className="absolute inset-0"
          style={{
            transform: enableParallax ? `translateX(${mousePosition.x * -1}px) translateY(${mousePosition.y * -1}px)` : 'none'
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/15 blur-2xl"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-secondary/15 blur-2xl"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-accent/15 blur-2xl"
          />
        </div>
      </div>

      {/* Content with simplified animation */}
      <div 
        className="container mx-auto px-4 z-10 flex flex-col items-center text-center"
        style={{
          transform: enableParallax ? `translateX(${mousePosition.x * 0.5}px) translateY(${mousePosition.y * 0.5}px)` : 'none'
        }}
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-gradient"
        >
          Motion Graphics Artist
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
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

      {/* Optimized Video Modal */}
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
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
};
