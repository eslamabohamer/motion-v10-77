
import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { toast } from 'sonner';
import { AdminDashboard } from '@/components/AdminDashboard';

const AdminLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if admin is logged in via localStorage
        const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        
        if (!isLoggedIn) {
          navigate('/admin/login');
          return;
        }
        
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
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  return <AdminDashboard />;
};

export default AdminLayout;
