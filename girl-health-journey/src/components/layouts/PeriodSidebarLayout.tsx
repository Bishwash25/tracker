import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  CalendarDays, 
  LineChart, 
  Lightbulb, 
  User, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  History,
  ClipboardList
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function PeriodSidebarLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: "Dashboard", path: "", icon: <CalendarDays className="h-5 w-5" /> },
    { name: "Tracking", path: "tracking", icon: <ClipboardList className="h-5 w-5" /> },
    { name: "Insights", path: "insights", icon: <LineChart className="h-5 w-5" /> },
    { name: "Learn", path: "learn", icon: <Lightbulb className="h-5 w-5" /> },
    { name: "History", path: "history", icon: <History className="h-5 w-5" /> },
    { name: "Profile", path: "profile", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="font-heading font-bold text-lavender text-xl">Floo</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-6 mt-8">
                <h2 className="font-heading font-bold text-lavender text-xl">Floo</h2>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-2 rounded-md",
                      isActive 
                        ? "bg-lavender/10 text-lavender font-medium" 
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div 
          className={cn(
            "hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div className="p-4 flex justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md",
                  isActive 
                    ? "bg-lavender/10 text-lavender font-medium" 
                    : "text-muted-foreground hover:bg-muted",
                  !sidebarOpen && "justify-center"
                )}
              >
                {item.icon}
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
