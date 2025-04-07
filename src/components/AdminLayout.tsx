
import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Tag, Settings, MessageSquare, Users, Shield, Layout, LogOut, Sidebar as SidebarIcon, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminLayout() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          navigate('/admin/login');
          return;
        }
        
        // Assume the user is an admin if they have a session 
        // In a production app, you would check if they have the admin role
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking auth status:', error);
        toast.error('Authentication error');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      navigate('/admin/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Toggle for Mobile */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <SidebarIcon className="h-5 w-5" />
      </Button>
      
      {/* Sidebar */}
      <div 
        className={`w-64 bg-card border-r border-border fixed top-0 left-0 h-full z-40 transition-all duration-300 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border">
            <Link to="/admin" className="text-xl font-bold">
              Admin Dashboard
            </Link>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your site content
            </p>
          </div>
          
          <nav className="flex-1 py-4 px-4 overflow-y-auto">
            <ul className="space-y-2">
              <NavItem 
                to="/admin/projects" 
                icon={<Layout className="h-5 w-5" />} 
                label="Projects" 
                isActive={location.pathname.includes('/admin/projects')}
                onClick={() => setIsSidebarOpen(false)}
              />
              
              <NavItem 
                to="/admin/sections" 
                icon={<Layers className="h-5 w-5" />} 
                label="Sections" 
                isActive={location.pathname.includes('/admin/sections')}
                onClick={() => setIsSidebarOpen(false)}
              />
              
              <NavItem 
                to="/admin/categories" 
                icon={<Tag className="h-5 w-5" />} 
                label="Categories" 
                isActive={location.pathname.includes('/admin/categories')}
                onClick={() => setIsSidebarOpen(false)}
              />
              
              <NavItem 
                to="/admin/team" 
                icon={<Users className="h-5 w-5" />} 
                label="Team" 
                isActive={location.pathname.includes('/admin/team')}
                onClick={() => setIsSidebarOpen(false)}
              />

              <NavItem 
                to="/admin/company-logos" 
                icon={<Image className="h-5 w-5" />} 
                label="Company Logos" 
                isActive={location.pathname.includes('/admin/company-logos')}
                onClick={() => setIsSidebarOpen(false)}
              />
              
              <NavItem 
                to="/admin/messages" 
                icon={<MessageSquare className="h-5 w-5" />} 
                label="Messages" 
                isActive={location.pathname.includes('/admin/messages')}
                onClick={() => setIsSidebarOpen(false)}
              />
              
              <NavItem 
                to="/admin/users" 
                icon={<Shield className="h-5 w-5" />} 
                label="Users" 
                isActive={location.pathname.includes('/admin/users')}
                onClick={() => setIsSidebarOpen(false)}
              />
              
              <NavItem 
                to="/admin/settings" 
                icon={<Settings className="h-5 w-5" />} 
                label="Settings" 
                isActive={location.pathname.includes('/admin/settings')}
                onClick={() => setIsSidebarOpen(false)}
              />
            </ul>
          </nav>
          
          <div className="p-4 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
      
      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ to, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <li>
      <NavLink 
        to={to} 
        className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
          isActive 
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted/50 text-foreground'
        }`}
        onClick={onClick}
      >
        <span className="mr-2">{icon}</span>
        <span>{label}</span>
      </NavLink>
    </li>
  );
}
