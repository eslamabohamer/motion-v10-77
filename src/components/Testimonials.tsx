
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  author: string;
  position: string;
  content: string;
  avatar_url: string | null;
  rating: number;
}

interface UserRating {
  id: string;
  user_id: string | null;
  project_id: string;
  rating: number;
  comment: string;
  photo_url: string | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayType, setDisplayType] = useState<'testimonials' | 'userRatings'>('testimonials');
  const [activeDisplayItems, setActiveDisplayItems] = useState<(Testimonial | UserRating)[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data: testimonialData, error: testimonialError } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at');
          
        if (testimonialError) {
          console.error('Error fetching testimonials:', testimonialError);
          return;
        }
        
        setTestimonials(testimonialData || []);
        
        // Fetch user ratings
        const { data: ratingData, error: ratingError } = await supabase
          .from('user_ratings')
          .select('*, profiles:user_id(display_name, avatar_url)');
          
        if (ratingError) {
          console.error('Error fetching user ratings:', ratingError);
          // If there's an error with the join query, try a simpler query
          const { data: simpleRatingData } = await supabase
            .from('user_ratings')
            .select('*')
            .order('rating', { ascending: false })
            .limit(10);
          
          // Use the data without profiles
          setUserRatings((simpleRatingData || []).map(rating => ({
            ...rating,
            profiles: null
          })));
        } else {
          // Cast the data to the expected type
          setUserRatings((ratingData || []) as unknown as UserRating[]);
        }
        
        // Set display items to testimonials by default
        setActiveDisplayItems(testimonialData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Handle switching between testimonials and user ratings
  useEffect(() => {
    setActiveIndex(0);
    setActiveDisplayItems(displayType === 'testimonials' ? testimonials : userRatings);
  }, [displayType, testimonials, userRatings]);

  const handlePrev = () => {
    setDirection('prev');
    setActiveIndex((prev) => (prev === 0 ? activeDisplayItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection('next');
    setActiveIndex((prev) => (prev === activeDisplayItems.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    // Auto-advance testimonials
    const interval = setInterval(() => {
      if (activeDisplayItems.length > 1) {
        handleNext();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [activeIndex, activeDisplayItems.length]);

  const toggleDisplayType = () => {
    setDisplayType(displayType === 'testimonials' ? 'userRatings' : 'testimonials');
  };

  // Render loading state
  if (isLoading) {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Client Testimonials</h2>
            <p className="text-muted-foreground">
              Hear what clients have to say about their experience working with me on their motion graphics projects.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="h-[300px] sm:h-[250px] md:h-[220px] bg-card rounded-lg animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  // Return null if no items to display
  if (testimonials.length === 0 && userRatings.length === 0) {
    return null;
  }

  // If we have no items of the current type but have items of the other type,
  // automatically switch to the other type
  if (
    (displayType === 'testimonials' && testimonials.length === 0 && userRatings.length > 0) ||
    (displayType === 'userRatings' && userRatings.length === 0 && testimonials.length > 0)
  ) {
    const newDisplayType = displayType === 'testimonials' ? 'userRatings' : 'testimonials';
    setDisplayType(newDisplayType);
    setActiveDisplayItems(newDisplayType === 'testimonials' ? testimonials : userRatings);
    return null; // Return null to prevent rendering with wrong data
  }

  // If we have no items at all, return null
  if (activeDisplayItems.length === 0) {
    return null;
  }

  // Render testimonials or user ratings
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {displayType === 'testimonials' ? 'Client Testimonials' : 'User Reviews'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {displayType === 'testimonials' 
              ? 'Hear what clients have to say about their experience working with me on their motion graphics projects.'
              : 'See what users are saying about our projects.'}
          </p>
          
          {testimonials.length > 0 && userRatings.length > 0 && (
            <Button 
              variant="outline" 
              onClick={toggleDisplayType} 
              className="mx-auto"
            >
              Show {displayType === 'testimonials' ? 'User Reviews' : 'Client Testimonials'}
            </Button>
          )}
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial/Rating Cards */}
          <div className="relative h-[300px] sm:h-[250px] md:h-[220px]">
            {activeDisplayItems.map((item, index) => {
              // Determine if this is a testimonial or user rating
              const isTestimonial = 'position' in item;
              
              // Get the appropriate fields based on item type
              const authorName = isTestimonial 
                ? (item as Testimonial).author 
                : (item as UserRating).profiles?.display_name || 'Anonymous User';
                
              const authorPosition = isTestimonial 
                ? (item as Testimonial).position 
                : `Project Review`;
                
              const content = isTestimonial 
                ? (item as Testimonial).content 
                : (item as UserRating).comment;
                
              const avatarUrl = isTestimonial 
                ? (item as Testimonial).avatar_url 
                : (item as UserRating).profiles?.avatar_url || (item as UserRating).photo_url;
                
              const rating = isTestimonial 
                ? (item as Testimonial).rating 
                : (item as UserRating).rating;
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    "absolute w-full rounded-lg bg-card p-6 shadow-md transition-all duration-500 ease-in-out",
                    activeIndex === index 
                      ? "opacity-100 translate-x-0 z-10" 
                      : index < activeIndex || (activeIndex === 0 && index === activeDisplayItems.length - 1)
                        ? "opacity-0 -translate-x-full z-0" 
                        : "opacity-0 translate-x-full z-0"
                  )}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <Avatar className="w-16 h-16 border-2 border-primary/20">
                        <AvatarImage src={avatarUrl || ''} alt={authorName} />
                        <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < rating ? "text-yellow-500" : "text-gray-300"
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Quote className="text-primary/20 h-10 w-10 mb-2" />
                      <p className="text-foreground mb-4 italic">{content}</p>
                      <div>
                        <h4 className="font-bold">{authorName}</h4>
                        <p className="text-sm text-muted-foreground">{authorPosition}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center mt-8 space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrev}
              className="rounded-full h-10 w-10"
              disabled={activeDisplayItems.length <= 1}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous</span>
            </Button>
            <div className="flex items-center space-x-1">
              {activeDisplayItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    activeIndex === index ? "bg-primary w-4" : "bg-primary/30"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNext}
              className="rounded-full h-10 w-10"
              disabled={activeDisplayItems.length <= 1}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
