
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  Play, 
  X, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Link as LinkIcon, 
  Image as ImageIcon 
} from 'lucide-react';
import UserRating from '@/components/UserRating';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url: string | null;
  website_url: string | null;
  created_at: string;
}

interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

interface ProjectLink {
  id: string;
  project_id: string;
  title: string;
  url: string;
  icon: string | null;
  display_order: number;
}

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [projectLinks, setProjectLinks] = useState<ProjectLink[]>([]);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [colorSettings, setColorSettings] = useState({
    backgroundColor: "#1A1F2C",
    accentColor: "#4a6cf7", 
    secondaryAccentColor: "#9b87f5"
  });

  // Fetch single project with its images and links
  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (id) {
          console.log("Fetching project with ID:", id);
          // Fetch project details
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            console.error('Error fetching project:', error);
            throw error;
          }
          
          console.log("Project data:", data);
          // Ensure website_url is included (added as a nullable property in our interface)
          setProject(data as Project);

          // Fetch project images - Use .from() with type assertion for custom tables
          const { data: imagesData, error: imagesError } = await supabase
            .from('project_images')
            .select('*')
            .eq('project_id', id)
            .order('display_order', { ascending: true });
          
          if (imagesError) {
            console.error('Error fetching project images:', imagesError);
          } else {
            console.log("Project images:", imagesData);
            // Use type assertion to handle the new table
            setProjectImages(imagesData as ProjectImage[] || []);
          }

          // Fetch project links - Use .from() with type assertion for custom tables
          const { data: linksData, error: linksError } = await supabase
            .from('project_links')
            .select('*')
            .eq('project_id', id)
            .order('display_order', { ascending: true });
          
          if (linksError) {
            console.error('Error fetching project links:', linksError);
          } else {
            console.log("Project links:", linksData);
            // Use type assertion to handle the new table
            setProjectLinks(linksData as ProjectLink[] || []);
          }

          // Once we have the project, fetch related projects
          if (data) {
            fetchRelatedProjects(data.category, data.id);
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Function to properly format video URL for embedding
  const getEmbedUrl = (url: string | null): string => {
    if (!url) return '';
    
    // Handle YouTube URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle youtu.be URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle Vimeo URLs
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // If it's already an embed URL or other format, return as is
    return url;
  };

  // Fetch related projects based on category
  const fetchRelatedProjects = async (category: string, currentId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('category', category)
        .neq('id', currentId)
        .limit(3);
      
      if (error) {
        throw error;
      }
      
      // Use type assertion to handle website_url which might be missing in some items
      setRelatedProjects(data as Project[] || []);
    } catch (error) {
      console.error('Error fetching related projects:', error);
    }
  };

  // Fetch color settings from the animation_settings table
  useEffect(() => {
    const fetchColorSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('animation_settings')
          .select('background_color, accent_color, secondary_accent_color')
          .limit(1);
        
        if (error) {
          console.error('Error fetching color settings:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setColorSettings({
            backgroundColor: data[0].background_color || "#1A1F2C",
            accentColor: data[0].accent_color || "#4a6cf7",
            secondaryAccentColor: data[0].secondary_accent_color || "#9b87f5"
          });
        }
      } catch (error) {
        console.error('Error in fetchColorSettings:', error);
      }
    };
    
    fetchColorSettings();
  }, []);

  // Function to navigate through images
  const navigateImages = (direction: 'next' | 'prev') => {
    if (projectImages.length <= 1) return;
    
    if (direction === 'next') {
      setCurrentImageIndex(prev => (prev + 1) % projectImages.length);
    } else {
      setCurrentImageIndex(prev => (prev - 1 + projectImages.length) % projectImages.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colorSettings.backgroundColor }}>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colorSettings.backgroundColor }}>
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-white">Project Not Found</h1>
            <p className="text-muted-foreground">
              Sorry, the project you are looking for could not be found.
            </p>
            <Button asChild variant="secondary" className="mt-4">
              <Link to="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = [
    { id: 'main', url: project.image_url, caption: 'Main image' },
    ...projectImages.map(img => ({ id: img.id, url: img.image_url, caption: img.caption }))
  ];

  // Determine if text should be RTL
  const isRTL = project.title && /[\u0590-\u05FF\u0600-\u06FF]/.test(project.title);
  const rtlClass = isRTL ? "rtl" : "";

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: colorSettings.backgroundColor }}>
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Page Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`mb-8 ${rtlClass}`}
        >
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 text-white ${isRTL ? 'text-right' : 'text-left'}`}>
            {project.title}
          </h1>
          <div className={`flex items-center text-sm text-gray-300 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span className={`inline-flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calendar className={`h-4 w-4 ${isRTL ? 'ml-1 mr-0' : 'mr-1'}`} />
              {project.created_at && format(new Date(project.created_at), 'MMMM yyyy')}
            </span>
            <span className="mx-2">•</span>
            <span>{project.category}</span>
          </div>
        </motion.div>
        
        {/* Video/Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          {project.video_url ? (
            <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-black">
              <iframe 
                src={getEmbedUrl(project.video_url)}
                title={project.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                loading="lazy"
              ></iframe>
            </div>
          ) : allImages.length > 0 ? (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <div className="aspect-video relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={allImages[currentImageIndex].url}
                    alt={allImages[currentImageIndex].caption || project.title}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
                
                {allImages.length > 1 && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => navigateImages('prev')}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => navigateImages('next')}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Caption for current image */}
              {allImages[currentImageIndex].caption && (
                <div className="p-3 bg-black/70 text-sm text-gray-200">
                  {allImages[currentImageIndex].caption}
                </div>
              )}
              
              {/* Image thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <button
                      key={image.id}
                      className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 
                        ${currentImageIndex === index ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={image.url} 
                        alt={image.caption || `Thumbnail ${index}`}
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-gray-800 flex items-center justify-center rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </motion.div>

        {/* Project Details */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`mb-16 ${rtlClass}`}
        >
          <h2 className={`text-2xl font-bold mb-4 text-white ${isRTL ? 'text-right' : ''}`}>Project Overview</h2>
          <p className={`text-gray-300 leading-relaxed mb-6 ${isRTL ? 'text-right' : ''}`}>
            {project.description}
          </p>
          
          {/* Project Links */}
          {(projectLinks.length > 0 || project.website_url) && (
            <div className={`mt-8 space-y-2 ${isRTL ? 'text-right' : ''}`}>
              <h3 className="text-xl font-semibold mb-3">Links</h3>
              <div className="flex flex-wrap gap-3">
                {project.website_url && (
                  <Button asChild variant="outline" className="border-gray-500 hover:bg-gray-700">
                    <a href={project.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>
                )}
                
                {projectLinks.map(link => (
                  <Button 
                    key={link.id} 
                    asChild 
                    variant="outline" 
                    className="border-gray-500 hover:bg-gray-700"
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.icon ? (
                        <span className="mr-2">{link.icon}</span>
                      ) : (
                        <LinkIcon className="mr-2 h-4 w-4" />
                      )}
                      {link.title}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Back button moved to bottom of content */}
          <div className={`mt-8 ${isRTL ? 'text-right' : ''}`}>
            <Button asChild variant="outline" className="border-gray-500 hover:bg-gray-700">
              <Link to="/portfolio">
                {isRTL ? (
                  <>
                    Back to Portfolio
                    <ArrowLeft className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Portfolio
                  </>
                )}
              </Link>
            </Button>
          </div>
        </motion.section>
        
        {/* User Rating Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <UserRating projectId={project.id} />
        </motion.div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`mb-16 ${rtlClass}`}
          >
            <h2 className={`text-2xl font-bold mb-6 text-white ${isRTL ? 'text-right' : ''}`}>Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((relatedProject) => (
                <Link 
                  key={relatedProject.id} 
                  to={`/portfolio/project/${relatedProject.id}`}
                  className="group rounded-lg overflow-hidden bg-gray-800/30 hover:bg-gray-800/50 transition-all"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={relatedProject.image_url} 
                      alt={relatedProject.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className={`text-lg font-semibold mb-1 text-white group-hover:text-primary transition-colors ${isRTL ? 'text-right' : ''}`}>
                      {relatedProject.title}
                    </h3>
                    <p className={`text-sm text-gray-400 ${isRTL ? 'text-right' : ''}`}>{relatedProject.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>
      <Footer />

      {/* Video Modal */}
      {showVideo && project.video_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="relative w-full max-w-4xl mx-auto">
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={() => setShowVideo(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="aspect-video">
              <iframe 
                src={getEmbedUrl(project.video_url)}
                title="Project Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioDetail;
