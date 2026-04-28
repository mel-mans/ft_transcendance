import { LogIn, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/lib/auth';
import { getCurrentUser } from "@/lib/matching";
import { resolveAvatar } from "@/lib/avatar";
import NavbarChatInbox from "@/components/NavbarChatInbox";

const Navbar = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const localProfile = getCurrentUser();
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setMobileMenuOpen(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  const isLoggedIn = !!currentUser;
  const resolvedAvatar = resolveAvatar(localProfile?.avatar || currentUser?.avatar);
  const resolvedName = currentUser?.name || localProfile?.name || "User";

  const navLinks = isLoggedIn
    ? [
        { to: "/loggedin-roommates", label: "Roommates" },
        { to: "/loggedin-listings", label: "Listings" },
        { to: "/matches", label: "Matches" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/find-roommates", label: "Roommates" },
        { to: "/listings", label: "Listings" },
      ];

  return (
    <header 
      className={`fixed top-6 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Nav */}
      <nav className="py-4 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between md:justify-center relative">
            {/* Logo - positioned left */}
            <Link to="/" className="md:absolute md:left-0 flex items-center gap-2 sm:gap-3 group z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-bold text-xs sm:text-sm text-primary-foreground group-hover:glow-primary transition-all">
                42
              </div>
              <span className="font-semibold text-foreground text-base sm:text-lg">RoomMates</span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-card/40 backdrop-blur-xl">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className={`px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground glow-primary' 
                        : 'text-foreground/80 hover:text-foreground hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            
            {/* Desktop Right Section */}
            {isLoggedIn ? (
              <div className="hidden md:flex md:absolute md:right-0 items-center gap-2">
                <NavbarChatInbox />
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/40 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
                >
                  <Avatar className="w-7 h-7 border border-primary/30">
                    <AvatarImage src={resolvedAvatar} alt={resolvedName} className="object-cover" />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {resolvedName?.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{resolvedName}</span>
                </Link>
              </div>
            ) : (
                <Link 
                  to="/login" 
                  className="hidden md:flex md:absolute md:right-0 items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-sm font-medium bg-secondary/20 text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 backdrop-blur-xl"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg glass border-white/10 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 glass rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link 
                      key={link.to}
                      to={link.to} 
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-foreground/80 hover:text-foreground hover:bg-white/10'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="h-px bg-white/10 my-2" />
                {isLoggedIn ? (
                  <>
                    <div className="px-2 py-1">
                      <NavbarChatInbox />
                    </div>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
                    >
                      <Avatar className="w-7 h-7 border border-primary/30">
                        <AvatarImage src={resolvedAvatar} alt={resolvedName} className="object-cover" />
                        <AvatarFallback className="text-xs bg-primary/20 text-primary">
                          {resolvedName?.charAt(0) ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-foreground">{resolvedName}</span>
                    </Link>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-secondary/20 text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
