
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, HomeIcon, Briefcase, Settings, User, Mail, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 lg:px-12",
        scrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-heading font-bold text-gradient">MUHAMMAD ALI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink to="/" icon={<HomeIcon className="h-4 w-4" />} label="Home" />
          <NavLink to="/portfolio" icon={<Briefcase className="h-4 w-4" />} label="Portfolio" />
          <NavLink to="/services" icon={<Settings className="h-4 w-4" />} label="Services" />
          <NavLink to="/about" icon={<User className="h-4 w-4" />} label="About" />
          <NavLink to="/contact" icon={<Mail className="h-4 w-4" />} label="Contact" />
          
          {isAdmin ? (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/admin/projects')}
            >
              Admin Dashboard
            </Button>
          ) : user ? (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/admin/projects')}
            >
              Dashboard
            </Button>
          ) : (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/login')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Admin Login
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/95 backdrop-blur-md z-40 flex flex-col items-center justify-center transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col items-center space-y-6 text-center">
          <MobileNavLink to="/" label="Home" onClick={closeMenu} />
          <MobileNavLink to="/portfolio" label="Portfolio" onClick={closeMenu} />
          <MobileNavLink to="/services" label="Services" onClick={closeMenu} />
          <MobileNavLink to="/about" label="About" onClick={closeMenu} />
          <MobileNavLink to="/contact" label="Contact" onClick={closeMenu} />
          
          {isAdmin ? (
            <MobileNavLink to="/admin/projects" label="Admin Dashboard" onClick={closeMenu} />
          ) : user ? (
            <MobileNavLink to="/admin/projects" label="Dashboard" onClick={closeMenu} />
          ) : (
            <MobileNavLink to="/login" label="Admin Login" onClick={closeMenu} />
          )}
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavLink = ({ to, icon, label }: NavLinkProps) => {
  return (
    <Link 
      to={to} 
      className="group flex items-center space-x-1 text-foreground/80 hover:text-foreground transition-colors"
    >
      {icon}
      <span>{label}</span>
      <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-primary"></span>
    </Link>
  );
};

interface MobileNavLinkProps {
  to: string;
  label: string;
  onClick: () => void;
}

const MobileNavLink = ({ to, label, onClick }: MobileNavLinkProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-2xl font-semibold hover:text-primary transition-colors"
    >
      {label}
    </Link>
  );
};
