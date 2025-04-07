
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showreelUrl, setShowreelUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: 'gradient',
    gradientFrom: '#1A1F2C',
    gradientTo: '#262b38',
    imageUrl: '',
    videoUrl: '',
    opacity: 0.7
  });
  
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.general && settings.general.showreel_url) {
          setShowreelUrl(settings.general.showreel_url);
        }
        
        // Load background settings if available
        if (settings.design && settings.design.background) {
          setBackgroundSettings(settings.design.background);
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
    <section 
      className="relative w-full pt-16 overflow-hidden" 
      style={{ height: 'calc(100vh - 64px)', maxHeight: '800px' }}
    >
      {/* Background with customizable style */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {backgroundSettings.type === 'gradient' && (
          <div 
            className="absolute inset-0" 
            style={{ 
              background: `linear-gradient(to bottom, ${backgroundSettings.gradientFrom}, ${backgroundSettings.gradientTo})` 
            }} 
          />
        )}
        
        {backgroundSettings.type === 'image' && backgroundSettings.imageUrl && (
          <div className="absolute inset-0">
            <img 
              src={backgroundSettings.imageUrl} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: backgroundSettings.opacity || 0.7 }} 
            />
          </div>
        )}
        
        {backgroundSettings.type === 'video' && backgroundSettings.videoUrl && (
          <div className="absolute inset-0">
            <video
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
            >
              <source src={backgroundSettings.videoUrl} type="video/mp4" />
            </video>
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: backgroundSettings.opacity || 0.7 }} 
            />
          </div>
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
