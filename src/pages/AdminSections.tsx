import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ColorPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchSiteSections, 
  updateSiteSection,
  addSiteSection,
  deleteSiteSection,
  updateSiteSectionOrder
} from '@/utils/supabaseUtils';
import { Film, Code, Video, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SiteSection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const defaultSection: Omit<SiteSection, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  slug: '',
  description: '',
  icon: 'Film',
  color: 'from-purple-500 to-purple-700',
  is_active: true,
  display_order: 0
};

const AdminSections = () => {
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<Partial<SiteSection> | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await fetchSiteSections();

      if (error) {
        throw error;
      }

      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingSection(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setEditingSection(prev => ({ ...prev, is_active: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditingSection(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: string) => {
    setEditingSection(prev => ({ ...prev, color }));
  };

  const handleSlugify = () => {
    if (editingSection?.name) {
      const slug = editingSection.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      setEditingSection(prev => ({ ...prev, slug }));
    }
  };

  const addNewSection = () => {
    setEditingSection({ ...defaultSection, display_order: sections.length });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const editSection = (section: SiteSection) => {
    setEditingSection(section);
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const saveSection = async () => {
    try {
      if (!editingSection?.name || !editingSection?.slug) {
        toast.error('Name and slug are required');
        return;
      }

      if (isEditing && editingSection.id) {
        const { error } = await updateSiteSection(editingSection.id, {
          name: editingSection.name,
          slug: editingSection.slug,
          description: editingSection.description,
          icon: editingSection.icon,
          color: editingSection.color,
          is_active: editingSection.is_active,
          display_order: editingSection.display_order,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;
        toast.success('Section updated successfully');
      } else {
        const { error } = await addSiteSection({
          name: editingSection.name,
          slug: editingSection.slug,
          description: editingSection.description,
          icon: editingSection.icon,
          color: editingSection.color,
          is_active: editingSection.is_active,
          display_order: editingSection.display_order
        });

        if (error) throw error;
        toast.success('Section added successfully');
      }

      setIsDrawerOpen(false);
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Failed to save section');
    }
  };

  const deleteSection = async (id: string) => {
    try {
      // Check if there are any projects associated with this section
      const { data: relatedProjects, error: checkError } = await supabase
        .from('project_sections')
        .select('*')
        .eq('section_id', id);

      if (checkError) throw checkError;

      if (relatedProjects && relatedProjects.length > 0) {
        const confirmDelete = confirm(`This section has ${relatedProjects.length} projects associated with it. Deleting it will remove these associations. Are you sure you want to continue?`);
        if (!confirmDelete) return;
      }

      const { error } = await deleteSiteSection(id);

      if (error) throw error;

      toast.success('Section deleted successfully');
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  };

  const moveSection = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = sections.findIndex(section => section.id === id);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (targetIndex < 0 || targetIndex >= sections.length) return;

      const currentSection = sections[currentIndex];
      const targetSection = sections[targetIndex];

      // Swap display orders
      await updateSiteSectionOrder(
        currentSection.id,
        targetSection.display_order,
        targetSection.id,
        currentSection.display_order
      );

      toast.success('Section order updated');
      fetchSections();
    } catch (error) {
      console.error('Error moving section:', error);
      toast.error('Failed to update section order');
    }
  };

  const renderIconComponent = (iconName: string | null) => {
    switch (iconName) {
      case 'Film':
        return <Film className="h-5 w-5" />;
      case 'Code':
        return <Code className="h-5 w-5" />;
      case 'Video':
        return <Video className="h-5 w-5" />;
      default:
        return <Film className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Site Sections</h1>
            <p className="text-muted-foreground">Manage the different sections of your website</p>
          </div>
          <Button onClick={addNewSection}>
            <Plus className="mr-2 h-4 w-4" /> Add New Section
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Sections</CardTitle>
            <CardDescription>
              These sections allow you to categorize your projects and organize your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No sections found</p>
                <Button variant="outline" onClick={addNewSection}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Section
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveSection(section.id, 'up')}
                            disabled={section.display_order === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <span>{section.display_order + 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveSection(section.id, 'down')}
                            disabled={section.display_order === sections.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{section.name}</TableCell>
                      <TableCell>{section.slug}</TableCell>
                      <TableCell>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${section.color} text-white`}>
                          {renderIconComponent(section.icon)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${section.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {section.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => editSection(section)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this section?')) {
                                deleteSection(section.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle>{isEditing ? 'Edit Section' : 'Add New Section'}</DrawerTitle>
            <DrawerDescription>
              {isEditing 
                ? 'Update the details of this section' 
                : 'Create a new section for your website'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  name="name"
                  value={editingSection?.name || ''}
                  onChange={handleInputChange}
                  onBlur={handleSlugify}
                  placeholder="e.g. Programming Projects"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <Input
                  name="slug"
                  value={editingSection?.slug || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. programming-projects"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be used in URLs, e.g. /portfolio/programming-projects
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  name="description"
                  value={editingSection?.description || ''}
                  onChange={handleInputChange}
                  placeholder="Describe this section..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Icon</label>
                  <Select
                    value={editingSection?.icon || 'Film'}
                    onValueChange={(value) => handleSelectChange('icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Film">Film</SelectItem>
                      <SelectItem value="Code">Code</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <div className="flex space-x-2 items-center">
                    <ColorPicker
                      value={editingSection?.color || 'from-purple-500 to-purple-700'}
                      onChange={handleColorChange}
                    />
                    <Select
                      value={editingSection?.color || 'from-purple-500 to-purple-700'}
                      onValueChange={(value) => handleSelectChange('color', value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Choose a gradient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="from-purple-500 to-purple-700">Purple</SelectItem>
                        <SelectItem value="from-blue-500 to-blue-700">Blue</SelectItem>
                        <SelectItem value="from-green-500 to-green-700">Green</SelectItem>
                        <SelectItem value="from-red-500 to-red-700">Red</SelectItem>
                        <SelectItem value="from-yellow-500 to-yellow-700">Yellow</SelectItem>
                        <SelectItem value="from-pink-500 to-pink-700">Pink</SelectItem>
                        <SelectItem value="from-indigo-500 to-indigo-700">Indigo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingSection?.is_active ?? true}
                  onCheckedChange={handleSwitchChange}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>
          </div>
          <DrawerFooter className="border-t">
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={saveSection}>
                <Save className="mr-2 h-4 w-4" /> {isEditing ? 'Update Section' : 'Add Section'}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AdminSections;
