import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';
import { UserRating } from '@/components/UserRating';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url: string | null;
}

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [colorSettings, setColorSettings] = useState({
    backgroundColor: "#1A1F2C",
    accentColor: "#4a6cf7", 
    secondaryAccentColor: "#9b87f5"
  });

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
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Fetch color settings from the new animation_settings table
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <Button asChild variant="secondary" className="mb-8">
          <Link to="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
            <p className="text-muted-foreground mb-6">{project.description}</p>
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-sm font-medium">Category:</span>
              <span className="px-3 py-1 bg-secondary rounded-full text-secondary-foreground">{project.category}</span>
            </div>
            
            {project.video_url && (
              <Button onClick={() => setShowVideo(true)} style={{ backgroundColor: colorSettings.accentColor }} className="text-white">
                <Play className="mr-2 h-4 w-4" />
                Watch Video
              </Button>
            )}
          </div>
          
          <div>
            {project.image_url ? (
              <img src={project.image_url} alt={project.title} className="rounded-lg shadow-md w-full h-auto" />
            ) : (
              <div className="bg-muted rounded-lg h-64 flex items-center justify-center text-muted-foreground">
                No Image Available
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-12">
          <UserRating projectId={project.id} />
        </div>
      </div>
      <Footer />

      {/* Video Modal */}
      {showVideo && project.video_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-full max-w-4xl mx-auto">
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={() => setShowVideo(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="aspect-w-16 aspect-h-9">
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
