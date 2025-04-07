import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRight, Film, Boxes, Sparkles, PenTool, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceFeature {
  id: string;
  service_id: string;
  feature: string;
}

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  features: ServiceFeature[];
}

export const ServicesSection = () => {
  const [activeTab, setActiveTab] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('title');
          
        if (servicesError) {
          console.error('Error fetching services:', servicesError);
          return;
        }
        
        const { data: featuresData, error: featuresError } = await supabase
          .from('service_features')
          .select('*');
          
        if (featuresError) {
          console.error('Error fetching service features:', featuresError);
          return;
        }
        
        const servicesWithFeatures = servicesData.map(service => ({
          ...service,
          features: featuresData.filter(feature => feature.service_id === service.id)
        }));
        
        setServices(servicesWithFeatures);
        
        if (servicesWithFeatures.length > 0) {
          setActiveTab(servicesWithFeatures[0].slug);
        }
      } catch (error) {
        console.error('Error fetching services data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Film':
        return <Film className="h-10 w-10" />;
      case 'Boxes':
        return <Boxes className="h-10 w-10" />;
      case 'Sparkles':
        return <Sparkles className="h-10 w-10" />;
      case 'PenTool':
        return <PenTool className="h-10 w-10" />;
      case 'Video':
        return <Video className="h-10 w-10" />;
      default:
        return <Film className="h-10 w-10" />;
    }
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Services</h2>
            <p className="text-muted-foreground">
              Elevate your brand's visual communication with premium motion graphics services tailored to your unique needs.
            </p>
          </div>
          
          <div className="animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-80 bg-muted rounded"></div>
          </div>
        </div>
      </section>
    );
  }

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
                value={service.slug}
                className={cn(
                  "data-[state=active]:bg-muted data-[state=active]:shadow-md p-3 h-auto",
                  activeTab === service.slug ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all",
                    activeTab === service.slug 
                      ? `bg-gradient-to-r ${service.color} text-white` 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {getIconComponent(service.icon)}
                  </div>
                  <span className="text-sm font-medium">{service.title}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="border rounded-lg overflow-hidden bg-card">
            {services.map((service) => (
              <TabsContent key={service.id} value={service.slug} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-gradient-to-r text-white",
                        service.color
                      )}>
                        {getIconComponent(service.icon)}
                      </div>
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {service.description}
                    </p>
                    <Button asChild>
                      <a href={`/services#${service.slug}`}>
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">What's included:</h4>
                    <ul className="space-y-3">
                      {service.features.map((feature, index) => (
                        <motion.li 
                          key={feature.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start"
                        >
                          <span className={cn(
                            "inline-block w-2 h-2 rounded-full mt-1.5 mr-3 bg-gradient-to-r",
                            service.color
                          )}></span>
                          <span>{feature.feature}</span>
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

export const Services = ServicesSection;
export default ServicesSection;
