
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Linkedin, Twitter, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background pt-16 pb-8 border-t border-border/60">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 flex flex-col">
            <Link to="/" className="text-xl font-heading font-bold text-gradient mb-4">
              MUHAMMAD ALI
            </Link>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Creating captivating motion graphics and animations that tell your story.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://instagram.com" icon={<Instagram size={18} />} />
              <SocialLink href="https://youtube.com" icon={<Youtube size={18} />} />
              <SocialLink href="https://linkedin.com" icon={<Linkedin size={18} />} />
              <SocialLink href="https://twitter.com" icon={<Twitter size={18} />} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/portfolio" label="Portfolio" />
              <FooterLink to="/services" label="Services" />
              <FooterLink to="/about" label="About" />
              <FooterLink to="/contact" label="Contact" />
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <FooterLink to="/services#motion-graphics" label="Motion Graphics" />
              <FooterLink to="/services#3d-animation" label="3D Animation" />
              <FooterLink to="/services#visual-effects" label="Visual Effects" />
              <FooterLink to="/services#branding" label="Motion Branding" />
              <FooterLink to="/services#explainer-videos" label="Explainer Videos" />
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-primary" />
                <a href="mailto:info@muhammadali.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  info@muhammadali.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-primary" />
                <a href="tel:+11234567890" className="text-muted-foreground hover:text-foreground transition-colors">
                  +1 (123) 456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {currentYear} Muhammad Ali. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface FooterLinkProps {
  to: string;
  label: string;
}

const FooterLink = ({ to, label }: FooterLinkProps) => {
  return (
    <li>
      <Link to={to} className="text-muted-foreground hover:text-foreground transition-colors">
        {label}
      </Link>
    </li>
  );
};

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
}

const SocialLink = ({ href, icon }: SocialLinkProps) => {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-muted hover:bg-primary/10 text-foreground p-2 rounded-full transition-colors"
    >
      {icon}
    </a>
  );
};
