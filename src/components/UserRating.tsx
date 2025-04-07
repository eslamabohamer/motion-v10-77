
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StarRating } from '@/components/StarRating';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

// Define the Rating type
type RatingType = {
  id: string;
  comment: string;
  rating: number;
  created_at: string;
  photo_url: string | null;
  user_id: string | null;
  project_id: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface UserRatingProps {
  projectId: string;
}

const UserRating: React.FC<UserRatingProps> = ({ projectId }) => {
  const [ratings, setRatings] = useState<RatingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0); // initial rating value
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      if (data.user) {
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        setProfile(profileData);
      }
    };
    
    getUser();
    fetchRatings();
  }, [projectId]);

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*, profiles(*)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to ensure it matches the Rating type
      const formattedRatings = data.map(item => ({
        id: item.id,
        comment: item.comment,
        rating: item.rating,
        created_at: item.created_at,
        photo_url: item.photo_url || '',
        user_id: item.user_id,
        project_id: item.project_id,
        profiles: item.profiles || {
          display_name: 'Anonymous User',
          avatar_url: ''
        }
      }));

      setRatings(formattedRatings);
    } catch (error: any) {
      console.error('Error fetching ratings:', error.message);
      toast({
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (!user) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: 'You must be logged in to submit a rating.',
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_ratings')
        .insert([
          {
            comment: comment,
            rating: rating,
            user_id: user.id,
            photo_url: profile?.avatar_url || '',
            project_id: projectId
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      setComment('');
      setRating(0);
      fetchRatings();
      toast({
        title: "Success!",
        description: "Your rating has been submitted.",
      });
    } catch (error: any) {
      console.error('Error submitting rating:', error.message);
      toast({
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">User Ratings</h1>

      {/* Rating Form */}
      <Card className="w-full max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle>Submit Your Rating</CardTitle>
          <CardDescription>Share your thoughts with others.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="rating">Rating:</label>
            <StarRating
              value={rating}
              onChange={handleRating}
              readOnly={false}
              size="medium"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="comment">Comment</label>
            <Textarea
              id="comment"
              placeholder="Write your comment here"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={submitRating} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </CardFooter>
      </Card>

      {/* Display Ratings */}
      <div className="grid gap-4">
        {ratings.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.profiles?.display_name || 'Anonymous User'}</CardTitle>
              <CardDescription>
                <StarRating
                  value={item.rating}
                  readOnly
                  size="small"
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{item.comment}</p>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString()}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserRating;
