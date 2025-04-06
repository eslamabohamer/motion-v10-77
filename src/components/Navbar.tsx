import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, HomeIcon, Briefcase, Settings, User, Mail, ShieldIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [siteName, setSiteName] = useState("MUHAMMAD ALI");
  const [logoUrl, setLogoUrl] = useState("");
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
  useEffect(() => {
    // Load site name and logo from localStorage
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.general) {
          setSiteName(settings.general.siteName || "MUHAMMAD ALI");
          setLogoUrl(settings.general.logoUrl || "");
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const handleAdminArea = () => {
    navigate('/admin/login');
    closeMenu();
  };
  const handleGetInTouch = () => {
    navigate('/contact');
    closeMenu();
  };
  return <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20",
  // Increased height from h-16 to h-20
  scrolled ? "bg-[#1A1F2C]/85 backdrop-blur-md shadow-md" : "bg-[#1A1F2C]")}>
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          {logoUrl ? <img src={logoUrl} alt={siteName} className="h-8" /> // Increased logo height from h-6 to h-8
        : <span className="text-xl font-heading font-bold bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] bg-clip-text text-transparent">{siteName}</span> // Increased text size from text-base to text-xl
        }
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4"> {/* Increased space-x-2 to space-x-4 */}
          <NavLink to="/" icon={<HomeIcon className="h-4 w-4" />} label="Home" /> {/* Increased icon size */}
          <NavLink to="/portfolio" icon={<Briefcase className="h-4 w-4" />} label="Portfolio" />
          <NavLink to="/services" icon={<Settings className="h-4 w-4" />} label="Services" />
          <NavLink to="/about" icon={<User className="h-4 w-4" />} label="About" />
          <NavLink to="/contact" icon={<Mail className="h-4 w-4" />} label="Contact" />
          <Button variant="ghost" size="default" // Changed from sm to default
        className="flex items-center text-white hover:text-white/80" onClick={handleAdminArea}>
            <ShieldIcon className="h-4 w-4 mr-1.5" /> {/* Increased icon size and margin */}
            <span className="text-sm">Admin</span> {/* Increased text size */}
          </Button>
          
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu" className="text-white h-10 w-10"> {/* Increased button size */}
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />} {/* Increased icon size */}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={cn("fixed inset-0 bg-[#1A1F2C]/95 backdrop-blur-md z-40 flex flex-col items-center justify-center transform transition-transform duration-300 ease-in-out md:hidden", isOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="flex flex-col items-center space-y-6 text-center"> {/* Increased space-y-5 to space-y-6 */}
          <MobileNavLink to="/" label="Home" onClick={closeMenu} />
          <MobileNavLink to="/portfolio" label="Portfolio" onClick={closeMenu} />
          <MobileNavLink to="/services" label="Services" onClick={closeMenu} />
          <MobileNavLink to="/about" label="About" onClick={closeMenu} />
          <MobileNavLink to="/contact" label="Contact" onClick={closeMenu} />
          <Button variant="outline" size="default" // Changed from sm to default
        className="mt-3 border-white/20 text-white" onClick={handleAdminArea}>
            <ShieldIcon className="h-4 w-4 mr-2" /> Admin
          </Button>
          <Button size="default" // Changed from sm to default
        className="mt-4 bg-[#4a6cf7] hover:bg-[#3a5ce7]" onClick={handleGetInTouch}>
            Get in Touch
          </Button>
        </div>
      </div>
    </nav>;
};
interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}
const NavLink = ({
  to,
  icon,
  label
}: NavLinkProps) => {
  return <Link to={to} className="group flex items-center space-x-1.5 text-white/80 hover:text-white transition-colors text-sm py-1.5" // Increased text size from xs to sm, added vertical padding
  >
      {icon}
      <span>{label}</span>
      <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-[#4a6cf7]"></span>
    </Link>;
};
interface MobileNavLinkProps {
  to: string;
  label: string;
  onClick: () => void;
}
const MobileNavLink = ({
  to,
  label,
  onClick
}: MobileNavLinkProps) => {
  return <Link to={to} onClick={onClick} className="text-2xl font-semibold text-white hover:text-[#4a6cf7] transition-colors" // Increased text size from text-xl to text-2xl
  >
      {label}
    </Link>;
};