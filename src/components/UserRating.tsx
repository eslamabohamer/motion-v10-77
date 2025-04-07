import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addUserRating, deleteUserRating } from '@/utils/supabaseUtils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { StarRating } from '@/components/StarRating';
import { 
  User, 
  Upload, 
  Loader2, 
  Camera,
  Trash2,
  AlertCircle,
  Edit,
  MoreHorizontal
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserRatingProps {
  projectId: string;
}

export default function UserRating({ projectId }: UserRatingProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingRating, setEditingRating] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleRating = (newRating: number) => {
    setRating(newRating);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setUserProfile(data);
          }
          
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
            
          if (roleError) {
            console.error('Error checking admin status:', roleError);
          } else {
            setIsAdmin(roleData?.role === 'admin');
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_ratings')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        const ratingsWithProfiles = await Promise.all((data || []).map(async (rating) => {
          if (rating.user_id) {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('id', rating.user_id)
                .single();
                
              return {
                ...rating,
                profiles: profileData
              };
            } catch (err) {
              console.error('Error fetching profile for rating:', err);
              return rating;
            }
          }
          return rating;
        }));
        
        console.log('Fetched ratings:', ratingsWithProfiles);
        setUserRatings(ratingsWithProfiles || []);
      } catch (error) {
        console.error('Error fetching ratings:', error);
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchRatings();
    }
  }, [projectId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 5MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast.error('Unsupported file type. Please upload a JPEG, PNG, GIF, or WEBP image.');
      return;
    }

    setUploadingImage(true);
    
    try {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      const timestamp = new Date().getTime();
      const filePath = `anonymous/${timestamp}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('user-photos')
        .upload(filePath, file);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(filePath);
        
      setImagePreview(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editingRating) {
        const { data, error } = await supabase
          .from('user_ratings')
          .update({
            rating: rating,
            comment: comment,
            photo_url: imagePreview,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRating.id);
          
        if (error) throw error;
        
        toast.success('Your review has been updated!');
        
        const updatedRatings = userRatings.map(item => 
          item.id === editingRating.id 
            ? {
                ...item,
                rating: rating,
                comment: comment,
                photo_url: imagePreview,
                updated_at: new Date().toISOString()
              } 
            : item
        );
        
        setUserRatings(updatedRatings);
        setEditingRating(null);
        setEditDialogOpen(false);
      } else {
        const userId = userProfile?.id || null;
        const photoUrl = imagePreview;
        
        console.log('Submitting rating with data:', {
          project_id: projectId,
          rating,
          comment,
          user_id: userId,
          photo_url: photoUrl
        });
        
        const { success, error } = await addUserRating({
          project_id: projectId,
          rating: rating,
          comment: comment,
          user_id: userId,
          photo_url: photoUrl
        });
        
        if (error) {
          console.error('Error response:', error);
          throw error;
        }
        
        if (success) {
          toast.success('Thank you for your rating!');
        }
      }
      
      resetForm();
      
      const { data, error: refreshError } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (refreshError) {
        console.error('Error refreshing ratings:', refreshError);
      } else {
        const ratingsWithProfiles = await Promise.all((data || []).map(async (rating) => {
          if (rating.user_id) {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('id', rating.user_id)
                .single();
                
              return {
                ...rating,
                profiles: profileData
              };
            } catch (err) {
              console.error('Error fetching profile for rating:', err);
              return rating;
            }
          }
          return rating;
        }));
        
        setUserRatings(ratingsWithProfiles || []);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit your rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setImagePreview(null);
  };

  const handleDeleteRating = async (id: string) => {
    try {
      setRatingToDelete(null);
      const { error } = await deleteUserRating(id);
      
      if (error) {
        console.error('Error deleting rating:', error);
        toast.error('Failed to delete review');
        return;
      }
      
      toast.success('Review deleted successfully');
      
      setUserRatings(userRatings.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleEditRating = (item: any) => {
    setEditingRating(item);
    setRating(item.rating);
    setComment(item.comment);
    setImagePreview(item.photo_url);
    setEditDialogOpen(true);
  };

  const canUserDeleteRating = (rating: any) => {
    return (userProfile && rating.user_id === userProfile.id) || isAdmin;
  };

  const canUserEditRating = (rating: any) => {
    return userProfile && rating.user_id === userProfile.id;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const cancelEditing = () => {
    setEditingRating(null);
    resetForm();
    setEditDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-lg shadow-lg p-6 border border-border/30">
        <h3 className="text-xl font-semibold mb-6 text-primary">
          {editingRating && !editDialogOpen ? 'Edit Your Review' : 'Leave a Review'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80">Your Rating</label>
            <StarRating 
              value={rating} 
              onChange={handleRating} 
              readOnly={false} 
              size="large"
            />
          </div>
          
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2 text-foreground/80">
              Your Review
            </label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this project..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80">Add an Image (Optional)</label>
            <div className="flex items-center space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center space-x-2"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Choose Image</span>
                  </>
                )}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
              />
              {imagePreview && (
                <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-0 right-0 bg-black/70 p-1 rounded-bl-md"
                  >
                    <User className="h-3 w-3 text-white" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: JPEG, PNG, GIF, WEBP. Max size: 5MB.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={submitting}
              className="transition-all"
              variant="default"
            >
              {submitting ? 'Submitting...' : editingRating && !editDialogOpen ? 'Update Review' : 'Submit Review'}
            </Button>
            
            {editingRating && !editDialogOpen && (
              <Button 
                type="button"
                variant="outline"
                onClick={cancelEditing}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2">
          Reviews {userRatings.length > 0 && `(${userRatings.length})`}
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading reviews...</p>
          </div>
        ) : userRatings.length > 0 ? (
          <div className="space-y-6">
            {userRatings.map((item) => (
              <div key={item.id} className="bg-card/50 rounded-lg p-6 border border-border/20 transition-all hover:border-border/40">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 rounded-full border-2 border-primary/20">
                    {item.photo_url || (item.profiles?.avatar_url) ? (
                      <AvatarImage 
                        src={item.photo_url || (item.profiles?.avatar_url || '')} 
                        alt="User avatar" 
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">{item.profiles?.display_name || 'Anonymous User'}</p>
                        <div className="mt-1">
                          <StarRating
                            value={item.rating}
                            readOnly={true}
                            size="small"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                        <p className="text-sm text-muted-foreground">
                          {formatDate(item.created_at)}
                        </p>
                        
                        <div className="relative">
                          <div className="sm:hidden">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canUserEditRating(item) && (
                                  <DropdownMenuItem 
                                    onClick={() => handleEditRating(item)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                )}
                                {canUserDeleteRating(item) && (
                                  <DropdownMenuItem 
                                    onClick={() => setRatingToDelete(item.id)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="hidden sm:flex sm:space-x-2">
                            {canUserEditRating(item) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRating(item)}
                                className="h-8 px-2"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                            {canUserDeleteRating(item) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRatingToDelete(item.id)}
                                className="h-8 px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-foreground/80 leading-relaxed">{item.comment}</p>
                    
                    {item.photo_url && (
                      <div className="mt-4">
                        <a 
                          href={item.photo_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-block"
                        >
                          <img 
                            src={item.photo_url} 
                            alt="User uploaded" 
                            className="max-h-40 rounded-md border border-border/30 hover:border-primary/50 transition-all"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-muted/30 rounded-lg border border-border/20">
            <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Review</DialogTitle>
            <DialogDescription>
              Make changes to your review below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Your Rating</label>
              <StarRating 
                value={rating} 
                onChange={handleRating} 
                readOnly={false} 
                size="large"
              />
            </div>
            
            <div>
              <label htmlFor="edit-comment" className="block text-sm font-medium mb-2 text-foreground/80">
                Your Review
              </label>
              <Textarea
                id="edit-comment"
                placeholder="Share your thoughts about this project..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Image (Optional)</label>
              <div className="flex items-center space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center space-x-2"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      <span>Choose Image</span>
                    </>
                  )}
                </Button>
                {imagePreview && (
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-0 right-0 bg-black/70 p-1 rounded-bl-md"
                    >
                      <User className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!ratingToDelete} onOpenChange={(isOpen) => !isOpen && setRatingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => ratingToDelete && handleDeleteRating(ratingToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
