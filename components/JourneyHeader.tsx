"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Gift, Heart, LayoutDashboard, Users, Wallet } from "lucide-react";
import { UserNav } from "@/components/UserNav";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const JourneyHeader = ({transparent}: {transparent?: boolean}) => {
  const { status } = useSession();
  const pathname = usePathname();

  const isAuthenticated = status === "authenticated";

  // Navigation Items
  const navItems = [
    { name: "Dashboard", href: `/dashboard/`, icon: LayoutDashboard },
  
  ];

  return (
    <header className={cn("border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50", transparent && "bg-white/10 ")}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Logo Area */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4 text-primary fill-primary" />
            </div>
            <span className="text-lg font-serif font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Aisle Roadmap
            </span>
          </Link>

          {/* 2. Central Navigation (Visible only if logged in) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50", 
                        transparent && "text-white"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* 3. Right User Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <UserNav />
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className={cn("", transparent && "text-white")}>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-md">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="text-xs sm:text-md">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};