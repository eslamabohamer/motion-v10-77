
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { UserRating } from '@/components/UserRating';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Briefcase, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url: string | null;
  created_at: string;
  updated_at: string;
  featured: boolean | null;
  // Extended properties that may come from joins or be added client-side
  long_description?: string;
  client_name?: string;
  completed_date?: string;
  cover_image?: string;
  gallery_images?: string[];
  project_url?: string;
  technologies?: string[];
}

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [colorSettings, setColorSettings] = useState({
    backgroundColor: "#1A1F2C",
    accentColor: "#4a6cf7",
    secondaryAccentColor: "#9b87f5"
  });

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        // We can safely cast the data because we've updated our Project interface
        setProject(data as Project);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Fetch color settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('settings')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching settings:', error);
          return;
        }
        
        // If we have settings in the database, use them
        if (data && data.length > 0 && data[0].settings) {
          const dbSettings = data[0].settings as Record<string, any>;
          
          // Extract color settings
          if (dbSettings.animation) {
            setColorSettings({
              backgroundColor: dbSettings.animation.backgroundColor || "#1A1F2C",
              accentColor: dbSettings.animation.accentColor || "#4a6cf7",
              secondaryAccentColor: dbSettings.animation.secondaryAccentColor || "#9b87f5"
            });
          }
        } 
        // As a fallback, try to load from localStorage
        else {
          const savedSettings = localStorage.getItem('siteSettings');
          if (savedSettings) {
            try {
              const settings = JSON.parse(savedSettings);
              if (settings.animation) {
                setColorSettings({
                  backgroundColor: settings.animation.backgroundColor || "#1A1F2C",
                  accentColor: settings.animation.accentColor || "#4a6cf7",
                  secondaryAccentColor: settings.animation.secondaryAccentColor || "#9b87f5"
                });
              }
            } catch (error) {
              console.error('Error parsing saved settings:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
      }
    };
    
    fetchSettings();
  }, []);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Helper to safely parse YouTube/Vimeo URLs
  const getEmbedUrl = (videoUrl: string | null): string | null => {
    if (!videoUrl) return null;
    
    try {
      // Handle YouTube URLs
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = '';
        
        if (videoUrl.includes('youtube.com/watch')) {
          const url = new URL(videoUrl);
          videoId = url.searchParams.get('v') || '';
        } else if (videoUrl.includes('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
        }
        
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // Handle Vimeo URLs
      if (videoUrl.includes('vimeo.com')) {
        const vimeoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0] || '';
        if (vimeoId) {
          return `https://player.vimeo.com/video/${vimeoId}`;
        }
      }
      
      // If we can't parse it, return the original URL
      return videoUrl;
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return videoUrl;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center flex-col p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <p className="mb-6">The project you're looking for doesn't exist or may have been deleted.</p>
          <Button asChild>
            <Link to="/portfolio">Back to Portfolio</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const embedUrl = getEmbedUrl(project.video_url);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colorSettings.backgroundColor }}>
      <Navbar />
      <main className="flex-grow pt-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Back button */}
        <div className="mb-8">
          <Button variant="outline" asChild className="group">
            <Link to="/portfolio" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Portfolio
            </Link>
          </Button>
        </div>
        
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{project.title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
            {project.description}
          </p>
        </motion.div>
        
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <img 
            src={project.cover_image || project.image_url} 
            alt={project.title} 
            className="w-full h-auto rounded-lg object-cover shadow-lg" 
            style={{ maxHeight: '600px' }}
          />
        </motion.div>
        
        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2"
          >
            <h2 className="text-2xl font-bold mb-6">About this project</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>{project.long_description || project.description}</p>
            </div>
            
            {project.project_url && (
              <Button
                asChild
                className="mt-6"
                style={{ backgroundColor: colorSettings.accentColor }}
              >
                <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live Project
                </a>
              </Button>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold mb-4">Project Details</h3>
                
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Completion Date</p>
                    <p className="text-muted-foreground">{formatDate(project.completed_date || project.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Client</p>
                    <p className="text-muted-foreground">{project.client_name || "Internal Project"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Category</p>
                    <p className="text-muted-foreground">{project.category}</p>
                  </div>
                </div>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Technologies used</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: colorSettings.accentColor + '20',
                            color: colorSettings.accentColor
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Gallery */}
        {project.gallery_images && project.gallery_images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Project Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.gallery_images.map((image, idx) => (
                <img 
                  key={idx} 
                  src={image} 
                  alt={`${project.title} gallery image ${idx + 1}`} 
                  className="rounded-lg object-cover w-full h-64 hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Video Embed */}
        {project.video_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Project Video</h2>
            <div className="relative w-full pt-[56.25%]">
              <iframe
                src={embedUrl || ''}
                title={`${project.title} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              ></iframe>
            </div>
          </motion.div>
        )}
        
        {/* User Ratings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-12"
        >
          <UserRating projectId={project.id} />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioDetail;
