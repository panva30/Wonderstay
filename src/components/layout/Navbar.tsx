import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, X, User, Search, Moon, Sun, Hotel, Globe, Briefcase } from "lucide-react";
import { useTheme } from "next-themes";
import CurrencySelector from "@/components/CurrencySelector";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const checkUser = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => {
        subscription.unsubscribe();
        window.removeEventListener("scroll", handleScroll);
      };
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const isTransparent = location.pathname === "/" && !scrolled;

  const userInitial = user?.email?.[0].toUpperCase() || "U";
  const isOwner = user?.user_metadata?.role === "owner";

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/80 backdrop-blur-md border-b border-border py-3 shadow-sm" : "bg-background py-5"
    }`}>
      <div className="page-wrapper flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Hotel className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
            Wonder<span className="text-primary">Stay</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          <Link to="/listings" className={`text-sm font-semibold transition-colors hover:text-primary ${location.pathname === "/listings" ? "text-primary" : "text-muted-foreground"}`}>
            Explore
          </Link>
          <Link to="/bookings" className={`text-sm font-semibold transition-colors hover:text-primary ${location.pathname === "/bookings" ? "text-primary" : "text-muted-foreground"}`}>
            Bookings
          </Link>
          {isOwner && (
            <>
              <Link to="/owner/dashboard" className={`text-sm font-semibold transition-colors hover:text-primary ${location.pathname === "/owner/dashboard" ? "text-primary" : "text-muted-foreground"}`}>
                Dashboard
              </Link>
              <Link to="/owner/add-resort" className={`text-sm font-semibold transition-colors hover:text-primary ${location.pathname === "/owner/add-resort" ? "text-primary" : "text-muted-foreground"}`}>
                Add Resort
              </Link>
            </>
          )}
          <Link to="/about" className={`text-sm font-semibold transition-colors hover:text-primary ${location.pathname === "/about" ? "text-primary" : "text-muted-foreground"}`}>
            About
          </Link>
        </div>

        {/* Center Search Bar (Airbnb style) - Only on listings page or home */}
        {(location.pathname === "/" || location.pathname === "/listings") && (
          <div className="hidden md:flex lg:hidden xl:flex items-center border border-border rounded-full py-2 px-4 shadow-sm hover:shadow-md transition-all cursor-pointer bg-card group">
            <button className="px-4 text-sm font-semibold border-r border-border">Anywhere</button>
            <button className="px-4 text-sm font-semibold border-r border-border">Any week</button>
            <button className="px-4 text-sm font-medium text-muted-foreground">Add guests</button>
            <div className="ml-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Search className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {!isOwner && user && (
            <Link 
              to="/owner/dashboard" 
              className="hidden md:flex items-center gap-2 text-sm font-semibold hover:bg-muted px-4 py-2.5 rounded-full transition-colors"
            >
              Become a Host
            </Link>
          )}
          
          <div className="flex items-center gap-1 border border-border rounded-full p-1.5 hover:shadow-md transition-all bg-card">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <Link
              to="/favorites"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
              aria-label="Favorites"
            >
              <Heart className="w-4 h-4" />
            </Link>

            <div className="h-6 w-[1px] bg-border mx-1"></div>

            <div className="relative group">
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-muted transition-colors"
              >
                <Menu className="w-4 h-4 text-muted-foreground" />
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
                  {user ? (
                    <span className="font-bold text-xs">{userInitial}</span>
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
              </Link>
              
              {/* Dropdown Menu (Simplified) */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {!user ? (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-sm font-semibold hover:bg-muted">Sign in</Link>
                    <Link to="/signup" className="block px-4 py-2 text-sm hover:bg-muted">Sign up</Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" className="block px-4 py-2 text-sm font-semibold hover:bg-muted">My Profile</Link>
                    <Link to="/bookings" className="block px-4 py-2 text-sm hover:bg-muted">My Bookings</Link>
                    <div className="h-[1px] bg-border my-1"></div>
                    <Link to="/owner/dashboard" className="block px-4 py-2 text-sm hover:bg-muted">Manage Listings</Link>
                    <button 
                      onClick={() => supabase.auth.signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/5"
                    >
                      Log out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
