
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRight, Film, Boxes, Sparkles, PenTool, Video } from 'lucide-react';

// Add framer-motion
<lov-add-dependency>framer-motion@^10.15.0</lov-add-dependency>

// Service data
const services = [
  {
    id: "motion-graphics",
    icon: <Film className="h-10 w-10" />,
    title: "Motion Graphics",
    description: "Eye-catching animated designs that communicate complex ideas with clarity and style, perfect for digital platforms and presentations.",
    features: [
      "2D animation and design",
      "Animated infographics",
      "Social media content",
      "Lower thirds and titles",
      "Interactive interfaces"
    ],
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "3d-animation",
    icon: <Boxes className="h-10 w-10" />,
    title: "3D Animation",
    description: "Immersive three-dimensional animations that add depth and realism to your visual storytelling across various applications.",
    features: [
      "Product visualizations",
      "Architectural visualization",
      "Character animation",
      "3D logo animations",
      "Environment design"
    ],
    color: "from-indigo-500 to-purple-600"
  },
  {
    id: "visual-effects",
    icon: <Sparkles className="h-10 w-10" />,
    title: "Visual Effects",
    description: "Seamless integration of digital elements with live-action footage to create stunning and impactful visual experiences.",
    features: [
      "Compositing",
      "Particle effects",
      "Color grading",
      "Green screen removal",
      "Motion tracking"
    ],
    color: "from-purple-500 to-pink-600"
  },
  {
    id: "motion-branding",
    icon: <PenTool className="h-10 w-10" />,
    title: "Motion Branding",
    description: "Dynamic brand identities that breathe life into logos and visual assets, creating a memorable brand presence.",
    features: [
      "Logo animations",
      "Brand style guides",
      "Broadcast packages",
      "App intro animations",
      "UI motion design"
    ],
    color: "from-pink-500 to-red-600"
  },
  {
    id: "explainer-videos",
    icon: <Video className="h-10 w-10" />,
    title: "Explainer Videos",
    description: "Clear and engaging animated videos that simplify complex concepts, products, or services for your audience.",
    features: [
      "Concept development",
      "Storyboarding",
      "Character design",
      "Script writing",
      "Voice-over coordination"
    ],
    color: "from-red-500 to-orange-600"
  }
];

export const ServicesSection = () => {
  const [activeTab, setActiveTab] = useState("motion-graphics");

  return (
    <section className="py-24 bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Services</h2>
          <p className="text-muted-foreground">
            Elevate your brand's visual communication with premium motion graphics services tailored to your unique needs.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-transparent h-auto mb-8">
            {services.map((service) => (
              <TabsTrigger
                key={service.id}
                value={service.id}
                className={cn(
                  "data-[state=active]:bg-muted data-[state=active]:shadow-md p-3 h-auto",
                  activeTab === service.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all",
                    activeTab === service.id 
                      ? `bg-gradient-to-r ${service.color} text-white` 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {service.icon}
                  </div>
                  <span className="text-sm font-medium">{service.title}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="border rounded-lg overflow-hidden bg-card">
            {services.map((service) => (
              <TabsContent key={service.id} value={service.id} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-gradient-to-r text-white",
                        service.color
                      )}>
                        {service.icon}
                      </div>
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {service.description}
                    </p>
                    <Button asChild>
                      <a href={`/services#${service.id}`}>
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">What's included:</h4>
                    <ul className="space-y-3">
                      {service.features.map((feature, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start"
                        >
                          <span className={cn(
                            "inline-block w-2 h-2 rounded-full mt-1.5 mr-3 bg-gradient-to-r",
                            service.color
                          )}></span>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
};
