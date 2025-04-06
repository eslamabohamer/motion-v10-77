
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [enableParallax, setEnableParallax] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [scrollY, setScrollY] = useState(0);

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

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        {/* Animated grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            transform: `perspective(1000px) rotateX(60deg) translateY(${scrollY * 0.5}px) scale(2)`,
          }}
        />

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

          {/* 3D Floating Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute top-[30%] right-[20%] w-12 h-12 bg-primary/40 rounded-full backdrop-blur-md"
            style={{
              boxShadow: "0 0 20px rgba(125, 125, 255, 0.5)",
              transform: `translateZ(${50 - scrollY * 0.1}px) translateX(${mousePosition.x * 1.5}px) translateY(${mousePosition.y * 1.5}px)`,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute bottom-[35%] left-[30%] w-8 h-8 bg-secondary/40 rounded-md backdrop-blur-md rotate-45"
            style={{
              boxShadow: "0 0 20px rgba(155, 105, 255, 0.5)",
              transform: `translateZ(${30 - scrollY * 0.05}px) translateX(${-mousePosition.x * 2}px) translateY(${-mousePosition.y * 2}px)`,
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
          <Button 
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
            size="lg"
            asChild
          >
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

        {/* 3D Cards Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full mt-20 flex justify-center"
        >
          <div className="grid grid-cols-3 gap-4 max-w-3xl perspective-1000">
            {[1, 2, 3].map((index) => (
              <div 
                key={index}
                className="group rounded-xl overflow-hidden bg-gradient-to-br from-background to-background/50 border border-primary/10 shadow-xl relative hover:-translate-y-2 transition-transform duration-300"
                style={{
                  transform: `perspective(1000px) rotateY(${mousePosition.x * 0.04}deg) rotateX(${-mousePosition.y * 0.04}deg)`,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.3s ease"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-70"></div>
                <div className="w-full aspect-video bg-background/50 overflow-hidden">
                  <div className="w-full h-full bg-gray-200/30 animate-pulse flex items-center justify-center">
                    <span className="text-primary/40 text-sm">Preview {index}</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="w-3/4 h-4 bg-gray-200/30 rounded animate-pulse"></div>
                  <div className="w-1/2 h-3 bg-gray-200/20 rounded animate-pulse mt-2"></div>
                </div>
              </div>
            ))}
          </div>
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

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground mb-2">Scroll to explore</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center"
          >
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-3 bg-primary rounded-full mt-2"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
