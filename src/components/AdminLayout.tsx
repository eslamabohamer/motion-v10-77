
import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Session, User } from '@supabase/supabase-js';

const AdminLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          navigate('/admin/login');
          return;
        }

        setSession(sessionData.session);
        setUser(sessionData.session.user);
        
        // Check if user is an admin
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {});
        
        if (roleError) {
          console.error('Role error:', roleError);
          navigate('/admin/login');
          return;
        }
        
        if (roleData !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        setIsAuthenticated(true);
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
        setSession(session);
        setUser(session?.user ?? null);
        // We'll check admin status when the component mounts
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setSession(null);
        setUser(null);
        navigate('/admin/login');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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

  return <AdminDashboard>{user?.email}</AdminDashboard>;
};

export default AdminLayout;
