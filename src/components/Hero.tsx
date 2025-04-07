
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile();
  const [showreelUrl, setShowreelUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [animations3DEnabled, setAnimations3DEnabled] = useState(true);
  
  // Mouse tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Transform mouse position into rotation values
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
  
  // Add spring physics for smoother motion
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });
  
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.general && settings.general.showreelUrl) {
          setShowreelUrl(settings.general.showreelUrl);
        }
        if (settings.animation && settings.animation.enable3DEffects !== undefined) {
          setAnimations3DEnabled(settings.animation.enable3DEffects);
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!animations3DEnabled || isMobile) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const rect = heroRef.current?.getBoundingClientRect();
      
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        mouseX.set(clientX - centerX);
        mouseY.set(clientY - centerY);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [animations3DEnabled, isMobile, mouseX, mouseY]);

  const toggleShowreel = () => {
    setIsPlaying(!isPlaying);
  };

  // Function to ensure the URL is in embed format
  const getEmbedUrl = (url: string) => {
    // Convert standard YouTube URLs to embed format
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
    }
    // Convert youtu.be URLs to embed format
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    // Convert standard Vimeo URLs to embed format
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com/')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return url;
  };

  return (
    <section 
      ref={heroRef}
      className="relative w-full pt-16 overflow-hidden" 
      style={{ height: 'calc(100vh - 64px)', maxHeight: '800px' }}
    >
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F2C] to-[#262b38]" />
        
        {/* Enhanced animated background elements */}
        {animations3DEnabled && (
          <>
            <motion.div 
              className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#4a6cf7]/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.4, 0.3],
                x: [0, 20, 0],
                y: [0, -20, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            
            <motion.div 
              className="absolute top-1/4 -right-16 w-24 h-24 bg-[#9b87f5]/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.2, 0.3, 0.2],
                x: [0, -20, 0],
                y: [0, 20, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            
            {/* Additional floating elements */}
            <motion.div 
              className="absolute top-1/3 left-1/4 w-16 h-16 bg-[#4a6cf7]/15 rounded-full blur-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
                y: [0, -15, 0]
              }}
              transition={{ 
                duration: 7, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
            
            <motion.div 
              className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-[#9b87f5]/15 rounded-full blur-2xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.15, 0.25, 0.15],
                y: [0, 15, 0]
              }}
              transition={{ 
                duration: 9, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3
              }}
            />
            
            {/* 3D floating shapes */}
            <motion.div
              className="absolute hidden md:block left-[15%] top-[25%] w-16 h-16 bg-gradient-to-br from-[#4a6cf7]/20 to-[#9b87f5]/20 rounded-lg"
              style={{
                filter: "blur(1px)",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                transformStyle: "preserve-3d",
                transform: "perspective(1000px) rotateX(20deg) rotateY(-20deg)",
                backfaceVisibility: "hidden"
              }}
              animate={{
                rotateX: [20, -20, 20],
                rotateY: [-20, 20, -20],
                y: [0, -10, 0]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              className="absolute hidden md:block right-[15%] bottom-[30%] w-12 h-12 bg-gradient-to-tr from-[#9b87f5]/20 to-[#4a6cf7]/20 rounded-full"
              style={{
                filter: "blur(1px)",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                transformStyle: "preserve-3d",
                transform: "perspective(1000px) rotateX(-15deg) rotateY(15deg)",
                backfaceVisibility: "hidden"
              }}
              animate={{
                rotateX: [-15, 15, -15],
                rotateY: [15, -15, 15],
                y: [0, 10, 0]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </>
        )}
      </div>

      {/* Content with 3D tilt effect */}
      <motion.div 
        className="container relative mx-auto px-4 z-10 flex flex-col h-full justify-center items-center text-center"
        style={animations3DEnabled && !isMobile ? {
          perspective: "1000px",
          transformStyle: "preserve-3d",
          rotateX: springRotateX,
          rotateY: springRotateY
        } : {}}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3"
          style={animations3DEnabled ? { transformStyle: "preserve-3d", z: 30 } : {}}
        >
          <div className="inline-block rounded-full px-3 py-1 bg-[#4a6cf7]/10 text-[#4a6cf7] text-xs md:text-sm font-medium mb-3">
            Motion Graphics Artist
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-4 text-white max-w-3xl leading-tight"
          style={animations3DEnabled ? { transformStyle: "preserve-3d", z: 40 } : {}}
        >
          Bringing <span className="bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] bg-clip-text text-transparent">ideas</span> to life through <span className="bg-gradient-to-r from-[#9b87f5] to-[#4a6cf7] bg-clip-text text-transparent">motion</span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-[40px] h-[2px] bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] mx-auto mb-4"
          style={animations3DEnabled ? { transformStyle: "preserve-3d", z: 20 } : {}}
        />
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm md:text-base text-white/80 max-w-2xl mb-6 md:mb-8 px-4 leading-relaxed"
          style={animations3DEnabled ? { transformStyle: "preserve-3d", z: 30 } : {}}
        >
          With 7 years of experience in motion design, I've mastered the art of creating compelling visual stories through dynamic branding and captivating animations.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 items-center justify-center"
          style={animations3DEnabled ? { transformStyle: "preserve-3d", z: 50 } : {}}
        >
          <Button 
            className="bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] hover:opacity-90 text-white px-4 py-1.5 h-auto text-sm sm:w-auto rounded-full shadow-md"
            asChild
          >
            <Link to="/portfolio" className="flex items-center justify-center">
              View Portfolio
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={toggleShowreel}
            className="border-[#9b87f5] text-white hover:bg-[#9b87f5]/10 px-4 py-1.5 h-auto text-sm sm:w-auto rounded-full"
          >
            <Play className="mr-2 h-3.5 w-3.5 text-[#9b87f5]" />
            Watch Showreel
          </Button>
        </motion.div>
      </motion.div>

      {/* Video Modal */}
      {isPlaying && (
        <motion.div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={toggleShowreel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
            style={animations3DEnabled ? {
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              transform: "perspective(1000px) rotateX(2deg)"
            } : {}}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="w-full h-full"
              src={getEmbedUrl(showreelUrl)}
              title="Showreel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};
