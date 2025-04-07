
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Briefcase, MapPin, Award, Sparkles, Zap, BookUser } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface AboutMeData {
  owner_name: string;
  owner_title: string;
  owner_bio: string;
  owner_photo_url: string | null;
  owner_skills: string;
  owner_location: string | null;
  client_focused_text: string | null;
  quality_first_text: string | null;
}

const About = () => {
  const [loading, setLoading] = useState(true);
  const [aboutInfo, setAboutInfo] = useState<AboutMeData>({
    owner_name: "",
    owner_title: "",
    owner_bio: "",
    owner_photo_url: "",
    owner_skills: "",
    owner_location: "",
    client_focused_text: "",
    quality_first_text: ""
  });
  const [glowEffects, setGlowEffects] = useState(true);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Load the data from the database
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('about_me')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.error('Error fetching about data:', error);
          throw error;
        }
        
        if (data) {
          setAboutInfo({
            owner_name: data.owner_name,
            owner_title: data.owner_title,
            owner_bio: data.owner_bio,
            owner_photo_url: data.owner_photo_url,
            owner_skills: data.owner_skills,
            owner_location: data.owner_location,
            client_focused_text: data.client_focused_text,
            quality_first_text: data.quality_first_text
          });
          console.log('Loaded about data from database:', data);
        }
      } catch (error) {
        console.error('Error in fetchAboutData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAboutData();
  }, []);

  // Split skills into array
  const skills = aboutInfo.owner_skills?.split(',').map(skill => skill.trim()) || [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />
      
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F2C] via-[#252A3A] to-[#2A2D40]" />
        
        {glowEffects && (
          <>
            <motion.div 
              className="absolute top-0 right-0 w-full h-96 bg-gradient-to-l from-[#4a6cf7]/10 via-transparent to-[#9b87f5]/10 blur-3xl opacity-50"
              animate={{
                x: ['20%', '-120%', '20%'],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-r from-[#9b87f5]/10 via-transparent to-[#4a6cf7]/10 blur-3xl opacity-30"
              animate={{
                x: ['-120%', '20%', '-120%'],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </>
        )}
      </div>
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              className="inline-block px-4 py-1 mb-4 rounded-full bg-gradient-to-r from-[#4a6cf7]/20 to-[#9b87f5]/20 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-white/90 text-sm font-medium flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                About Me
                <Sparkles className="h-3.5 w-3.5 ml-2" />
              </span>
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] bg-clip-text text-transparent">About Me</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] mb-8"></div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {/* Profile Image */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="col-span-1"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Avatar className="w-48 h-48 border-4 border-[#4a6cf7]/30 shadow-lg shadow-[#4a6cf7]/20">
                        <AvatarImage 
                          src={aboutInfo.owner_photo_url || ''} 
                          alt={aboutInfo.owner_name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-[#4a6cf7]/30 to-[#9b87f5]/30">
                          {aboutInfo.owner_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    
                    <div className="text-center mt-4">
                      <h3 className="text-2xl font-bold">{aboutInfo.owner_name}</h3>
                      <p className="text-primary font-medium">{aboutInfo.owner_title}</p>
                      
                      {aboutInfo.owner_location && (
                        <div className="flex items-center justify-center mt-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{aboutInfo.owner_location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                
                {/* Bio */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="col-span-2"
                >
                  <div className="space-y-8">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div variants={itemVariants}>
                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                          Bio
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                            className="ml-2"
                          >
                            <BookUser className="h-5 w-5 text-[#9b87f5]" />
                          </motion.div>
                        </h2>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-muted-foreground leading-relaxed">
                            {aboutInfo.owner_bio}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-2"
                    >
                      <motion.div variants={itemVariants}>
                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                          Skills
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7, duration: 0.3 }}
                            className="ml-2"
                          >
                            <Zap className="h-5 w-5 text-[#4a6cf7]" />
                          </motion.div>
                        </h2>
                      </motion.div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ scale: 1.1 }}
                            onMouseEnter={() => setHoveredSkill(skill)}
                            onMouseLeave={() => setHoveredSkill(null)}
                          >
                            <Badge 
                              variant="secondary"
                              className={`px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                                hoveredSkill === skill 
                                  ? 'bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] text-white'
                                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/15'
                              }`}
                            >
                              {skill}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div variants={itemVariants}>
                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                          My Approach
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9, duration: 0.3 }}
                            className="ml-2"
                          >
                            <Award className="h-5 w-5 text-amber-400" />
                          </motion.div>
                        </h2>
                      </motion.div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div 
                          variants={itemVariants}
                          whileHover={{ y: -5 }}
                          className="bg-white/5 backdrop-blur-sm p-5 rounded-lg shadow-lg border border-white/10"
                        >
                          <div className="flex items-start">
                            <div className="mr-3 bg-primary/10 p-2 rounded">
                              <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Client-Focused</h3>
                              <p className="text-sm text-muted-foreground">
                                {aboutInfo.client_focused_text || 'I work closely with clients to understand their vision and deliver results that exceed expectations.'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          variants={itemVariants}
                          whileHover={{ y: -5 }}
                          className="bg-white/5 backdrop-blur-sm p-5 rounded-lg shadow-lg border border-white/10"
                        >
                          <div className="flex items-start">
                            <div className="mr-3 bg-primary/10 p-2 rounded">
                              <Award className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Quality First</h3>
                              <p className="text-sm text-muted-foreground">
                                {aboutInfo.quality_first_text || 'Every project receives my full attention to detail, ensuring premium quality results.'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
