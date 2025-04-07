
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addUserRating } from '@/utils/supabaseUtils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { StarRating } from '@/components/StarRating';
import { User } from 'lucide-react';

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

  // Handling rating change
  const handleRating = (newRating: number) => {
    setRating(newRating);
  };

  // Fetch the current user
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
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Fetch ratings for this project
  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_ratings')
          .select(`
            id,
            comment,
            rating,
            created_at,
            user_id,
            photo_url,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setUserRatings(data || []);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchRatings();
    }
  }, [projectId]);

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
      const userId = userProfile?.id || null;
      const photoUrl = userProfile?.avatar_url || null;
      
      const { success, error } = await addUserRating({
        project_id: projectId,
        rating: rating,
        comment: comment,
        user_id: userId,
        photo_url: photoUrl
      });
      
      if (error) {
        throw error;
      }
      
      if (success) {
        toast.success('Thank you for your rating!');
        setRating(0);
        setComment('');
        
        // Refresh ratings
        const { data, error: refreshError } = await supabase
          .from('user_ratings')
          .select(`
            id,
            comment,
            rating,
            created_at,
            user_id,
            photo_url,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (refreshError) {
          console.error('Error refreshing ratings:', refreshError);
        } else {
          setUserRatings(data || []);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit your rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-lg shadow-lg p-6 border border-border/30">
        <h3 className="text-xl font-semibold mb-6 text-primary">Leave a Review</h3>
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
          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full sm:w-auto transition-all"
            variant="default"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
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
              <div key={item.id} className="border-b pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 rounded-full border border-border/30">
                    {item.photo_url || item.profiles?.avatar_url ? (
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
                        <p className="font-medium">{item.profiles?.display_name || 'Anonymous User'}</p>
                        <div className="mt-1">
                          <StarRating
                            value={item.rating}
                            readOnly={true}
                            size="small"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 sm:mt-0">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    <p className="mt-3 text-foreground/80 leading-relaxed">{item.comment}</p>
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
    </div>
  );
}
