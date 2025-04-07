
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowUpDown, Plus, Trash, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyLogo {
  id: string;
  name: string;
  logo_url: string;
  website?: string;
  display_order: number;
}

export const CompanyLogoManager = () => {
  const [logos, setLogos] = useState<CompanyLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newLogo, setNewLogo] = useState<Omit<CompanyLogo, 'id'>>({
    name: '',
    logo_url: '',
    website: '',
    display_order: 0
  });

  const fetchLogos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('company_logos')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setLogos(data || []);
    } catch (error) {
      console.error('Error fetching company logos:', error);
      toast.error('Failed to load company logos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const handleAddLogo = async () => {
    try {
      if (!newLogo.name || !newLogo.logo_url) {
        toast.error('Company name and logo URL are required');
        return;
      }

      // Set the display order to be after the last logo
      const displayOrder = logos.length > 0 
        ? Math.max(...logos.map(logo => logo.display_order)) + 1 
        : 1;

      const { data, error } = await supabase
        .from('company_logos')
        .insert([{ 
          ...newLogo, 
          display_order: displayOrder 
        }]);

      if (error) {
        throw error;
      }

      toast.success('Company logo added successfully');
      setNewLogo({
        name: '',
        logo_url: '',
        website: '',
        display_order: 0
      });
      fetchLogos();
    } catch (error) {
      console.error('Error adding company logo:', error);
      toast.error('Failed to add company logo');
    }
  };

  const handleUpdateLogo = async (id: string, updatedData: Partial<CompanyLogo>) => {
    try {
      const { error } = await supabase
        .from('company_logos')
        .update(updatedData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Company logo updated');
      fetchLogos();
    } catch (error) {
      console.error('Error updating company logo:', error);
      toast.error('Failed to update company logo');
    }
  };

  const handleDeleteLogo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('company_logos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Company logo deleted');
      fetchLogos();
    } catch (error) {
      console.error('Error deleting company logo:', error);
      toast.error('Failed to delete company logo');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    try {
      const currentLogo = logos[index];
      const previousLogo = logos[index - 1];
      
      // Swap display orders
      await Promise.all([
        handleUpdateLogo(currentLogo.id, { display_order: previousLogo.display_order }),
        handleUpdateLogo(previousLogo.id, { display_order: currentLogo.display_order })
      ]);
    } catch (error) {
      console.error('Error reordering logos:', error);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === logos.length - 1) return;
    try {
      const currentLogo = logos[index];
      const nextLogo = logos[index + 1];
      
      // Swap display orders
      await Promise.all([
        handleUpdateLogo(currentLogo.id, { display_order: nextLogo.display_order }),
        handleUpdateLogo(nextLogo.id, { display_order: currentLogo.display_order })
      ]);
    } catch (error) {
      console.error('Error reordering logos:', error);
    }
  };

  const handleChange = (
    logo: CompanyLogo,
    field: keyof CompanyLogo,
    value: string | number
  ) => {
    const updatedLogos = logos.map(l => {
      if (l.id === logo.id) {
        return { ...l, [field]: value };
      }
      return l;
    });
    setLogos(updatedLogos);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Company Logo</CardTitle>
          <CardDescription>
            Add a company logo that will be displayed on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Company Name *</label>
              <Input
                id="name"
                value={newLogo.name}
                onChange={e => setNewLogo({...newLogo, name: e.target.value})}
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="logo_url" className="text-sm font-medium">Logo URL *</label>
              <Input
                id="logo_url"
                value={newLogo.logo_url}
                onChange={e => setNewLogo({...newLogo, logo_url: e.target.value})}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-medium">Website URL (Optional)</label>
            <Input
              id="website"
              value={newLogo.website}
              onChange={e => setNewLogo({...newLogo, website: e.target.value})}
              placeholder="https://example.com"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddLogo} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Company Logo
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Company Logos</CardTitle>
          <CardDescription>
            Edit, reorder or remove company logos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : logos.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No company logos added yet.</p>
          ) : (
            <div className="space-y-4">
              {logos.map((logo, index) => (
                <Card key={logo.id} className="relative overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                          {logo.logo_url && (
                            <img 
                              src={logo.logo_url} 
                              alt={logo.name} 
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          )}
                        </div>
                        <div className="space-y-2 flex-1">
                          <Input
                            value={logo.name}
                            onChange={e => handleChange(logo, 'name', e.target.value)}
                            placeholder="Company Name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={logo.logo_url}
                          onChange={e => handleChange(logo, 'logo_url', e.target.value)}
                          placeholder="Logo URL"
                        />
                        <Input
                          value={logo.website || ''}
                          onChange={e => handleChange(logo, 'website', e.target.value)}
                          placeholder="Website URL (optional)"
                        />
                      </div>
                      <div className="flex items-center space-x-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                        >
                          <ArrowUpDown className="h-4 w-4 rotate-90" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === logos.length - 1}
                        >
                          <ArrowUpDown className="h-4 w-4 -rotate-90" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateLogo(logo.id, {
                            name: logo.name,
                            logo_url: logo.logo_url,
                            website: logo.website || null
                          })}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteLogo(logo.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
