
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Briefcase, MapPin, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const About = () => {
  const [aboutInfo, setAboutInfo] = useState({
    ownerName: "Muhammad Ali",
    ownerTitle: "Motion Graphics Artist & 3D Animator",
    ownerBio: "I'm a passionate motion graphics artist with over 8 years of experience creating stunning visual animations for brands worldwide. My work focuses on bringing ideas to life through creative storytelling and cutting-edge animation techniques.",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&auto=format&fit=crop",
    ownerSkills: "Motion Graphics, 3D Animation, Visual Effects, After Effects, Cinema 4D, Blender",
    ownerLocation: "Cairo, Egypt",
  });

  useEffect(() => {
    // Load about info from localStorage
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.about) {
          setAboutInfo({
            ownerName: settings.about.ownerName || "Muhammad Ali",
            ownerTitle: settings.about.ownerTitle || "Motion Graphics Artist & 3D Animator",
            ownerBio: settings.about.ownerBio || "I'm a passionate motion graphics artist with over 8 years of experience creating stunning visual animations for brands worldwide.",
            ownerPhotoUrl: settings.about.ownerPhotoUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&auto=format&fit=crop",
            ownerSkills: settings.about.ownerSkills || "Motion Graphics, 3D Animation, Visual Effects",
            ownerLocation: settings.about.ownerLocation || "Cairo, Egypt",
          });
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  // Split skills into array
  const skills = aboutInfo.ownerSkills.split(',').map(skill => skill.trim());

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
                      src={aboutInfo.ownerPhotoUrl} 
                      alt={aboutInfo.ownerName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl font-bold">
                      {aboutInfo.ownerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center mt-4">
                    <h3 className="text-2xl font-bold">{aboutInfo.ownerName}</h3>
                    <p className="text-muted-foreground">{aboutInfo.ownerTitle}</p>
                    
                    <div className="flex items-center justify-center mt-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{aboutInfo.ownerLocation}</span>
                    </div>
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
                        {aboutInfo.ownerBio}
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
                              I work closely with clients to understand their vision and deliver results that exceed expectations.
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
                              Every project receives my full attention to detail, ensuring premium quality results.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
