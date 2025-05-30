
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Instagram, Github, ExternalLink, Briefcase } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-primary"
            >
              Our Team
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Meet the creative minds behind our exceptional motion graphics and animation projects.
            </motion.p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {teamMembers.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * member.display_order }}
                  className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-4xl font-bold text-muted-foreground">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="text-primary font-medium">{member.position}</p>
                    {member.bio && (
                      <p className="mt-3 text-muted-foreground">{member.bio}</p>
                    )}
                    {member.social_links && Object.keys(member.social_links).length > 0 && (
                      <div className="mt-4 flex space-x-3">
                        {Object.entries(member.social_links).map(([platform, url]) => (
                          url && (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              aria-label={`${member.name}'s ${platform}`}
                            >
                              {getSocialIcon(platform)}
                            </a>
                          )
                        ))}
                      </div>
                    )}
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
                className="text-3xl font-bold text-center mb-8"
              >
                Our Areas of Expertise
              </motion.h2>
              
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "outline"}
                    className="rounded-full px-6"
                    onClick={() => handleSectionClick(section.id)}
                  >
                    {section.name}
                  </Button>
                ))}
              </div>

              {loadingProjects ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : sectionProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sectionProjects.map((project) => (
                    <Link
                      to={`/portfolio/${project.id}`}
                      key={project.id}
                      className="bg-card rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow group"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                        <span className="inline-block mt-2 text-xs bg-muted px-2 py-1 rounded">{project.category}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center p-10 bg-muted/30 rounded-lg">
                  <Briefcase className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No projects found</h3>
                  <p className="text-muted-foreground">
                    No projects are currently associated with this expertise area.
                  </p>
                </div>
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
