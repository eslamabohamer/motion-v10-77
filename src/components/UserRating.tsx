
import React, { useState, useEffect } from 'react';
import { Rating } from 'react-simple-star-rating';
import { supabase } from '@/integrations/supabase/client';
import { addUserRating } from '@/utils/supabaseUtils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

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
  const handleRating = (rate: number) => {
    setRating(rate);
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

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <Rating
              onClick={handleRating}
              initialValue={rating}
              size={24}
              fillColor="#4a6cf7"
              emptyColor="#e2e8f0"
              className="mb-2"
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this project..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
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
                <div className="flex items-start">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={item.photo_url || (item.profiles?.avatar_url || '')} />
                    <AvatarFallback>
                      {item.profiles?.display_name ? item.profiles.display_name.charAt(0) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{item.profiles?.display_name || 'Anonymous User'}</p>
                        <div className="mt-1">
                          <Rating
                            initialValue={item.rating}
                            readonly
                            size={16}
                            fillColor="#4a6cf7"
                            emptyColor="#e2e8f0"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 sm:mt-0">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-2 text-muted-foreground">{item.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
