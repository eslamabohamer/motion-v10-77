import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Upload, Pencil, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase, getDefaultAvatar, getDisplayNameOrEmail, deleteUserRating } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserRatingProps {
  projectId?: string;
}

interface UserRatingData {
  id: string;
  project_id: string;
  user_id: string;
  rating: number;
  comment: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const UserRating = ({ projectId }: UserRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [existingRatings, setExistingRatings] = useState<UserRatingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeRating, setActiveRating] = useState<UserRatingData | null>(null);
  const [editedRating, setEditedRating] = useState(0);
  const [editedComment, setEditedComment] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsLoggedIn(true);
        setUser(data.session.user);
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRatings = async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching ratings:', error);
        return;
      }
      
      console.log('Fetched ratings:', data);
      
      if (data && data.length > 0) {
        const userIds = data.map(rating => rating.user_id).filter(Boolean);
        
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);
            
          if (!profilesError && profilesData) {
            const ratingsWithProfiles = data.map(rating => {
              const userProfile = profilesData.find(p => p.id === rating.user_id);
              return {
                ...rating,
                profiles: userProfile ? {
                  display_name: userProfile.display_name,
                  avatar_url: userProfile.avatar_url
                } : undefined
              };
            });
            
            setExistingRatings(ratingsWithProfiles as UserRatingData[]);
            return;
          }
        }
      }
      
      setExistingRatings(data as UserRatingData[]);
    } catch (error) {
      console.error('Error in fetchRatings:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      fetchRatings().finally(() => setIsLoading(false));
    }
  }, [projectId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setUserPhoto(null);
      setPhotoPreview(null);
      return;
    }
    
    const file = e.target.files[0];
    setUserPhoto(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      toast.error('Please log in to submit a rating.');
      return;
    }
    
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please add a comment.');
      return;
    }
    
    if (!projectId) {
      toast.error('Project ID is missing.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let photoUrl = null;
      
      if (userPhoto) {
        const fileName = `${user.id}-${Date.now()}-${userPhoto.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-photos')
          .upload(`${user.id}/${fileName}`, userPhoto);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload photo');
        }
        
        const { data: urlData } = supabase.storage
          .from('user-photos')
          .getPublicUrl(`${user.id}/${fileName}`);
          
        photoUrl = urlData.publicUrl;
      }
      
      const newRating = {
        project_id: projectId,
        user_id: user.id,
        rating,
        comment,
        photo_url: photoUrl
      };
      
      console.log('Submitting rating:', newRating);
      
      const { error } = await supabase
        .from('user_ratings')
        .insert(newRating);
      
      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      
      toast.success('Your rating has been submitted. Thank you!');
      setRating(0);
      setComment('');
      setUserPhoto(null);
      setPhotoPreview(null);
      
      await fetchRatings();
      
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast.error(`Failed to submit rating: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (rating: UserRatingData) => {
    setActiveRating(rating);
    setEditedRating(rating.rating);
    setEditedComment(rating.comment);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (rating: UserRatingData) => {
    setActiveRating(rating);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!activeRating) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_ratings')
        .update({
          rating: editedRating,
          comment: editedComment,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeRating.id);

      if (error) throw error;

      toast.success('Your review has been updated.');
      setEditDialogOpen(false);
      await fetchRatings();
    } catch (error: any) {
      console.error('Error updating rating:', error);
      toast.error(`Failed to update review: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeRating) return;

    setIsSubmitting(true);
    try {
      console.log('Starting delete operation for rating ID:', activeRating.id);
      
      const { success } = await deleteUserRating(activeRating.id);
      
      if (!success) {
        throw new Error('Failed to delete review');
      }
      
      setDeleteDialogOpen(false);
      toast.success('Your review has been deleted.');
      
      setExistingRatings(prevRatings => 
        prevRatings.filter(rating => rating.id !== activeRating.id)
      );
      
      await fetchRatings();
      
    } catch (error: any) {
      console.error('Error in handleConfirmDelete:', error);
      toast.error(`Failed to delete review: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const isUserRating = (rating: UserRatingData) => {
    return isLoggedIn && user && rating.user_id === user.id;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">User Reviews</h2>
      
      {isLoggedIn ? (
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
          
          <form onSubmit={handleRatingSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        (hoverRating || rating) >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="comment" className="block text-sm font-medium">Your Review</label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your thoughts about this work..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="photo" className="block text-sm font-medium">Upload a Photo (Optional)</label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setUserPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 h-5 w-5 flex items-center justify-center"
                    >
                      <span>×</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <label htmlFor="photo" className="cursor-pointer flex items-center gap-2 text-sm text-primary hover:text-primary/80">
                      <Upload className="h-4 w-4" />
                      Choose Photo
                    </label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                You can upload a photo of yourself or your work related to this review
              </p>
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </>
              ) : 'Submit Review'}
            </Button>
          </form>
        </div>
      ) : (
        <div className="bg-card p-6 rounded-lg shadow-sm text-center">
          <p className="mb-4">Please log in to leave a review.</p>
          <div className="flex justify-center space-x-4">
            <Button asChild className="bg-primary">
              <a href="/admin/login">Login</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/register">Register</a>
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">User Reviews ({existingRatings.length})</h3>
        
        {existingRatings.length === 0 ? (
          <p className="text-muted-foreground italic">No reviews yet. Be the first to leave a review!</p>
        ) : (
          existingRatings.map((review) => (
            <div key={review.id} className="bg-card p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={review.profiles?.avatar_url || getDefaultAvatar()} 
                      alt="User avatar" 
                    />
                    <AvatarFallback>
                      {getDisplayNameOrEmail(review.profiles)?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {getDisplayNameOrEmail(review.profiles)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                    {review.updated_at !== review.created_at && (
                      <p className="text-xs text-muted-foreground italic">(Edited)</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        review.rating >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <p className="mt-4">{review.comment}</p>
              
              {review.photo_url ? (
                <div className="mt-4">
                  <img 
                    src={review.photo_url} 
                    alt="User photo" 
                    className="max-h-48 rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="mt-4 p-4 border border-dashed rounded-lg flex items-center justify-center bg-muted/20">
                  <p className="text-sm text-muted-foreground">No image attached</p>
                </div>
              )}

              {isUserRating(review) && (
                <div className="mt-4 flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleEditClick(review)}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleDeleteClick(review)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Your Review</DialogTitle>
            <DialogDescription>
              Make changes to your review below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditedRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8",
                        editedRating >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="editComment" className="text-sm font-medium">Comment</label>
              <Textarea
                id="editComment"
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                rows={4}
                placeholder="Update your thoughts about this work..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isSubmitting || !editedComment.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserRating;
