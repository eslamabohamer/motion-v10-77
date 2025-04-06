
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Project {
  id: string;
  title: string;
  category: string;
  image_url: string;
  video_url: string | null;
  description: string;
  created_at: string;
}

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Error fetching project:', error);
          return;
        }
        
        setProject(data);
        
        // Fetch related projects in the same category
        if (data) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('projects')
            .select('*')
            .eq('category', data.category)
            .neq('id', id)
            .limit(3);
            
          if (!relatedError && relatedData) {
            setRelatedProjects(relatedData);
          }
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const formatVideoUrl = (url: string | null) => {
    if (!url) return null;
    
    // Handle YouTube URLs
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
    }
    // Handle YouTube short URLs
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    // Handle Vimeo URLs
    if (url.includes('vimeo.com/')) {
      const vimeoId = url.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
    
    return url;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse max-w-4xl mx-auto">
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
              <div className="aspect-video bg-muted rounded-lg mb-8"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/portfolio" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
            </Link>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{project.title}</h1>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {project.category}
              </span>
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                {format(new Date(project.created_at), 'MMMM yyyy')}
              </span>
            </div>
            
            {/* Main project image/video */}
            <div className="mb-8 rounded-lg overflow-hidden border shadow-sm">
              {project.video_url ? (
                <div className="aspect-video">
                  <iframe
                    src={formatVideoUrl(project.video_url)}
                    className="w-full h-full"
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <img 
                  src={project.image_url} 
                  alt={project.title} 
                  className="w-full h-auto"
                />
              )}
            </div>
            
            {/* Project description */}
            <div className="prose max-w-none mb-12">
              <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {project.description}
              </p>
            </div>
            
            {/* Related projects */}
            {relatedProjects.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Related Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedProjects.map(relatedProject => (
                    <Link
                      key={relatedProject.id}
                      to={`/portfolio/${relatedProject.id}`}
                      className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={relatedProject.image_url} 
                          alt={relatedProject.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                          {relatedProject.title}
                        </h3>
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {relatedProject.category}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioDetail;
