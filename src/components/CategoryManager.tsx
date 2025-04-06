
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  project_count?: number;
}

export const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      
      // First get all categories from projects table
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('category')
        .order('category');
        
      if (projectError) throw projectError;
      
      // Count projects by category
      const categoryCounts: Record<string, number> = {};
      projectData?.forEach((project) => {
        if (project.category) {
          categoryCounts[project.category] = (categoryCounts[project.category] || 0) + 1;
        }
      });
      
      // Create unique categories with counts
      const uniqueCategories = [...new Set(projectData?.map(project => project.category))]
        .filter(Boolean)
        .map((name) => ({
          id: name as string, // Using name as ID for now
          name: name as string,
          project_count: categoryCounts[name as string] || 0
        }));
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase())) {
      toast.error('This category already exists');
      return;
    }
    
    try {
      // Since categories are stored with projects, we'll create a placeholder project
      // that can be hidden or removed later if needed
      const { error } = await supabase
        .from('projects')
        .insert([{
          title: `${newCategory} - Category Placeholder`,
          description: `Placeholder for new category: ${newCategory}`,
          category: newCategory.trim(),
          image_url: 'https://placehold.co/600x400?text=Category+Placeholder',
          featured: false
        }]);
        
      if (error) throw error;
      
      toast.success('Category added successfully');
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };
  
  const startEditCategory = (category: Category) => {
    setEditingCategory({ ...category });
  };
  
  const cancelEdit = () => {
    setEditingCategory(null);
  };
  
  const saveEdit = async () => {
    if (!editingCategory) return;
    
    if (!editingCategory.name.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    // Check for duplicates
    if (categories.some(cat => 
      cat.id !== editingCategory.id && 
      cat.name.toLowerCase() === editingCategory.name.trim().toLowerCase()
    )) {
      toast.error('This category already exists');
      return;
    }
    
    try {
      // Update all projects with the old category to the new category
      const { error } = await supabase
        .from('projects')
        .update({ category: editingCategory.name.trim() })
        .eq('category', categories.find(c => c.id === editingCategory.id)?.name);
        
      if (error) throw error;
      
      toast.success('Category updated successfully');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };
  
  const handleDeleteCategory = async (category: Category) => {
    if (category.project_count && category.project_count > 0) {
      if (!window.confirm(`This category contains ${category.project_count} projects. These projects will not be deleted but will lose their category. Continue?`)) {
        return;
      }
    }
    
    try {
      // Update all projects in this category to have a "Uncategorized" category
      const { error } = await supabase
        .from('projects')
        .update({ category: 'Uncategorized' })
        .eq('category', category.name);
        
      if (error) throw error;
      
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Management</CardTitle>
        <CardDescription>Create, edit and manage project categories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-4 text-center">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading categories...</p>
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {categories.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No categories found.</p>
            ) : (
              categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-card rounded-md border shadow-sm"
                >
                  {editingCategory && editingCategory.id === category.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                        className="flex-1"
                      />
                      <Button size="sm" variant="ghost" onClick={saveEdit}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-medium">{category.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({category.project_count} projects)
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
