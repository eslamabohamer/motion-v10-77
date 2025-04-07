
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Play, X } from 'lucide-react';
import { UserRating } from '@/components/UserRating';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url: string | null;
  created_at: string;
}

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [colorSettings, setColorSettings] = useState({
    backgroundColor: "#1A1F2C",
    accentColor: "#4a6cf7", 
    secondaryAccentColor: "#9b87f5"
  });

  // Fetch single project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (id) {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          setProject(data);

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
      
      setRelatedProjects(data || []);
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

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: colorSettings.backgroundColor }}>
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Page Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white rtl:text-right">{project.title}</h1>
          <div className="flex items-center text-sm text-gray-300 rtl:flex-row-reverse">
            <span className="inline-flex items-center">
              <Calendar className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
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
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-black">
              <iframe 
                src={project.video_url}
                title={project.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          ) : (
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <img 
                src={project.image_url} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </motion.div>

        {/* Project Details */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-4 text-white rtl:text-right">Project Overview</h2>
          <p className="text-gray-300 leading-relaxed mb-6 rtl:text-right">
            {project.description}
          </p>
          
          {/* Back button moved to bottom of content */}
          <div className="mt-8">
            <Button asChild variant="outline" className="border-gray-500 hover:bg-gray-700">
              <Link to="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
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
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-6 text-white rtl:text-right">Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((relatedProject) => (
                <Link 
                  key={relatedProject.id} 
                  to={`/portfolio/${relatedProject.id}`}
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
                    <h3 className="text-lg font-semibold mb-1 text-white group-hover:text-primary transition-colors rtl:text-right">
                      {relatedProject.title}
                    </h3>
                    <p className="text-sm text-gray-400 rtl:text-right">{relatedProject.category}</p>
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
                src={project.video_url}
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
};

export default PortfolioDetail;
