
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface SiteSection {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  display_order?: number;
  color?: string;
  icon?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface HeroProps {
  sections?: SiteSection[];
}

export const Hero = ({ sections = [] }: HeroProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile();
  const [showreelUrl, setShowreelUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [animations3DEnabled, setAnimations3DEnabled] = useState(true);
  const [activeParticles, setActiveParticles] = useState(true);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  
  // Mouse tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Transform mouse position into rotation values with enhanced range for more dramatic effect
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);
  
  // Add spring physics for smoother motion with adjusted stiffness for more "bounce"
  const springRotateX = useSpring(rotateX, { stiffness: 80, damping: 25 });
  const springRotateY = useSpring(rotateY, { stiffness: 80, damping: 25 });
  
  // Particle system
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    duration: number;
  }>>([]);
  
  // Generate random particles
  useEffect(() => {
    if (!activeParticles) return;
    
    const generateParticles = () => {
      const newParticles = [];
      const colors = ['#4a6cf7', '#9b87f5', '#f7e04a', '#f74a6c'];
      
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 8 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: Math.random() * 10 + 10
        });
      }
      
      setParticles(newParticles);
    };
    
    generateParticles();
    const interval = setInterval(generateParticles, 15000);
    
    return () => clearInterval(interval);
  }, [activeParticles]);
  
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
      style={{ height: 'calc(100vh - 64px)', maxHeight: '900px' }}
    >
      {/* Enhanced background with more dramatic gradient and effect layers */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F2C] via-[#252A3A] to-[#2A2D40]" />
        
        {/* Particles system for background atmosphere */}
        {activeParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  x: `${particle.x}%`,
                  y: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  opacity: 0
                }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0, 1, 0],
                  y: [`${particle.y}%`, `${particle.y - 15}%`]
                }}
                transition={{
                  duration: particle.duration,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
        )}
        
        {/* Enhanced animated background elements with more dramatic effects */}
        {animations3DEnabled && (
          <>
            <motion.div 
              className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#4a6cf7]/15 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 30, 0],
                y: [0, -30, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            
            <motion.div 
              className="absolute top-1/4 -right-24 w-48 h-48 bg-[#9b87f5]/15 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, -30, 0],
                y: [0, 30, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            
            {/* More dramatic floating elements */}
            <motion.div 
              className="absolute top-1/3 left-1/4 w-32 h-32 bg-[#f7e04a]/10 rounded-full blur-2xl"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.4, 0.2],
                y: [0, -25, 0]
              }}
              transition={{ 
                duration: 7, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
            
            <motion.div 
              className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-[#f74a6c]/10 rounded-full blur-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.35, 0.15],
                y: [0, 25, 0]
              }}
              transition={{ 
                duration: 9, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3
              }}
            />
            
            {/* Enhanced 3D floating shapes with more complex geometry */}
            <motion.div
              className="absolute hidden md:block left-[15%] top-[25%] w-16 h-16 bg-gradient-to-br from-[#4a6cf7]/30 to-[#9b87f5]/30 rounded-lg"
              style={{
                filter: "blur(1px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.1)",
                transformStyle: "preserve-3d",
                transform: "perspective(1000px) rotateX(20deg) rotateY(-20deg) rotateZ(5deg)",
                backfaceVisibility: "hidden"
              }}
              animate={{
                rotateX: [20, -20, 20],
                rotateY: [-20, 20, -20],
                rotateZ: [5, -5, 5],
                y: [0, -15, 0]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              className="absolute hidden md:block right-[18%] bottom-[35%] w-20 h-20 bg-gradient-to-tr from-[#9b87f5]/30 to-[#4a6cf7]/30"
              style={{
                filter: "blur(1px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.1)",
                transformStyle: "preserve-3d",
                clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                transform: "perspective(1000px) rotateX(-15deg) rotateY(15deg) rotateZ(-5deg)",
                backfaceVisibility: "hidden"
              }}
              animate={{
                rotateX: [-15, 15, -15],
                rotateY: [15, -15, 15],
                rotateZ: [-5, 5, -5],
                y: [0, 15, 0]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
            
            {/* Add a third, more complex floating shape */}
            <motion.div
              className="absolute hidden md:block left-[60%] top-[15%] w-14 h-14"
              style={{
                filter: "blur(1px)",
                background: "linear-gradient(135deg, rgba(74, 108, 247, 0.25) 0%, rgba(155, 135, 245, 0.25) 100%)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.1)",
                transformStyle: "preserve-3d",
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                transform: "perspective(1000px) rotateX(10deg) rotateY(20deg) rotateZ(10deg)",
                backfaceVisibility: "hidden"
              }}
              animate={{
                rotateX: [10, -15, 10],
                rotateY: [20, -10, 20],
                rotateZ: [10, -5, 10],
                y: [0, -10, 0],
                x: [0, 10, 0]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </>
        )}
      </div>

      {/* Content with enhanced 3D tilt effect */}
      <motion.div 
        className="container relative mx-auto px-4 z-10 flex flex-col h-full justify-center items-center text-center"
        style={animations3DEnabled && !isMobile ? {
          perspective: "1200px",
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
          <div className="inline-flex items-center rounded-full px-4 py-1.5 bg-[#4a6cf7]/15 text-[#4a6cf7] text-xs md:text-sm font-medium mb-3">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Motion Graphics Artist
            <Sparkles className="ml-2 h-3.5 w-3.5" />
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 md:mb-4 text-white max-w-4xl leading-tight"
          style={animations3DEnabled ? { transformStyle: "preserve-3d", z: 40 } : {}}
        >
          Bringing <span className="bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] bg-clip-text text-transparent">ideas</span> to life through <span className="bg-gradient-to-r from-[#9b87f5] via-[#f74a6c] to-[#f7e04a] bg-clip-text text-transparent">motion</span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-[70px] h-[3px] bg-gradient-to-r from-[#4a6cf7] via-[#f74a6c] to-[#9b87f5] mx-auto mb-6"
          style={animations3DEnabled ? { transformStyle: "preserve-3d", z: 20 } : {}}
        />
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm md:text-base lg:text-lg text-white/85 max-w-2xl mb-8 md:mb-10 px-4 leading-relaxed"
          style={animations3DEnabled ? { transformStyle: "preserve-3d", z: 30 } : {}}
        >
          With 7 years of experience in motion design, I've mastered the art of creating compelling visual stories through dynamic branding and captivating animations.
        </motion.p>
        
        {/* Enhanced Sections Display with interactive hover effects */}
        {sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
            style={animations3DEnabled ? { transformStyle: "preserve-3d", z: 35 } : {}}
          >
            {sections.map((section) => (
              <Link
                key={section.id}
                to={`/portfolio/${section.slug}`}
                className={`relative overflow-hidden inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium 
                  ${highlightedSection === section.id 
                    ? 'bg-gradient-to-r ' + (section.color || 'from-purple-500 to-purple-700') + ' text-white' 
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/15'
                  } transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                onMouseEnter={() => setHighlightedSection(section.id)}
                onMouseLeave={() => setHighlightedSection(null)}
              >
                {section.name}
                <AnimatePresence>
                  {highlightedSection === section.id && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="ml-2"
                    >
                      <Zap className="h-3.5 w-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </motion.div>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          style={animations3DEnabled ? { transformStyle: "preserve-3d", z: 50 } : {}}
        >
          <Button 
            className="bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] hover:opacity-90 text-white px-6 py-6 h-auto text-base sm:w-auto rounded-full shadow-lg shadow-[#4a6cf7]/20 hover:shadow-xl hover:shadow-[#4a6cf7]/30 transition-all duration-300"
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
            className="border-[#9b87f5] border-2 text-white hover:bg-[#9b87f5]/20 px-6 py-6 h-auto text-base sm:w-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="mr-2 h-4 w-4 text-[#9b87f5]" />
            Watch Showreel
          </Button>
        </motion.div>
      </motion.div>

      {/* Enhanced Video Modal with more dramatic animation */}
      {isPlaying && (
        <motion.div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
          onClick={toggleShowreel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ 
              duration: 0.4,
              type: "spring",
              stiffness: 100
            }}
            className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
            style={animations3DEnabled ? {
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 25px rgba(155, 135, 245, 0.3)",
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
