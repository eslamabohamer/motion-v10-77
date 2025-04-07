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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase, getDefaultAvatar } from '@/integrations/supabase/client';
import { addProjectSections, fetchSiteSections } from '@/utils/supabaseUtils';
import { toast } from 'sonner';
import { 
  PlusCircle, 
  Image, 
  Film, 
  Save, 
  Trash2, 
  Edit, 
  Eye, 
  Link, 
  ExternalLink, 
  SortAsc, 
  ArrowUp, 
  ArrowDown, 
  X,
  ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Section {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
  color?: string;
  icon?: string | null;
  description?: string | null;
}

interface ProjectImage {
  id?: string;
  project_id?: string;
  image_url: string;
  caption: string;
  display_order: number;
}

interface ProjectLink {
  id?: string;
  project_id?: string;
  title: string;
  url: string;
  icon: string;
  display_order: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url?: string | null;
  website_url?: string | null;
  featured: boolean;
  sections?: Section[];
  images?: ProjectImage[];
  links?: ProjectLink[];
}

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    category: '',
    image_url: '',
    video_url: '',
    website_url: '',
    featured: false,
    sections: [],
    images: [],
    links: []
  });
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [newImage, setNewImage] = useState<ProjectImage>({ 
    image_url: '', 
    caption: '', 
    display_order: 0 
  });
  const [projectLinks, setProjectLinks] = useState<ProjectLink[]>([]);
  const [newLink, setNewLink] = useState<ProjectLink>({ 
    title: '', 
    url: '', 
    icon: '', 
    display_order: 0 
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const loadDataFromLocalStorage = () => {
      const savedProjects = localStorage.getItem('adminProjects');
      const savedCategories = localStorage.getItem('adminCategories');
      const savedSections = localStorage.getItem('adminSections');
      
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
      
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
      
      if (savedSections) {
        setSections(JSON.parse(savedSections));
      }
    };
    
    loadDataFromLocalStorage();
    fetchProjects();
    fetchSections();
    
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error('Please log in to manage projects');
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('adminProjects', JSON.stringify(projects));
    }
    
    if (categories.length > 0) {
      localStorage.setItem('adminCategories', JSON.stringify(categories));
    }
    
    if (sections.length > 0) {
      localStorage.setItem('adminSections', JSON.stringify(sections));
    }
  }, [projects, categories, sections]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      // Fetch projects with their sections
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
        return;
      }
      
      // Fetch project sections
      const { data: projectSectionsData, error: sectionsError } = await supabase
        .from('project_sections')
        .select('project_id, section_id');
        
      if (sectionsError) {
        console.error('Error fetching project sections:', sectionsError);
      }
      
      // Fetch site sections
      const { data: siteSectionsData, error: siteSectionsError } = await fetchSiteSections();
      
      if (siteSectionsError) {
        console.error('Error fetching site sections:', siteSectionsError);
      }

      // Fetch project images - using type assertion for custom table
      const { data: projectImagesData, error: imagesError } = await supabase
        .from('project_images')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (imagesError) {
        console.error('Error fetching project images:', imagesError);
      }

      // Fetch project links - using type assertion for custom table
      const { data: projectLinksData, error: linksError } = await supabase
        .from('project_links')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (linksError) {
        console.error('Error fetching project links:', linksError);
      }
      
      const projectsWithData = data?.map(project => {
        // Get sections for this project
        const projectSectionIds = projectSectionsData
          ?.filter(ps => ps.project_id === project.id)
          .map(ps => ps.section_id) || [];
          
        const projectSections = siteSectionsData
          ?.filter(section => projectSectionIds.includes(section.id)) || [];
        
        // Get images for this project - use type assertion for the custom table
        const images = projectImagesData
          ?.filter(img => img.project_id === project.id) || [];
        
        // Get links for this project - use type assertion for the custom table
        const links = projectLinksData
          ?.filter(link => link.project_id === project.id) || [];
        
        return {
          ...project,
          sections: projectSections as Section[],
          images: images as ProjectImage[],
          links: links as ProjectLink[]
        };
      }) || [];
      
      setProjects(projectsWithData);
      
      const uniqueCategories = [...new Set(data?.map((project: Project) => project.category) || [])];
      setCategories(uniqueCategories);
      
      localStorage.setItem('adminProjects', JSON.stringify(projectsWithData));
      localStorage.setItem('adminCategories', JSON.stringify(uniqueCategories));
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const { data, error } = await fetchSiteSections();
        
      if (error) {
        console.error('Error fetching sections:', error);
        toast.error('Failed to load sections');
        return;
      }
      
      setSections(data as Section[] || []);
      
      localStorage.setItem('adminSections', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching sections:', error);
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

  const handleSectionChange = (sectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSections(prev => [...prev, sectionId]);
    } else {
      setSelectedSections(prev => prev.filter(id => id !== sectionId));
    }
  };

  // Fix for the handling of image form changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    
    if (index !== undefined) {
      // Updating an existing image
      const updatedImages = [...projectImages];
      
      if (name === 'display_order') {
        // Convert string to number for display_order
        updatedImages[index] = { 
          ...updatedImages[index], 
          [name]: parseInt(value, 10) || 0 
        };
      } else {
        updatedImages[index] = { ...updatedImages[index], [name]: value };
      }
      
      setProjectImages(updatedImages);
    } else {
      // Updating the new image form
      if (name === 'display_order') {
        // Convert string to number for display_order
        setNewImage(prev => ({ 
          ...prev, 
          [name]: parseInt(value, 10) || 0 
        }));
      } else {
        setNewImage(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  // Fix for the handling of link form changes
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    
    if (index !== undefined) {
      // Updating an existing link
      const updatedLinks = [...projectLinks];
      
      if (name === 'display_order') {
        // Convert string to number for display_order
        updatedLinks[index] = { 
          ...updatedLinks[index], 
          [name]: parseInt(value, 10) || 0 
        };
      } else {
        updatedLinks[index] = { ...updatedLinks[index], [name]: value };
      }
      
      setProjectLinks(updatedLinks);
    } else {
      // Updating the new link form
      if (name === 'display_order') {
        // Convert string to number for display_order
        setNewLink(prev => ({ 
          ...prev, 
          [name]: parseInt(value, 10) || 0 
        }));
      } else {
        setNewLink(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const addNewImage = () => {
    if (!newImage.image_url) {
      toast.error('Please enter an image URL');
      return;
    }
    
    const imageToAdd = {
      ...newImage,
      display_order: projectImages.length
    };
    
    setProjectImages(prev => [...prev, imageToAdd]);
    setNewImage({ image_url: '', caption: '', display_order: 0 });
  };

  const removeImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === projectImages.length - 1)
    ) {
      return;
    }
    
    const newImages = [...projectImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap display_order values
    const currentOrder = newImages[index].display_order;
    newImages[index].display_order = newImages[targetIndex].display_order;
    newImages[targetIndex].display_order = currentOrder;
    
    // Swap positions in array
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    setProjectImages(newImages);
  };

  const addNewLink = () => {
    if (!newLink.title || !newLink.url) {
      toast.error('Please enter both a title and URL');
      return;
    }
    
    const linkToAdd = {
      ...newLink,
      display_order: projectLinks.length
    };
    
    setProjectLinks(prev => [...prev, linkToAdd]);
    setNewLink({ title: '', url: '', icon: '', display_order: 0 });
  };

  const removeLink = (index: number) => {
    setProjectLinks(prev => prev.filter((_, i) => i !== index));
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === projectLinks.length - 1)
    ) {
      return;
    }
    
    const newLinks = [...projectLinks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap display_order values
    const currentOrder = newLinks[index].display_order;
    newLinks[index].display_order = newLinks[targetIndex].display_order;
    newLinks[targetIndex].display_order = currentOrder;
    
    // Swap positions in array
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    
    setProjectLinks(newLinks);
  };

  const resetForm = () => {
    setNewProject({
      title: '',
      description: '',
      category: '',
      image_url: '',
      video_url: '',
      website_url: '',
      featured: false,
      sections: [],
      images: [],
      links: []
    });
    setProjectImages([]);
    setProjectLinks([]);
    setSelectedSections([]);
    setEditingProjectId(null);
    setActiveTab('details');
  };

  const openEditForm = async (project: Project) => {
    setNewProject({
      title: project.title,
      description: project.description,
      category: project.category,
      image_url: project.image_url,
      video_url: project.video_url || '',
      website_url: project.website_url || '',
      featured: project.featured,
      sections: project.sections
    });
    
    // Fetch project sections
    const { data, error } = await supabase
      .from('project_sections')
      .select('section_id')
      .eq('project_id', project.id);
      
    if (error) {
      console.error('Error fetching project sections:', error);
    } else {
      setSelectedSections(data?.map(ps => ps.section_id) || []);
    }
    
    // Fetch project images - using type assertion for custom table
    const { data: imagesData, error: imagesError } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', project.id)
      .order('display_order', { ascending: true });
      
    if (imagesError) {
      console.error('Error fetching project images:', imagesError);
    } else {
      setProjectImages(imagesData as ProjectImage[] || []);
    }
    
    // Fetch project links - using type assertion for custom table
    const { data: linksData, error: linksError } = await supabase
      .from('project_links')
      .select('*')
      .eq('project_id', project.id)
      .order('display_order', { ascending: true });
      
    if (linksError) {
      console.error('Error fetching project links:', linksError);
    } else {
      setProjectLinks(linksData as ProjectLink[] || []);
    }
    
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
        // Update existing project
        const projectData = {
          title: newProject.title,
          description: newProject.description,
          category: newProject.category,
          image_url: newProject.image_url,
          video_url: newProject.video_url?.trim() || null,
          website_url: newProject.website_url?.trim() || null,
          featured: newProject.featured
        };
        
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProjectId);
          
        if (error) {
          console.error('Error updating project:', error);
          toast.error(`Failed to update project: ${error.message}`);
          return;
        }
        
        // Update project sections
        const { error: sectionsError } = await addProjectSections(editingProjectId, selectedSections);
        
        if (sectionsError) {
          console.error('Error updating project sections:', sectionsError);
          toast.error(`Failed to update project sections: ${sectionsError.message}`);
        }
        
        // Update project images
        await handleProjectImages(editingProjectId);
        
        // Update project links
        await handleProjectLinks(editingProjectId);
        
        const updatedProjects = projects.map(project => 
          project.id === editingProjectId 
            ? {
                ...project, 
                ...projectData, 
                sections: sections.filter(s => selectedSections.includes(s.id)),
                images: projectImages,
                links: projectLinks
              } 
            : project
        );
        setProjects(updatedProjects);
        
        localStorage.setItem('adminProjects', JSON.stringify(updatedProjects));
        
        toast.success('Project updated successfully');
      } else {
        // Create new project
        const projectData = {
          title: newProject.title,
          description: newProject.description,
          category: newProject.category,
          image_url: newProject.image_url,
          video_url: newProject.video_url?.trim() || null,
          website_url: newProject.website_url?.trim() || null,
          featured: newProject.featured
        };
        
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select();
          
        if (error) {
          console.error('Error adding project:', error);
          toast.error(`Failed to add project: ${error.message}`);
          return;
        }
        
        if (data && data.length > 0) {
          const projectId = data[0].id;
          
          // Add project sections
          if (selectedSections.length > 0) {
            const { error: sectionsError } = await addProjectSections(projectId, selectedSections);
            
            if (sectionsError) {
              console.error('Error adding project sections:', sectionsError);
              toast.error(`Failed to add project sections: ${sectionsError.message}`);
            }
          }
          
          // Add project images
          await handleProjectImages(projectId);
          
          // Add project links
          await handleProjectLinks(projectId);
          
          // Fetch the complete project with all relations
          const { data: completeProject, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();
            
          if (fetchError) {
            console.error('Error fetching complete project:', fetchError);
          }
          
          const newProjectWithData = {
            ...completeProject,
            sections: sections.filter(s => selectedSections.includes(s.id)),
            images: projectImages.map(img => ({ ...img, project_id: projectId })),
            links: projectLinks.map(link => ({ ...link, project_id: projectId }))
          };
          
          const updatedProjects = [newProjectWithData, ...projects];
          setProjects(updatedProjects);
          
          localStorage.setItem('adminProjects', JSON.stringify(updatedProjects));
        }
        
        toast.success('Project added successfully');
      }
      
      resetForm();
      setFormOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };

  const handleProjectImages = async (projectId: string) => {
    try {
      // First, delete all existing images for this project
      const { error: deleteError } = await supabase
        .from('project_images')
        .delete()
        .eq('project_id', projectId);
        
      if (deleteError) {
        console.error('Error deleting project images:', deleteError);
        toast.error(`Failed to update project images: ${deleteError.message}`);
        return;
      }
      
      // Then, add all current images
      if (projectImages.length > 0) {
        const imagesToInsert = projectImages.map((img, index) => ({
          project_id: projectId,
          image_url: img.image_url,
          caption: img.caption || null,
          display_order: index // Make sure display_order is a number
        }));
        
        const { error: insertError } = await supabase
          .from('project_images')
          .insert(imagesToInsert);
          
        if (insertError) {
          console.error('Error inserting project images:', insertError);
          toast.error(`Failed to add project images: ${insertError.message}`);
        }
      }
    } catch (error) {
      console.error('Error handling project images:', error);
      toast.error('Failed to update project images');
    }
  };

  const handleProjectLinks = async (projectId: string) => {
    try {
      // First, delete all existing links for this project
      const { error: deleteError } = await supabase
        .from('project_links')
        .delete()
        .eq('project_id', projectId);
        
      if (deleteError) {
        console.error('Error deleting project links:', deleteError);
        toast.error(`Failed to update project links: ${deleteError.message}`);
        return;
      }
      
      // Then, add all current links
      if (projectLinks.length > 0) {
        const linksToInsert = projectLinks.map((link, index) => ({
          project_id: projectId,
          title: link.title,
          url: link.url,
          icon: link.icon || null,
          display_order: index // Make sure display_order is a number
        }));
        
        const { error: insertError } = await supabase
          .from('project_links')
          .insert(linksToInsert);
          
        if (insertError) {
          console.error('Error inserting project links:', insertError);
          toast.error(`Failed to add project links: ${insertError.message}`);
        }
      }
    } catch (error) {
      console.error('Error handling project links:', error);
      toast.error('Failed to update project links');
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
      
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      
      localStorage.setItem('adminProjects', JSON.stringify(updatedProjects));
      
      toast.success('Project deleted successfully');
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
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="images">Images</TabsTrigger>
                      <TabsTrigger value="links">Links</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details">
                      <form className="space-y-4">
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
                                  {!categories.includes('Programming') && (
                                    <SelectItem key="Programming" value="Programming">Programming</SelectItem>
                                  )}
                                  {!categories.includes('Video Editing') && (
                                    <SelectItem key="Video Editing" value="Video Editing">Video Editing</SelectItem>
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
                              <Image className="mr-2 h-4 w-4" /> Main Image URL *
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
                        
                        <div className="space-y-2">
                          <label htmlFor="website_url" className="text-sm font-medium flex items-center">
                            <ExternalLink className="mr-2 h-4 w-4" /> Website URL (optional)
                          </label>
                          <Input
                            id="website_url"
                            name="website_url"
                            value={newProject.website_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com
