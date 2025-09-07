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
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 glass-effect border-t border-border md:hidden z-40">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-colors",
              location === item.href 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            data-testid={`mobile-nav-${item.label.toLowerCase()}`}
          >
            <i className={`${item.icon} text-lg mb-1`}></i>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
