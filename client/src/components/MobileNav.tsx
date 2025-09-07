import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: "fas fa-home" },
    { href: "/challenges", label: "Tasks", icon: "fas fa-tasks" },
    { href: "/progress", label: "Progress", icon: "fas fa-chart-line" },
    { href: "/skills", label: "Skills", icon: "fas fa-brain" },
    { href: "/vision", label: "Vision", icon: "fas fa-eye" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-xl border-t border-border/50 md:hidden z-40 safe-area-bottom">
      <div className="grid grid-cols-5 h-20 px-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300 rounded-lg mx-1 my-2 relative overflow-hidden group",
              location === item.href 
                ? "text-primary bg-primary/10 scale-105" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95"
            )}
            data-testid={`mobile-nav-${item.label.toLowerCase()}`}
          >
            {location === item.href && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-primary rounded-b-full"></div>
            )}
            <i className={cn(
              `${item.icon} text-lg mb-1 transition-all duration-300`,
              location === item.href ? "scale-110" : "group-hover:scale-105"
            )}></i>
            <span className={cn(
              "text-xs font-medium transition-all duration-300",
              location === item.href ? "font-bold" : ""
            )}>
              {item.label}
            </span>
            {location === item.href && (
              <div className="absolute inset-0 bg-primary/5 rounded-lg animate-pulse"></div>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
