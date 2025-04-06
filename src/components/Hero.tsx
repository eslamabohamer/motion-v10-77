
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile();
  const [showreelUrl, setShowreelUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [animations3DEnabled, setAnimations3DEnabled] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

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
    <section ref={heroRef} className="relative py-16 md:py-24 flex flex-col items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F2C] to-[#262b38]" />
        
        {/* 3D animated background elements - reduced size and simplified */}
        {animations3DEnabled && (
          <>
            <motion.div 
              className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#4a6cf7]/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, 0],
                opacity: [0.3, 0.4, 0.3]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            
            <motion.div 
              className="absolute top-1/4 -right-16 w-48 h-48 bg-[#9b87f5]/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, -15, 0],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={animations3DEnabled ? { y: titleY } : {}}
          className="mb-4"
        >
          <div className="inline-block rounded-full px-4 py-1.5 bg-[#4a6cf7]/10 text-[#4a6cf7] text-sm font-medium mb-4">
            Motion Graphics Artist
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={animations3DEnabled ? { y: titleY, scale, opacity } : {}}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-white max-w-4xl"
        >
          Bringing <span className="bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] bg-clip-text text-transparent">ideas</span> to life through <span className="bg-gradient-to-r from-[#9b87f5] to-[#4a6cf7] bg-clip-text text-transparent">motion</span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-[50px] h-[2px] bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] mx-auto mb-6"
        />
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={animations3DEnabled ? { y: titleY, opacity } : {}}
          className="text-base md:text-lg text-white/80 max-w-2xl mb-8 px-4 leading-relaxed"
        >
          With 7 years of experience in motion design, I've mastered the art of creating compelling visual stories through dynamic branding and captivating animations.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={animations3DEnabled ? { y: titleY, opacity } : {}}
          className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center"
        >
          <Button 
            className="bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] hover:opacity-90 text-white px-6 py-2 h-auto text-base sm:text-base w-full sm:w-auto rounded-full shadow-md"
            asChild
          >
            <Link to="/portfolio" className="flex items-center justify-center">
              View Portfolio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={toggleShowreel}
            className="border-[#9b87f5] text-white hover:bg-[#9b87f5]/10 px-6 py-2 h-auto text-base sm:text-base w-full sm:w-auto rounded-full"
          >
            <Play className="mr-2 h-4 w-4 text-[#9b87f5]" />
            Watch Showreel
          </Button>
        </motion.div>
      </div>

      {/* 3D floating elements - reduced and simplified */}
      {animations3DEnabled && !isMobile && (
        <>
          <motion.div 
            className="absolute top-1/3 right-[10%] hidden md:block"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#4a6cf7] to-[#9b87f5] opacity-20 backdrop-blur-sm shadow-lg" />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-1/3 left-[10%] hidden md:block"
            animate={{ 
              y: [0, 10, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1 
            }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9b87f5] to-[#4a6cf7] opacity-15 backdrop-blur-sm shadow-lg" />
          </motion.div>
        </>
      )}

      {/* Video Modal */}
      {isPlaying && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={toggleShowreel}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
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
        </div>
      )}
    </section>
  );
};
