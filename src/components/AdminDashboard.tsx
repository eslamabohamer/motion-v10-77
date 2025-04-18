
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3, MessageSquare, Settings, Tag, Users, Layers, Users2 } from "lucide-react";
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface DashboardProps {
  children?: React.ReactNode;
}

export const AdminDashboard = ({ children }: DashboardProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(() => {
    const path = window.location.pathname;
    if (path.includes('/admin/projects')) return 'projects';
    if (path.includes('/admin/messages')) return 'messages';
    if (path.includes('/admin/categories')) return 'categories';
    if (path.includes('/admin/sections')) return 'sections';
    if (path.includes('/admin/team')) return 'team';
    if (path.includes('/admin/settings')) return 'settings';
    if (path.includes('/admin/users')) return 'users';
    return 'projects';
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handlePageChange = (tab: string) => {
    setActiveTab(tab);
  };

  const refreshSiteSettings = async () => {
    try {
      // Fetch settings from various tables
      const [
        { data: generalData, error: generalError },
        { data: performanceData, error: performanceError },
        { data: animationData, error: animationError },
        { data: seoData, error: seoError },
        { data: socialData, error: socialError }
      ] = await Promise.all([
        supabase.from('general_settings').select('*').limit(1),
        supabase.from('performance_settings').select('*').limit(1),
        supabase.from('animation_settings').select('*').limit(1),
        supabase.from('seo_settings').select('*').limit(1),
        supabase.from('social_settings').select('*').limit(1)
      ]);
      
      if (generalError || performanceError || animationError || seoError || socialError) {
        throw new Error('Error fetching settings');
      }
      
      // Create a combined settings object
      const settings = {
        general: generalData?.[0] || {},
        performance: performanceData?.[0] || {},
        animation: animationData?.[0] || {},
        seo: seoData?.[0] || {},
        social: socialData?.[0] || {}
      };
      
      localStorage.setItem('siteSettings', JSON.stringify(settings));
      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-sm">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-2 flex items-center space-x-2" target="_blank">
              <span className="text-sm font-bold">Motion Graphics</span>
            </Link>
            <span className="text-sm text-muted-foreground">Admin</span>
          </div>
          <div className="flex flex-1 items-center space-x-4 justify-end">
            <Button variant="ghost" size="sm" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                View Site
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="lg:block">
            <Card className="sticky top-20">
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Admin Dashboard</CardTitle>
                <CardDescription>Manage your site content</CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <nav className="flex flex-col space-y-1">
                  <Button 
                    variant={activeTab === 'projects' ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link to="/admin/projects" onClick={() => handlePageChange('projects')}>
                      <Grid3X3 className="mr-2 h-4 w-4" />
                      Projects
                    </Link>
                  </Button>
                  <Button 
                    variant={activeTab === 'sections' ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link to="/admin/sections" onClick={() => handlePageChange('sections')}>
                      <Layers className="mr-2 h-4 w-4" />
                      Sections
                    </Link>
                  </Button>
                  <Button 
                    variant={activeTab === 'categories' ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link to="/admin/categories" onClick={() => handlePageChange('categories')}>
                      <Tag className="mr-2 h-4 w-4" />
                      Categories
                    </Link>
                  </Button>
                  <Button 
                    variant={activeTab === 'team' ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link to="/admin/team" onClick={() => handlePageChange('team')}>
                      <Users2 className="mr-2 h-4 w-4" />
                      Team
                    </Link>
                  </Button>
                  <Button 
                    variant={activeTab === 'messages' ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link to="/admin/messages" onClick={() => handlePageChange('messages')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </Button>
                  <Button 
                    variant={activeTab === 'users' ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link to="/admin/users" onClick={() => handlePageChange('users')}>
                      <Users className="mr-2 h-4 w-4" />
                      Users
                    </Link>
                  </Button>
                  <Button 
                    variant={activeTab === 'settings' ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link to="/admin/settings" onClick={() => handlePageChange('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>
          <main>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-hidden"
            >
              {children || <Outlet />}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};
