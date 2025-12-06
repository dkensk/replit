import { Link, useLocation } from "wouter";
import { Dumbbell, Utensils, Trophy, MessageSquare, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/workouts", icon: Dumbbell, label: "Train" },
    { href: "/diet", icon: Utensils, label: "Diet" },
    { href: "/skills", icon: Trophy, label: "Skills" },
    { href: "/ai", icon: MessageSquare, label: "Coach AI" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-white/5 pb-safe">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive && "neon-glow")} />
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
