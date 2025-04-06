
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Grid3X3, PanelLeft, Settings, Tag, MessageSquare } from "lucide-react";
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSidebar, SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

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
    if (path.includes('/admin/settings')) return 'settings';
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
                    <Link to="/admin/projects" onClick={() => setActiveTab('projects')}>
                      <Grid3X3 className="mr-2 h-4 w-4" />
                      Projects
                    </Link>
                  </Button>
                  <Button 
                    variant={activeTab === 'categories' ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link to="/admin/categories" onClick={() => setActiveTab('categories')}>
                      <Tag className="mr-2 h-4 w-4" />
                      Categories
                    </Link>
                  </Button>
                  <Button 
                    variant={activeTab === 'messages' ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link to="/admin/messages" onClick={() => setActiveTab('messages')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </Button>
                  <Button 
                    variant={activeTab === 'settings' ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link to="/admin/settings" onClick={() => setActiveTab('settings')}>
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
