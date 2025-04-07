
import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { supabase, refreshSiteSettings } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminDashboard } from '@/components/AdminDashboard';

const AdminLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have auth data in localStorage first
        const savedAuthState = localStorage.getItem('adminAuthState');
        if (savedAuthState) {
          const { isAuthenticated, isAdmin } = JSON.parse(savedAuthState);
          setIsAuthenticated(isAuthenticated);
          setIsAdmin(isAdmin);
        }
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          navigate('/admin/login');
          return;
        }
        
        // Check if the user has admin role
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
        
        if (roleError) {
          console.error('Role check error:', roleError);
          throw new Error('Failed to check admin privileges');
        }
        
        if (roleData !== 'admin') {
          toast.error('You do not have admin privileges');
          // Instead of signing out, just redirect to home page
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        setIsAuthenticated(true);
        
        // Save auth state to localStorage
        localStorage.setItem('adminAuthState', JSON.stringify({ isAuthenticated: true, isAdmin: true }));
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Authentication error');
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkAuth(); // Re-check permissions when signed in
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
        // Update localStorage when signing out
        localStorage.setItem('adminAuthState', JSON.stringify({ isAuthenticated: false, isAdmin: false }));
        navigate('/admin/login');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Load site settings to localStorage for other pages to access
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      // Use the refreshSiteSettings function from the client
      refreshSiteSettings()
        .then(() => {
          console.log('Site settings loaded to localStorage');
        })
        .catch(error => {
          console.error('Error loading settings:', error);
        });
    }
  }, [isAuthenticated, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in the useEffect
  }

  return <AdminDashboard />;
};

export default AdminLayout;
