import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getDisplayNameOrEmail, getDefaultAvatar, supabase, deleteUserRating } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
} from "@/components/ui/alert-dialog"

interface UserRatingProps {
  projectId: string;
  userId?: string | null | undefined;
  isOwner?: boolean;
}

interface Rating {
  id: string;
  comment: string;
  rating: number;
  created_at: string | null;
  photo_url: string | null;
  user_id: string | null;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const UserRating: React.FC<UserRatingProps> = ({ projectId, userId, isOwner }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('user_ratings')
          .select(`
            id,
            comment,
            rating,
            created_at,
            photo_url,
            user_id,
            profiles (display_name, avatar_url)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching ratings:", error);
          setError(error.message);
        } else {
          setRatings(data || []);
        }
      } catch (err: any) {
        console.error("Unexpected error fetching ratings:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [projectId]);

  const handleDeleteRating = async (id: string) => {
    try {
      await deleteUserRating(id);
      setRatings(ratings.filter(rating => rating.id !== id));
      toast.success("Rating deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting rating:", err);
      toast.error("Failed to delete rating.");
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading ratings...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div>
      {ratings.length > 0 ? (
        <ul className="space-y-4">
          {ratings.map((item) => {
            let displayName = '';
            if (item.profiles) {
              displayName = item.profiles?.display_name || getDisplayNameOrEmail(item.profiles);
            } else {
              displayName = "Anonymous";
            }
            const avatarUrl = item.profiles?.avatar_url || getDefaultAvatar();

            return (
              <li key={item.id} className="bg-card rounded-lg shadow-md p-4">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{displayName}</h3>
                      <div className="flex items-center">
                        <Star
                          className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1"
                        />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{item.comment}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      {item.created_at && (
                        new Date(item.created_at).toLocaleDateString()
                      )}
                    </div>
                    {(isOwner || item.user_id === userId) && (
                      <div className="mt-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this rating.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRating(item.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center">No ratings yet.</div>
      )}
    </div>
  );
};
