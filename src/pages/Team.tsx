
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Linkedin, Twitter, Instagram, Github, ExternalLink, Briefcase, Award, Heart, Star, BookUser } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { getProjectsBySectionForTeam } from '@/utils/supabaseUtils';
import { Link } from 'react-router-dom';

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
  website?: string;
  [key: string]: string | undefined;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  social_links: SocialLinks;
  display_order: number;
  is_active: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
}

interface SiteSection {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionProjects, setSectionProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [glowEffects, setGlowEffects] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          throw error;
        }

        setTeamMembers(data || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSections = async () => {
      try {
        const { data, error } = await supabase
          .from('site_sections')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          throw error;
        }

        setSections(data || []);
        
        // Set first section as active by default if available
        if (data && data.length > 0) {
          setActiveSection(data[0].id);
          loadSectionProjects(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchTeamMembers();
    fetchSections();
  }, []);

  const loadSectionProjects = async (sectionId: string) => {
    if (!sectionId) return;
    
    try {
      setLoadingProjects(true);
      const projects = await getProjectsBySectionForTeam(sectionId);
      setSectionProjects(projects);
    } catch (error) {
      console.error('Error loading section projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    loadSectionProjects(sectionId);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'github':
        return <Github className="h-5 w-5" />;
      case 'website':
        return <ExternalLink className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  // Icon mappings for different positions
  const getPositionIcon = (position: string) => {
    const lowerPosition = position.toLowerCase();
    if (lowerPosition.includes('director') || lowerPosition.includes('lead')) {
      return <Award className="h-5 w-5 text-amber-400" />;
    } else if (lowerPosition.includes('design') || lowerPosition.includes('artist')) {
      return <Star className="h-5 w-5 text-purple-400" />;
    } else if (lowerPosition.includes('developer') || lowerPosition.includes('engineer')) {
      return <BookUser className="h-5 w-5 text-blue-400" />;
    } else {
      return <Heart className="h-5 w-5 text-red-400" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow relative">
        {/* Dynamic background with subtle animated gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F2C] via-[#252A3A] to-[#2A2D40]" />
          
          {glowEffects && (
            <>
              <motion.div 
                className="absolute top-0 left-0 w-full h-96 bg-gradient-to-r from-[#4a6cf7]/10 via-transparent to-[#9b87f5]/10 blur-3xl opacity-50"
                animate={{
                  x: ['-20%', '120%', '-20%'],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              <motion.div 
                className="absolute bottom-0 right-0 w-full h-96 bg-gradient-to-r from-[#9b87f5]/10 via-transparent to-[#4a6cf7]/10 blur-3xl opacity-30"
                animate={{
                  x: ['120%', '-20%', '120%'],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </>
          )}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block px-4 py-1 mb-4 rounded-full bg-gradient-to-r from-[#4a6cf7]/20 to-[#9b87f5]/20 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-white/90 text-sm font-medium">Meet the creative minds</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] bg-clip-text text-transparent"
            >
              Our Team
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="w-24 h-1 bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] mx-auto my-4"
            />
            
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-xl text-white/80 max-w-3xl mx-auto"
            >
              Meet the creative minds behind our exceptional motion graphics and animation projects.
            </motion.p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.1 * index,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ y: -8 }}
                  onMouseEnter={() => setHoveredMember(member.id)}
                  onMouseLeave={() => setHoveredMember(null)}
                  className={`relative rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 ${
                    hoveredMember === member.id ? 'scale-[1.02] shadow-xl' : ''
                  }`}
                >
                  {/* Glow effect container */}
                  {glowEffects && hoveredMember === member.id && (
                    <motion.div 
                      className="absolute -inset-0.5 bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] rounded-xl blur-sm opacity-70 -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <div className="bg-card rounded-xl overflow-hidden shadow-lg">
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      {member.photo_url ? (
                        <motion.img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          layoutId={`photo-${member.id}`}
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4a6cf7]/30 to-[#9b87f5]/30">
                          <span className="text-6xl font-bold text-white/80">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Position badge */}
                      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm flex items-center space-x-1.5">
                        {getPositionIcon(member.position)}
                        <span>{member.position}</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold">{member.name}</h3>
                      {member.bio && (
                        <p className="mt-3 text-muted-foreground">{member.bio}</p>
                      )}
                      {member.social_links && Object.keys(member.social_links).length > 0 && (
                        <motion.div 
                          className="mt-5 flex space-x-3"
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {Object.entries(member.social_links).map(([platform, url]) => (
                            url && (
                              <motion.a
                                key={platform}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-muted-foreground hover:text-primary transition-colors p-2 rounded-full bg-black/20 hover:bg-black/30`}
                                aria-label={`${member.name}'s ${platform}`}
                                whileHover={{ 
                                  scale: 1.2, 
                                  backgroundColor: "rgba(74, 108, 247, 0.2)" 
                                }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {getSocialIcon(platform)}
                              </motion.a>
                            )
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {sections.length > 0 && (
            <div className="mt-24">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
              >
                Our Areas of Expertise
              </motion.h2>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-3 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Button
                      variant={activeSection === section.id ? "default" : "outline"}
                      className={`rounded-full px-6 ${
                        activeSection === section.id 
                          ? 'bg-gradient-to-r ' + (section.color || 'from-[#4a6cf7] to-[#9b87f5]') + ' hover:opacity-90' 
                          : 'border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => handleSectionClick(section.id)}
                    >
                      {section.name}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>

              {loadingProjects ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : sectionProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sectionProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      whileHover={{ y: -5 }}
                    >
                      <Link
                        to={`/portfolio/${project.id}`}
                        className="bg-card rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-500 group block"
                      >
                        <div className="aspect-video overflow-hidden">
                          <motion.img 
                            src={project.image_url} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.description}</p>
                          <span className="inline-block mt-3 text-xs bg-white/10 px-3 py-1 rounded-full">{project.category}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="text-center p-10 bg-muted/30 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Briefcase className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No projects found</h3>
                  <p className="text-muted-foreground">
                    No projects are currently associated with this expertise area.
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamPage;
