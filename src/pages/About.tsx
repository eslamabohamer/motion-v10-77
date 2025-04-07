
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Briefcase, MapPin, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface AboutMeData {
  owner_name: string;
  owner_title: string;
  owner_bio: string;
  owner_photo_url: string | null;
  owner_skills: string;
  owner_location: string | null;
  client_focused_text: string | null;
  quality_first_text: string | null;
}

const About = () => {
  const [loading, setLoading] = useState(true);
  const [aboutInfo, setAboutInfo] = useState<AboutMeData>({
    owner_name: "",
    owner_title: "",
    owner_bio: "",
    owner_photo_url: "",
    owner_skills: "",
    owner_location: "",
    client_focused_text: "",
    quality_first_text: ""
  });

  // Load the data from the database
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('about_me')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.error('Error fetching about data:', error);
          throw error;
        }
        
        if (data) {
          setAboutInfo({
            owner_name: data.owner_name,
            owner_title: data.owner_title,
            owner_bio: data.owner_bio,
            owner_photo_url: data.owner_photo_url,
            owner_skills: data.owner_skills,
            owner_location: data.owner_location,
            client_focused_text: data.client_focused_text,
            quality_first_text: data.quality_first_text
          });
          console.log('Loaded about data from database:', data);
        }
      } catch (error) {
        console.error('Error in fetchAboutData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAboutData();
  }, []);

  // Split skills into array
  const skills = aboutInfo.owner_skills?.split(',').map(skill => skill.trim()) || [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-2">About Me</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] mb-8"></div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {/* Profile Image */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="col-span-1"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-48 h-48 border-4 border-[#4a6cf7]/20">
                      <AvatarImage 
                        src={aboutInfo.owner_photo_url || ''} 
                        alt={aboutInfo.owner_name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-4xl font-bold">
                        {aboutInfo.owner_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="text-center mt-4">
                      <h3 className="text-2xl font-bold">{aboutInfo.owner_name}</h3>
                      <p className="text-muted-foreground">{aboutInfo.owner_title}</p>
                      
                      {aboutInfo.owner_location && (
                        <div className="flex items-center justify-center mt-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{aboutInfo.owner_location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                
                {/* Bio */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="col-span-2"
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Bio</h2>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-muted-foreground leading-relaxed">
                          {aboutInfo.owner_bio}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold mb-4">My Approach</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-muted/40 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="mr-3 bg-primary/10 p-2 rounded">
                              <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Client-Focused</h3>
                              <p className="text-sm text-muted-foreground">
                                {aboutInfo.client_focused_text || 'I work closely with clients to understand their vision and deliver results that exceed expectations.'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-muted/40 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="mr-3 bg-primary/10 p-2 rounded">
                              <Award className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Quality First</h3>
                              <p className="text-sm text-muted-foreground">
                                {aboutInfo.quality_first_text || 'Every project receives my full attention to detail, ensuring premium quality results.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
