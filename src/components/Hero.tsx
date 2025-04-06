
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile();
  const [showreelUrl, setShowreelUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [animations3DEnabled, setAnimations3DEnabled] = useState(true);
  
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
    <section className="relative w-full pt-16 overflow-hidden" style={{ height: 'calc(100vh - 64px)', maxHeight: '800px' }}>
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F2C] to-[#262b38]" />
        
        {/* Simplified animated background elements */}
        {animations3DEnabled && (
          <>
            <motion.div 
              className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#4a6cf7]/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.4, 0.3]
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
      <div className="container relative mx-auto px-4 z-10 flex flex-col h-full justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3"
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
        >
          Bringing <span className="bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] bg-clip-text text-transparent">ideas</span> to life through <span className="bg-gradient-to-r from-[#9b87f5] to-[#4a6cf7] bg-clip-text text-transparent">motion</span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-[40px] h-[2px] bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] mx-auto mb-4"
        />
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm md:text-base text-white/80 max-w-2xl mb-6 md:mb-8 px-4 leading-relaxed"
        >
          With 7 years of experience in motion design, I've mastered the art of creating compelling visual stories through dynamic branding and captivating animations.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 items-center justify-center"
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
      </div>

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
