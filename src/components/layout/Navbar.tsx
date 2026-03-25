import { useAuthStore } from "@/store/authStore";
import { useLocation, Link } from "react-router-dom";
import { LogOut, Menu, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebarContent } from "./AppSidebar";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 flex items-center px-4 gap-3">
      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <AppSidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <Leaf className="h-5 w-5 text-primary" />
        <span className="font-display font-bold text-lg">Meal Trace Hub</span>
      </div>

      <div className="flex-1" />

      <span className="text-sm text-muted-foreground hidden sm:block">
        {user.name} <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">{user.role}</span>
      </span>
      <Button variant="ghost" size="icon" onClick={logout} title="Logout">
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
