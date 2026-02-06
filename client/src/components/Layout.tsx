import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, Phone, Mail, Facebook, Linkedin, Twitter } from "lucide-react";
import { useState, useEffect } from "react";
import ChatWidget from "@/components/ChatWidget";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

const navItems = [
  { name: "Home", path: "/" },
  { name: "About Harvest", path: "/about" },
  { name: "Businesses", path: "/business" },
  { name: "Specifications", path: "/specifications" },
  { name: "Contact", path: "/contact" },
  ...(user ? [{ name: "Dashboard", path: "/dashboard" }] : []),
];

  return (
    <div className="min-h-screen flex flex-col font-sans">

      {/* Main Navigation */}
      <header 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b",
          isScrolled 
            ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 shadow-md border-border" 
            : "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 text-sidebar-foreground py-4 shadow-sm border-b border-border/50"
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 font-heading font-bold text-2xl tracking-tighter cursor-pointer">
              <img src="/images/logo.png" alt="Harvest Commodities" className="h-14 w-auto" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <div key={item.path} className="relative group">
                  <Link href={item.path} className={cn(
                    "text-sm font-medium transition-colors hover:text-primary uppercase tracking-wider cursor-pointer relative py-4",
                    location === item.path 
                      ? "text-primary" 
                      : "text-gray-800 hover:text-primary font-semibold"
                  )}>
                    {item.name}
                    <span className={cn(
                      "absolute bottom-2 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                      location === item.path && "w-full"
                    )} />
                  </Link>
                </div>
              ))}
            <Button 
              size="sm" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading tracking-wide rounded-sm"
            >
              GET QUOTE
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={cn("h-6 w-6", isScrolled ? "text-foreground" : "text-sidebar-foreground")} />
            ) : (
              <Menu className={cn("h-6 w-6", isScrolled ? "text-foreground" : "text-sidebar-foreground")} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden animate-in slide-in-from-top-10 overflow-y-auto">
          <nav className="flex flex-col gap-6 text-lg pb-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span 
                  className="block py-2 border-b border-border font-heading uppercase tracking-wide"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </span>
              </Link>
            ))}
            
            
            <Button className="w-full mt-4 font-heading">GET QUOTE</Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <ChatWidget />
      
      {/* Footer */}
      <footer className="bg-sidebar text-white pt-16 pb-8 border-t border-sidebar-border">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-heading font-bold text-2xl tracking-tighter">
              <img src="/images/logo.png" alt="Harvest Commodities" className="h-10 w-auto" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted trading partner by delivering our promises. Connecting global markets with efficiency and integrity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg mb-6 text-primary">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/"><span className="hover:text-primary transition-colors cursor-pointer">Home</span></Link></li>
              <li><Link href="/about"><span className="hover:text-primary transition-colors cursor-pointer">About Harvest</span></Link></li>
              <li><Link href="/business"><span className="hover:text-primary transition-colors cursor-pointer">Our Business</span></Link></li>
              <li><Link href="/contact"><span className="hover:text-primary transition-colors cursor-pointer">Contact</span></Link></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-heading text-lg mb-6 text-primary">Businesses</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="/business#agriculture" className="hover:text-primary transition-colors cursor-pointer">Agriculture</a></li>
              <li><a href="/business#energy" className="hover:text-primary transition-colors cursor-pointer">Energy & Coal</a></li>
              <li><a href="/business#oil" className="hover:text-primary transition-colors cursor-pointer">Oil Trading</a></li>
              <li><a href="/business#meat" className="hover:text-primary transition-colors cursor-pointer">Meat & Poultry</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg mb-6 text-primary">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Unit 2A, 17F, Glenealy Tower<br />No.1 Glenealy Central, Hong Kong</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:jericho.ang@theharvestman.com" className="hover:text-primary transition-colors">jericho.ang@theharvestman.com</a>
              </li>

            </ul>
          </div>
        </div>

        <div className="container pt-8 border-t border-sidebar-border/50 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Harvest Commodities Limited. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
