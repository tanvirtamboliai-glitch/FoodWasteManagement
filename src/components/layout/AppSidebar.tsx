import { useAuthStore } from "@/store/authStore";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  QrCode,
  ClipboardList,
  ChefHat,
  Trash2,
  BarChart3,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const studentNav: NavItem[] = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "Scan QR", url: "/student/scan", icon: QrCode },
  { title: "History", url: "/student/history", icon: ClipboardList },
];

const staffNav: NavItem[] = [
  { title: "Dashboard", url: "/staff", icon: LayoutDashboard },
  { title: "Staff Panel", url: "/staff/panel", icon: ClipboardList },
];

const adminNav: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
];

function getNav(role: string): NavItem[] {
  switch (role) {
    case "student": return studentNav;
    case "staff": return staffNav;
    case "admin": return adminNav;
    default: return [];
  }
}

export function AppSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;
  const items = getNav(user.role);

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <Leaf className="h-6 w-6 text-sidebar-primary" />
        <span className="font-display font-bold text-lg">Meal Trace Hub</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50">
          Reduce waste. Feed minds.
        </p>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar shrink-0">
      <AppSidebarContent />
    </aside>
  );
}
