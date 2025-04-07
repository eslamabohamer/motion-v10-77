
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Pencil, Trash2, Plus, ArrowUpDown, Linkedin, Twitter, Instagram, Github, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Define the validation schema for team member form
const teamMemberSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  position: z.string().min(2, { message: "Position is required" }),
  bio: z.string().optional(),
  photo_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  linkedin: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  twitter: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  instagram: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  github: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  website: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
});

type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  social_links: Record<string, string>;
  display_order: number;
  is_active: boolean;
}

export function TeamManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      position: '',
      bio: '',
      photo_url: '',
      is_active: true,
      linkedin: '',
      twitter: '',
      instagram: '',
      github: '',
      website: '',
    },
  });

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const openAddDialog = () => {
    form.reset({
      name: '',
      position: '',
      bio: '',
      photo_url: '',
      is_active: true,
      linkedin: '',
      twitter: '',
      instagram: '',
      github: '',
      website: '',
    });
    setCurrentMember(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: TeamMember) => {
    const socialLinks = member.social_links || {};
    
    form.reset({
      name: member.name,
      position: member.position,
      bio: member.bio || '',
      photo_url: member.photo_url || '',
      is_active: member.is_active,
      linkedin: socialLinks.linkedin || '',
      twitter: socialLinks.twitter || '',
      instagram: socialLinks.instagram || '',
      github: socialLinks.github || '',
      website: socialLinks.website || '',
    });
    
    setCurrentMember(member);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: TeamMemberFormValues) => {
    try {
      // Extract social links
      const socialLinks: Record<string, string> = {};
      if (values.linkedin) socialLinks.linkedin = values.linkedin;
      if (values.twitter) socialLinks.twitter = values.twitter;
      if (values.instagram) socialLinks.instagram = values.instagram;
      if (values.github) socialLinks.github = values.github;
      if (values.website) socialLinks.website = values.website;

      const teamMemberData = {
        name: values.name,
        position: values.position,
        bio: values.bio || null,
        photo_url: values.photo_url || null,
        is_active: values.is_active,
        social_links: socialLinks,
      };

      if (currentMember) {
        // Update existing member
        const { error } = await supabase
          .from('team_members')
          .update(teamMemberData)
          .eq('id', currentMember.id);

        if (error) throw error;
        toast.success('Team member updated successfully');
      } else {
        // Add new member
        const maxOrderResult = await supabase
          .from('team_members')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1);

        const nextOrder = maxOrderResult.data && maxOrderResult.data.length > 0
          ? maxOrderResult.data[0].display_order + 1
          : 1;

        const { error } = await supabase
          .from('team_members')
          .insert([{ ...teamMemberData, display_order: nextOrder }]);

        if (error) throw error;
        toast.success('Team member added successfully');
      }

      setIsDialogOpen(false);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Failed to save team member');
    }
  };

  const deleteMember = async (id: string) => {
    if (confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast.success('Team member deleted successfully');
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
        toast.error('Failed to delete team member');
      }
    }
  };

  const moveOrder = async (memberId: string, currentOrder: number, direction: 'up' | 'down') => {
    try {
      const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
      
      // Find the member at the target position
      const targetMember = teamMembers.find(m => m.display_order === targetOrder);
      
      if (!targetMember) return;
      
      // Swap the positions
      const updates = [
        supabase
          .from('team_members')
          .update({ display_order: targetOrder })
          .eq('id', memberId),
        
        supabase
          .from('team_members')
          .update({ display_order: currentOrder })
          .eq('id', targetMember.id)
      ];
      
      await Promise.all(updates);
      
      toast.success('Team member order updated');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Team Members</CardTitle>
        <CardDescription>
          Manage your team information displayed on the website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Team Member
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead className="w-[80px]">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="w-[100px]">Active</TableHead>
                  <TableHead className="w-[100px]">Socials</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No team members found. Add your first team member.
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={member.display_order === 1}
                            onClick={() => moveOrder(member.id, member.display_order, 'up')}
                          >
                            <ArrowUpDown className="h-4 w-4 rotate-90" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={member.display_order === teamMembers.length}
                            onClick={() => moveOrder(member.id, member.display_order, 'down')}
                          >
                            <ArrowUpDown className="h-4 w-4 -rotate-90" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                          {member.photo_url ? (
                            <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>
                        <Switch 
                          checked={member.is_active} 
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {member.social_links?.linkedin && (
                            <Linkedin className="h-4 w-4 text-muted-foreground" />
                          )}
                          {member.social_links?.twitter && (
                            <Twitter className="h-4 w-4 text-muted-foreground" />
                          )}
                          {member.social_links?.instagram && (
                            <Instagram className="h-4 w-4 text-muted-foreground" />
                          )}
                          {member.social_links?.github && (
                            <Github className="h-4 w-4 text-muted-foreground" />
                          )}
                          {member.social_links?.website && (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMember(member.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentMember ? 'Edit' : 'Add'} Team Member</DialogTitle>
              <DialogDescription>
                {currentMember 
                  ? 'Update the details of your team member.' 
                  : 'Add a new member to your team.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position *</FormLabel>
                        <FormControl>
                          <Input placeholder="Creative Director" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="photo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/photo.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A short biography of the team member" 
                          className="resize-y min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Show this team member on the website
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Social Media Links</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted px-3 py-2 rounded-l-md">
                                <Linkedin className="h-4 w-4" />
                              </div>
                              <Input className="rounded-l-none" placeholder="https://linkedin.com/in/..." {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted px-3 py-2 rounded-l-md">
                                <Twitter className="h-4 w-4" />
                              </div>
                              <Input className="rounded-l-none" placeholder="https://twitter.com/..." {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted px-3 py-2 rounded-l-md">
                                <Instagram className="h-4 w-4" />
                              </div>
                              <Input className="rounded-l-none" placeholder="https://instagram.com/..." {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="github"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted px-3 py-2 rounded-l-md">
                                <Github className="h-4 w-4" />
                              </div>
                              <Input className="rounded-l-none" placeholder="https://github.com/..." {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted px-3 py-2 rounded-l-md">
                                <Globe className="h-4 w-4" />
                              </div>
                              <Input className="rounded-l-none" placeholder="https://..." {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
