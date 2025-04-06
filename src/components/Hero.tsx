
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleShowreel = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('/lovable-uploads/7b848a00-9e0c-453d-b40b-1d443da37d7a.png')`,
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/80 backdrop-blur-[2px]"></div>
      </div>

      {/* Content container with better centering */}
      <div className="container mx-auto px-4 z-10 flex flex-col items-center text-center mt-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6"
        >
          <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
            Motion Graphics Artist
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10"
        >
          Creating captivating visual experiences through the art of motion
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30" size="lg" asChild>
            <Link to="/portfolio" className="px-6 py-6 flex items-center">
              View Portfolio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={toggleShowreel}
            className="backdrop-blur-sm bg-background/10 border-primary/20 text-white hover:text-white hover:bg-background/20 shadow-lg py-6"
          >
            <Play className="mr-2 h-4 w-4" />
            Watch Showreel
          </Button>
        </motion.div>
      </div>

      {/* Video Modal */}
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
