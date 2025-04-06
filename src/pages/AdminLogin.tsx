
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { verifyAdminCredentials, createInitialAdmin } from '@/services/adminService';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin account exists
    const checkAdminExists = async () => {
      try {
        const { count, error } = await supabase
          .from('admin_credentials')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        if (count === 0) {
          setIsFirstLogin(true);
          setEmail('admin@example.com');
          setPassword('password123');
          toast.info('First login detected. Use the provided default credentials to set up your account.');
        }
      } catch (error) {
        console.error('Error checking admin account:', error);
      }
    };
    
    checkAdminExists();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For first login, create the admin account
      if (isFirstLogin) {
        const { success, error } = await createInitialAdmin(email, password);
        
        if (!success) {
          toast.error(error || 'Failed to create admin account');
          setIsLoading(false);
          return;
        }
        
        toast.success('Admin account created successfully');
      }
      
      console.log('Attempting login with:', { email });
      const isValid = await verifyAdminCredentials(email, password);
      
      if (!isValid) {
        toast.error('Invalid email or password');
        setIsLoading(false);
        return;
      }
      
      // Store login status in localStorage
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('adminEmail', email);
      
      toast.success('Logged in successfully');
      navigate('/admin/projects');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              {isFirstLogin 
                ? 'Set up your admin account with the default credentials'
                : 'Enter your credentials to access the admin area'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⊚</span>
                  {isFirstLogin ? 'Creating Account...' : 'Logging in...'}
                </>
              ) : (isFirstLogin ? 'Create Admin Account' : 'Login')}
            </Button>
          </CardFooter>
          <div className="p-4 pt-0 text-center">
            <a href="/" className="text-sm text-primary hover:underline">
              Return to public site
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
