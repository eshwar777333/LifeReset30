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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="container mx-auto px-4 lg:px-6 py-4 lg:py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105">
            <div className="relative">
              <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 animate-glow-pulse">
                <Zap className="text-white text-base lg:text-lg drop-shadow-sm" />
              </div>
              <div className="absolute -inset-1 gradient-bg rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl hero-text gradient-text">
                Life Reset 30
              </h1>
              <p className="text-xs text-muted-foreground font-medium hidden lg:block">Transform Your Life</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative px-4 lg:px-5 py-2.5 lg:py-3 rounded-xl transition-all duration-300 font-semibold text-sm lg:text-base overflow-hidden",
                  location === item.href 
                    ? "premium-button text-white shadow-lg neon-border" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:backdrop-blur-sm"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {location === item.href && (
                  <div className="absolute inset-0 gradient-bg opacity-90 -z-10"></div>
                )}
                <div className="relative flex items-center space-x-2">
                  <i className={cn(
                    `${item.icon} text-sm lg:text-base transition-all duration-300`,
                    location === item.href ? "drop-shadow-sm" : "group-hover:scale-110"
                  )}></i>
                  <span className="relative">
                    {item.label}
                    {location === item.href && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/30 rounded-full"></div>
                    )}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Streak Counter */}
          <div className="group relative">
            <div className="premium-card px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl border border-orange-500/30 hover-scale cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <i className="fas fa-fire text-orange-500 text-lg lg:text-xl animate-pulse drop-shadow-sm"></i>
                  <div className="absolute -inset-1 bg-orange-500/20 rounded-full blur-sm animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="font-black text-xl lg:text-2xl gradient-text" data-testid="streak-count">{streak}</div>
                  <div className="text-xs font-medium text-orange-300/80 -mt-1">day streak</div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-all duration-300 -z-10"></div>
          </div>
        </div>
      </div>
      
      {/* Navigation Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </nav>
  );
}
