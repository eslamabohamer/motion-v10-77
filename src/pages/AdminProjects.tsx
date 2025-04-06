
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Image, Pencil, Plus, Star, Trash, Video } from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  category: string;
  created_at: string;
  featured: boolean;
  image_url: string;
  video_url: string | null;
  description: string;
}

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [featured, setFeatured] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
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
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ featured: !currentFeatured })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating project:', error);
        toast.error('Failed to update project status');
        return;
      }
      
      // Update local state
      setProjects(projects.map(proj => 
        proj.id === id ? { ...proj, featured: !currentFeatured } : proj
      ));
      
      toast.success(`Project ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project status');
    }
  };

  const handleEdit = (project: Project) => {
    setIsEditMode(true);
    setCurrentProject(project);
    setTitle(project.title);
    setCategory(project.category);
    setDescription(project.description);
    setImageUrl(project.image_url);
    setVideoUrl(project.video_url);
    setFeatured(project.featured || false);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
        return;
      }
      
      // Update local state
      setProjects(projects.filter(proj => proj.id !== id));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setImageFile(null);
    setVideoFile(null);
    setImageUrl("");
    setVideoUrl(null);
    setFeatured(false);
    setIsEditMode(false);
    setCurrentProject(null);
  };

  const handleFormClose = () => {
    resetForm();
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!title.trim() || !category.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isEditMode && !imageFile && !imageUrl) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setFormLoading(true);
      
      // Handle image upload if there's a new file
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const fileName = `project_image_${Date.now()}`;
        const { data: imageData, error: imageError } = await supabase.storage
          .from('projects')
          .upload(fileName, imageFile);
          
        if (imageError) {
          throw new Error('Error uploading image: ' + imageError.message);
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('projects')
          .getPublicUrl(fileName);
          
        finalImageUrl = publicUrl;
      }
      
      // Handle video upload if there's a new file
      let finalVideoUrl = videoUrl;
      if (videoFile) {
        const fileName = `project_video_${Date.now()}`;
        const { data: videoData, error: videoError } = await supabase.storage
          .from('projects')
          .upload(fileName, videoFile);
          
        if (videoError) {
          throw new Error('Error uploading video: ' + videoError.message);
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('projects')
          .getPublicUrl(fileName);
          
        finalVideoUrl = publicUrl;
      }
      
      const projectData = {
        title,
        category,
        description,
        image_url: finalImageUrl,
        video_url: finalVideoUrl,
        featured
      };
      
      if (isEditMode && currentProject) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', currentProject.id);
          
        if (error) throw error;
        
        toast.success('Project updated successfully');
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);
          
        if (error) throw error;
        
        toast.success('Project created successfully');
      }
      
      // Refresh the projects list
      fetchProjects();
      handleFormClose();
      
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error(error.message || 'Failed to save project');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminLayout 
      title="Projects Dashboard" 
      description="Manage your portfolio projects"
      icon={<Image className="mr-3 h-8 w-8 text-primary" />}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? 'Update the information for your existing project.' 
                  : 'Add a new project to your portfolio.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title*
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category*
                  </Label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Motion Graphics">Motion Graphics</SelectItem>
                      <SelectItem value="3D Animation">3D Animation</SelectItem>
                      <SelectItem value="Visual Effects">Visual Effects</SelectItem>
                      <SelectItem value="UI Animation">UI Animation</SelectItem>
                      <SelectItem value="Explainer Video">Explainer Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description*
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">
                    Image {!isEditMode && '*'}
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="mb-2"
                    />
                    {(imageUrl || (currentProject?.image_url && !imageFile)) && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Current Image:</p>
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : (imageUrl || currentProject?.image_url)} 
                          alt="Project thumbnail" 
                          className="h-20 w-auto rounded-md object-cover" 
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="video" className="text-right">
                    Video
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="mb-2"
                    />
                    {(videoUrl || (currentProject?.video_url && !videoFile)) && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Current Video:</p>
                        <div className="flex items-center">
                          <Video className="h-5 w-5 mr-2 text-primary" />
                          <a 
                            href={videoFile ? URL.createObjectURL(videoFile) : (videoUrl || currentProject?.video_url || '#')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Video
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="featured" className="text-right">
                    Featured
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={featured}
                      onCheckedChange={(checked) => setFeatured(checked as boolean)}
                    />
                    <label
                      htmlFor="featured"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Feature this project on the homepage
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleFormClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{isEditMode ? 'Update Project' : 'Create Project'}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card rounded-lg shadow-xl border overflow-hidden"
        style={{ 
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground">
              Add your first project to showcase your work
            </p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of your portfolio projects.</TableCaption>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="w-[80px] text-center">Featured</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      <img 
                        src={project.image_url} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      {project.title}
                      {project.video_url && (
                        <span className="text-xs text-primary flex items-center mt-1">
                          <Video className="h-3 w-3 mr-1" /> Has video
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{project.category}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(project.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox 
                        checked={project.featured}
                        onCheckedChange={() => toggleFeatured(project.id, project.featured)}
                        className="data-[state=checked]:bg-primary text-center"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the project
                              and remove it from your portfolio.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminProjects;
