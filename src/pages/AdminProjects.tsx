import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase, getDefaultAvatar } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlusCircle, Image, Film, Save, Trash2, Edit, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url?: string;
  featured: boolean;
}

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    category: '',
    image_url: '',
    video_url: '',
    featured: false
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error('Please log in to manage projects');
      }
    };
    
    checkAuth();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
        return;
      }
      
      setProjects(data || []);
      
      const uniqueCategories = [...new Set(data?.map((project: Project) => project.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProject(prev => ({ ...prev, featured: e.target.checked }));
  };

  const resetForm = () => {
    setNewProject({
      title: '',
      description: '',
      category: '',
      image_url: '',
      video_url: '',
      featured: false
    });
    setEditingProjectId(null);
  };

  const openEditForm = (project: Project) => {
    setNewProject({
      title: project.title,
      description: project.description,
      category: project.category,
      image_url: project.image_url,
      video_url: project.video_url || '',
      featured: project.featured
    });
    setEditingProjectId(project.id);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProject.title || !newProject.description || !newProject.category || !newProject.image_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error('You must be logged in to perform this action');
        return;
      }
      
      if (editingProjectId) {
        const { error } = await supabase
          .from('projects')
          .update(newProject)
          .eq('id', editingProjectId);
          
        if (error) {
          console.error('Error updating project:', error);
          toast.error(`Failed to update project: ${error.message}`);
          return;
        }
        
        toast.success('Project updated successfully');
      } else {
        const projectData = {
          ...newProject,
          video_url: newProject.video_url?.trim() || null
        };
        
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);
          
        if (error) {
          console.error('Error adding project:', error);
          toast.error(`Failed to add project: ${error.message}`);
          return;
        }
        
        toast.success('Project added successfully');
      }
      
      fetchProjects();
      resetForm();
      setFormOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error('You must be logged in to perform this action');
        return;
      }
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting project:', error);
        toast.error(`Failed to delete project: ${error.message}`);
        return;
      }
      
      toast.success('Project deleted successfully');
      setProjects(projects.filter(project => project.id !== id));
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const cancelForm = () => {
    resetForm();
    setFormOpen(false);
  };

  const previewVideoUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    if (url.includes('vimeo.com/')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return url;
  };

  const addDefaultSrc = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = getDefaultAvatar();
  };

  return (
    <div className="min-h-screen">
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Projects Dashboard</h1>
              <p className="text-muted-foreground mb-4">
                Manage your portfolio projects
              </p>
            </div>
            <Button onClick={() => {
              resetForm();
              setFormOpen(!formOpen);
            }} className="mt-4 md:mt-0">
              {formOpen ? "Cancel" : <><PlusCircle className="mr-2 h-4 w-4" /> Add New Project</>}
            </Button>
          </motion.div>

          {formOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-10"
            >
              <Card className="shadow-xl border bg-card">
                <CardHeader>
                  <CardTitle>{editingProjectId ? 'Edit Project' : 'Add New Project'}</CardTitle>
                  <CardDescription>
                    {editingProjectId 
                      ? 'Update your existing portfolio project' 
                      : 'Create a new portfolio project to showcase your work'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">Project Title *</label>
                        <Input
                          id="title"
                          name="title"
                          value={newProject.title}
                          onChange={handleInputChange}
                          placeholder="Enter project title"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium">Category *</label>
                        <div className="flex gap-2">
                          <Select 
                            value={newProject.category} 
                            onValueChange={(value) => handleSelectChange('category', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={`category-${category}`} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                              {!categories.includes('Motion Graphics') && (
                                <SelectItem key="Motion Graphics" value="Motion Graphics">Motion Graphics</SelectItem>
                              )}
                              {!categories.includes('3D Animation') && (
                                <SelectItem key="3D Animation" value="3D Animation">3D Animation</SelectItem>
                              )}
                              {!categories.includes('Typography') && (
                                <SelectItem key="Typography" value="Typography">Typography</SelectItem>
                              )}
                              {!categories.includes('Corporate') && (
                                <SelectItem key="Corporate" value="Corporate">Corporate</SelectItem>
                              )}
                              {!categories.includes('Explainer') && (
                                <SelectItem key="Explainer" value="Explainer">Explainer</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">Description *</label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newProject.description}
                        onChange={handleInputChange}
                        placeholder="Describe your project"
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="image_url" className="text-sm font-medium flex items-center">
                          <Image className="mr-2 h-4 w-4" /> Image URL *
                        </label>
                        <Input
                          id="image_url"
                          name="image_url"
                          value={newProject.image_url}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          required
                        />
                        {newProject.image_url && (
                          <div className="mt-2 p-2 border rounded">
                            <img 
                              src={newProject.image_url} 
                              alt="Preview" 
                              className="h-20 object-cover rounded"
                              onError={addDefaultSrc}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="video_url" className="text-sm font-medium flex items-center">
                          <Film className="mr-2 h-4 w-4" /> Video URL (optional)
                        </label>
                        <Input
                          id="video_url"
                          name="video_url"
                          value={newProject.video_url}
                          onChange={handleInputChange}
                          placeholder="https://youtube.com/watch?v=xyz or https://vimeo.com/123456789"
                        />
                        {newProject.video_url && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Supported formats: YouTube and Vimeo URLs
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={newProject.featured}
                        onChange={handleFeaturedChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="featured" className="text-sm font-medium">
                        Feature this project on the homepage
                      </label>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button type="submit" className="w-full md:w-auto">
                        <Save className="mr-2 h-4 w-4" /> {editingProjectId ? 'Update Project' : 'Save Project'}
                      </Button>
                      <Button type="button" variant="outline" onClick={cancelForm} className="w-full md:w-auto">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center bg-card rounded-lg shadow border">
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first project to get started with your portfolio.
                </p>
                <Button onClick={() => {
                  resetForm();
                  setFormOpen(true);
                }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add First Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                    className="group"
                  >
                    <Card className="h-full overflow-hidden border hover:shadow-xl transition-shadow duration-300">
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={addDefaultSrc}
                        />
                        {project.featured && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded">
                            Featured
                          </div>
                        )}
                        {project.video_url && (
                          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded-full backdrop-blur-sm">
                            <Film className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {project.category}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {project.description}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-between">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditForm(project)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={`/portfolio/${project.id}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </a>
                          </Button>
                        </div>
                        <AlertDialog open={projectToDelete === project.id} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => setProjectToDelete(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the project "{project.title}" from your portfolio.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteProject(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminProjects;
