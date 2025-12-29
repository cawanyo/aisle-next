"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Map, CalendarDays, Wallet, Gift, 
  Settings, ArrowLeft, LayoutDashboard, Users, 
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface SidebarProps {
  projectId: string;
}




export function ProjectSidebar({ projectId }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: `/project/${projectId}`, icon: LayoutDashboard },
    { name: "Roadmap", href: `/project/${projectId}/roadmap`, icon: Map },
    { name: "Itinerary", href: `/project/${projectId}/itinerary`, icon: CalendarDays },
    { name: "Budget", href: `/project/${projectId}/budget`, icon: Wallet },
    { name: "Registry", href: `/project/${projectId}/registry`, icon: Gift },
    { name: "Team", href: `/project/${projectId}/team`, icon: Users },
  ];

  return (
    <>
    <div className=" hidden md:flex w-64 h-screen bg-stone-50 border-r border-stone-200  flex-col fixed left-0 top-15 z-20">
      {/* Header */}
      <div className="p-6 border-b border-stone-200/50">
        <Link href="/dashboard" className="flex items-center text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="font-serif font-bold text-xl text-stone-900">
          Project Workspace
        </div>
      </div>
      <Nav links={links} pathname={pathname} />
      {/* Navigation */}
      
    </div>


    <div className="fixed right-2 top-20 md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 bg-pink-200 rounded-2xl cursor-pointer">
          <Menu className="text-gray-800"/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full">
        <Nav links={links} pathname={pathname} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    </>
  );
}

function Nav({ links, pathname }: { links: { name: string; href: string; icon: React.ComponentType<any>; }[]; pathname: string }) {
  return (
    <nav className="flex-1  flex flex-col p-4 space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;

        return (
          <Link key={link.href} href={link.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-11 text-stone-600 hover:text-stone-900 hover:bg-stone-100",
                isActive && "bg-white text-primary font-medium shadow-sm border border-stone-100 hover:bg-white"
              )}
            >
              <Icon className={cn("w-4 h-4 mr-3", isActive ? "text-primary" : "text-stone-400")} />
              {link.name}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}