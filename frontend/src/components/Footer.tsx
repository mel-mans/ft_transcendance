import { Mail, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="px-4 pb-4">
      <div className="container mx-auto">
        <div className="glass rounded-2xl px-4 sm:px-8 py-6 sm:py-8">
          {/* Navigation links */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
            {[
              { label: "Home", href: "/" },
              { label: "About", href: "#" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Contact", href: "#" },
            ].map((link) => (
              <Link 
                key={link.label}
                to={link.href} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6 sm:mb-8" />
          
          {/* Logo and info */}
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-bold text-xs text-primary-foreground">
                42
              </div>
              <span className="font-semibold text-foreground">RoomMates</span>
            </div>
            
            {/* Contact info */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                hello@42roommates.com
              </span>
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                42roommates.com
              </span>
            </div>
            
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © 2025 42 RoomMates
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
