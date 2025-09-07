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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-all duration-300 hover:scale-105">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="text-white text-sm lg:text-base" />
            </div>
            <h1 className="text-lg lg:text-xl xl:text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Life Reset 30
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm lg:text-base hover:scale-105",
                  location === item.href 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <i className={`${item.icon} mr-2 text-xs lg:text-sm`}></i>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Streak Counter */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 px-3 lg:px-4 py-2 rounded-xl">
            <i className="fas fa-fire text-orange-500 animate-pulse"></i>
            <span className="font-bold text-lg lg:text-xl" data-testid="streak-count">{streak}</span>
            <span className="text-xs lg:text-sm text-muted-foreground font-medium">days</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
