
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useAnimation } from 'framer-motion';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [enableParallax, setEnableParallax] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    setTimeout(() => {
      setEnableParallax(true);
    }, 1000);

    // Animate in the 3D objects
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, [controls]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableParallax) return;
    
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Calculate distance from center with enhanced movement
    const moveX = (clientX - centerX) / 25; // More movement
    const moveY = (clientY - centerY) / 25;
    
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
      {/* Background elements with enhanced 3D effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-background/90">
        {/* 3D abstract shapes with parallax effect */}
        <div 
          ref={backgroundRef}
          className="absolute inset-0"
          style={{
            transform: `translateX(${mousePosition.x * -1}px) translateY(${mousePosition.y * -1}px)`
          }}
        >
          {/* Enhanced 3D objects */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/15 blur-3xl animate-float"
            style={{
              transformStyle: "preserve-3d",
              transform: `perspective(1000px) rotateX(${mousePosition.y * 0.05}deg) rotateY(${-mousePosition.x * 0.05}deg)`,
              boxShadow: "0 0 40px rgba(125, 125, 255, 0.3)",
            }}
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-secondary/15 blur-3xl animate-pulse-slow"
            style={{
              transformStyle: "preserve-3d",
              transform: `perspective(1000px) rotateX(${-mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg)`,
              boxShadow: "0 0 50px rgba(155, 105, 255, 0.3)",
            }}
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-accent/15 blur-3xl animate-spin-slow"
            style={{
              transformStyle: "preserve-3d",
              transform: `perspective(1000px) rotateX(${mousePosition.y * 0.05}deg) rotateY(${-mousePosition.x * 0.05}deg)`,
              boxShadow: "0 0 60px rgba(215, 75, 255, 0.3)",
            }}
          />
          
          {/* Additional 3D objects */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            className="absolute top-2/3 right-1/3 w-48 h-48 rounded-full bg-primary/10 blur-2xl animate-pulse-slow"
            style={{
              transformStyle: "preserve-3d",
              transform: `perspective(1000px) rotateX(${-mousePosition.y * 0.08}deg) rotateY(${mousePosition.x * 0.08}deg)`,
              boxShadow: "0 0 30px rgba(125, 125, 255, 0.2)",
            }}
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-secondary/10 blur-2xl animate-float"
            style={{
              transformStyle: "preserve-3d",
              transform: `perspective(1000px) rotateX(${mousePosition.y * 0.08}deg) rotateY(${-mousePosition.x * 0.08}deg)`,
              boxShadow: "0 0 30px rgba(155, 105, 255, 0.2)",
            }}
          />
        </div>
      </div>

      {/* Content with enhanced 3D effect */}
      <div 
        ref={contentRef}
        className="container mx-auto px-4 z-10 flex flex-col items-center text-center"
        style={{
          transformStyle: "preserve-3d",
          transform: `perspective(1000px) translateZ(50px) translateX(${mousePosition.x}px) translateY(${mousePosition.y}px) rotateX(${-mousePosition.y * 0.02}deg) rotateY(${mousePosition.x * 0.02}deg)`
        }}
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-gradient"
          style={{ textShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
        >
          Motion Graphics Artist
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
        >
          Creating captivating visual experiences through the art of motion
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" size="lg">
            View Portfolio
            <ArrowRight className="ml-2 h-4 w-4" />
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
            "w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden transition-transform duration-300 shadow-2xl",
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
