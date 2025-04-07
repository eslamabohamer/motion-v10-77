import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    const fetchRatings = async () => {
      if (!projectId) return;
      
      try {
        const { data, error } = await supabase
          .from('user_ratings' as any)
          .select(`
            id, 
            rating, 
            comment, 
            created_at, 
            user_id,
            photo_url,
            profiles(display_name, avatar_url)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching ratings:', error);
          return;
        }
        
        setExistingRatings(data || []);
      } catch (error) {
        console.error('Error in fetchRatings:', error);
      }
    };
    
    fetchRatings();
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
    
    setIsSubmitting(true);
    
    try {
      let photoUrl = null;
      
      if (userPhoto) {
        const fileName = `${user.id}-${Date.now()}-${userPhoto.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-photos')
          .upload(fileName, userPhoto);
        
        if (uploadError) {
          throw new Error('Failed to upload photo');
        }
        
        const { data: urlData } = supabase.storage
          .from('user-photos')
          .getPublicUrl(fileName);
          
        photoUrl = urlData.publicUrl;
      }
      
      const { error } = await supabase
        .from('user_ratings' as any)
        .insert({
          project_id: projectId || 'general',
          user_id: user.id,
          rating,
          comment,
          photo_url: photoUrl
        });
      
      if (error) throw error;
      
      toast.success('Your rating has been submitted. Thank you!');
      setRating(0);
      setComment('');
      setUserPhoto(null);
      setPhotoPreview(null);
      
      try {
        const { data } = await supabase
          .from('user_ratings' as any)
          .select(`
            id, 
            rating, 
            comment, 
            created_at, 
            user_id,
            photo_url,
            profiles(display_name, avatar_url)
          `)
          .eq('project_id', projectId || 'general')
          .order('created_at', { ascending: false });
        
        setExistingRatings(data || []);
      } catch (error) {
        console.error('Error refreshing ratings:', error);
      }
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again.');
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
        <h3 className="text-xl font-semibold">User Reviews</h3>
        
        {existingRatings.length === 0 ? (
          <p className="text-muted-foreground italic">No reviews yet. Be the first to leave a review!</p>
        ) : (
          existingRatings.map((review) => (
            <div key={review.id} className="bg-card p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.profiles?.avatar_url || review.photo_url} />
                    <AvatarFallback>
                      {review.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.profiles?.display_name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
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
              
              {review.photo_url && (
                <div className="mt-4">
                  <img 
                    src={review.photo_url} 
                    alt="User photo" 
                    className="max-h-48 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserRating;
