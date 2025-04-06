
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile();
  const [showreelUrl, setShowreelUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.general && settings.general.showreelUrl) {
          setShowreelUrl(settings.general.showreelUrl);
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
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background image with dark overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#1A1F2C]/95" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('/lovable-uploads/dfcb7e28-ad95-4a2f-94de-7fde37926891.png')`,
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 flex flex-col items-center text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] bg-clip-text text-transparent"
        >
          Motion Graphics Artist
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl text-white/90 max-w-2xl mb-10 px-4"
        >
          With 7 years of experience in motion design, I've mastered the art of creating compelling visual stories through dynamic branding and captivating animations. My expertise spans storytelling, motion branding, animation filmmaking, illustration, visual design, and creative coding.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center"
        >
          <Button 
            className="bg-[#4a6cf7] hover:bg-[#3a5ce7] text-white px-8 py-6 h-auto text-base sm:text-lg w-full sm:w-auto" 
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
            className="border-[#4a6cf7] text-white hover:bg-[#4a6cf7]/10 px-8 py-6 h-auto text-base sm:text-lg w-full sm:w-auto"
          >
            <Play className="mr-2 h-4 w-4" />
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
          <div 
            className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
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
          </div>
        </div>
      )}
    </section>
  );
};
