import { Link, useLocation } from "wouter";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  streak: number;
}

export function Navigation({ streak }: NavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "fas fa-home" },
    { href: "/challenges", label: "Challenges", icon: "fas fa-tasks" },
    { href: "/progress", label: "Progress", icon: "fas fa-chart-line" },
    { href: "/skills", label: "Skills", icon: "fas fa-brain" },
    { href: "/vision", label: "Vision", icon: "fas fa-eye" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 glass-effect border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Zap className="text-white text-sm" />
            </div>
            <h1 className="text-xl font-bold">Life Reset 30</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-item transition-colors font-medium",
                  location === item.href 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button - TODO: Implement mobile menu */}
          <button className="md:hidden text-foreground" data-testid="mobile-menu-button">
            <i className="fas fa-bars text-lg"></i>
          </button>

          {/* Streak Counter */}
          <div className="hidden sm:flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
            <i className="fas fa-fire text-orange-500"></i>
            <span className="font-bold" data-testid="streak-count">{streak}</span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
