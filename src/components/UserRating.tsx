import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating } from '@/components/StarRating';
import { supabase, getDefaultAvatar, getDisplayNameOrEmail, deleteUserRating } from '@/integrations/supabase/client';
import { addUserRating } from '@/utils/supabaseUtils';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Trash2, AlertTriangle, ThumbsUp, MessageSquare, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface UserRatingProps {
  projectId?: string;
  showTitle?: boolean;
  maxHeight?: string;
  className?: string;
}

interface Rating {
  id: string;
  user_id: string | null;
  project_id: string;
  rating: number;
  comment: string;
  photo_url: string | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

export const UserRating = ({ projectId, showTitle = true, maxHeight, className = '' }: UserRatingProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
    };
    
    checkAuth();
    fetchRatings();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [projectId]);

  const fetchRatings = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_ratings')
        .select(`
          *,
          profiles:user_id (
            display_name,
            email,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setRatings(data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addRating = async () => {
    if (!projectId) {
      toast.error('Missing project ID');
      return;
    }
    
    if (!comment || rating === 0) {
      toast.error('Please provide both a rating and a comment');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Use the new utility function that returns a success property
      const { error, success } = await addUserRating({
        project_id: projectId,
        rating,
        comment,
        user_id: user?.id || null,
        photo_url: user?.user_metadata?.avatar_url || null
      });
      
      if (error) {
        throw error;
      }
      
      if (success) {
        setComment('');
        setRating(0);
        setShowForm(false);
        fetchRatings();
        toast.success('Your review has been added');
      }
    } catch (error) {
      console.error('Error adding rating:', error);
      toast.error('Failed to add your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      const { error } = await deleteUserRating(id);
      
      if (error) {
        throw error;
      }
      
      setRatings(ratings.filter(r => r.id !== id));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error('Failed to delete review');
    }
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const filteredRatings = activeTab === 'all' 
    ? ratings 
    : ratings.filter(r => {
        if (activeTab === '5') return r.rating === 5;
        if (activeTab === '4') return r.rating === 4;
        if (activeTab === '3') return r.rating === 3;
        if (activeTab === '2') return r.rating === 2;
        if (activeTab === '1') return r.rating === 1;
        return true;
      });

  const getRatingCounts = () => {
    const counts = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    ratings.forEach(r => {
      counts[r.rating as keyof typeof counts]++;
    });
    return counts;
  };

  const ratingCounts = getRatingCounts();

  return (
    <div className={`w-full ${className}`}>
      {showTitle && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">User Reviews</h2>
            <p className="text-muted-foreground">
              {ratings.length > 0 
                ? `${ratings.length} ${ratings.length === 1 ? 'review' : 'reviews'} with an average rating of ${getAverageRating()}/5`
                : 'No reviews yet. Be the first to leave a review!'}
            </p>
          </div>
          {!showForm && (
            <Button 
              onClick={() => {
                if (!user) {
                  toast.error('Please sign in to leave a review');
                  return;
                }
                setShowForm(true);
                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} 
              className="mt-4 md:mt-0"
            >
              Write a Review
            </Button>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>Share your thoughts about this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <StarRating 
                      value={rating} 
                      onChange={setRating} 
                      size={24} 
                      interactive 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Review</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you think about this project?"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  setShowForm(false);
                  setRating(0);
                  setComment('');
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={addRating} 
                  disabled={isSubmitting || rating === 0 || !comment.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {ratings.length > 0 && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Reviews ({ratings.length})</TabsTrigger>
            <TabsTrigger value="5">5 Star ({ratingCounts['5']})</TabsTrigger>
            <TabsTrigger value="4">4 Star ({ratingCounts['4']})</TabsTrigger>
            <TabsTrigger value="3">3 Star ({ratingCounts['3']})</TabsTrigger>
            <TabsTrigger value="2">2 Star ({ratingCounts['2']})</TabsTrigger>
            <TabsTrigger value="1">1 Star ({ratingCounts['1']})</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-0">
            <div 
              className={`space-y-4 ${maxHeight ? `max-h-[${maxHeight}] overflow-y-auto pr-2` : ''}`}
              style={maxHeight ? { maxHeight, overflowY: 'auto' } : {}}
            >
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredRatings.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-muted/30">
                  <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No reviews found with this rating</p>
                </div>
              ) : (
                filteredRatings.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage 
                                src={item.photo_url || item.profiles?.avatar_url || getDefaultAvatar()} 
                                alt="User avatar" 
                              />
                              <AvatarFallback>
                                {getDisplayNameOrEmail(item.profiles)?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {getDisplayNameOrEmail(item.profiles)}
                              </CardTitle>
                              <div className="flex items-center mt-1">
                                <StarRating value={item.rating} size={16} />
                                <span className="text-xs text-muted-foreground ml-2">
                                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {user?.id === item.user_id && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-line">{item.comment}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {ratings.length === 0 && !isLoading && !showForm && (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share your thoughts about this project!
            </p>
            <Button 
              onClick={() => {
                if (!user) {
                  toast.error('Please sign in to leave a review');
                  return;
                }
                setShowForm(true);
              }}
            >
              <Star className="mr-2 h-4 w-4" /> Write a Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
