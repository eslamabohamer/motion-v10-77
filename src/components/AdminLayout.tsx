
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Inbox, Image, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  icon: ReactNode;
}

export const AdminLayout = ({ children, title, description, icon }: AdminLayoutProps) => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
                {icon} {title}
              </h1>
              <p className="text-muted-foreground mb-4">
                {description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <div className="flex items-center text-muted-foreground mr-4">
                <User className="h-4 w-4 mr-2" />
                {user?.email}
              </div>
              <div className="flex gap-2">
                <Link to="/admin/projects">
                  <Button 
                    variant={location.pathname === '/admin/projects' ? 'default' : 'outline'}
                    size="sm"
                  >
                    <Image className="mr-2 h-4 w-4" /> Projects
                  </Button>
                </Link>
                <Link to="/admin/messages">
                  <Button 
                    variant={location.pathname === '/admin/messages' ? 'default' : 'outline'} 
                    size="sm"
                  >
                    <Inbox className="mr-2 h-4 w-4" /> Messages
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};
