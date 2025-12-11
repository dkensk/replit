import { Link, useLocation } from "wouter";
import { Dumbbell, Utensils, Trophy, MessageSquare, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/workouts", icon: Dumbbell, label: "Train" },
    { href: "/diet", icon: Utensils, label: "Diet" },
    { href: "/skills", icon: Trophy, label: "Skills" },
    { href: "/ai", icon: MessageSquare, label: "AI" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="flex justify-around items-center h-16 px-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-full gap-1 transition-all duration-200 cursor-pointer", // Reduced width from 16 to 14
                  isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "neon-glow")} /> {/* Reduced icon size from 6 to 5 */}
                <span className="text-[9px] font-medium uppercase tracking-wider truncate max-w-full"> {/* Reduced text size */}
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
