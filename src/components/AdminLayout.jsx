import { ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  ListChecks,
  MessageSquare,
  ChevronLeft,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admincpanel" },
  { icon: Users, label: "Users", href: "/admincpanel/customers" },
  { icon: Store, label: "Vendors", href: "/admincpanel/vendors" },
  { icon: ListChecks, label: "Listings", href: "/admincpanel/listings" },
  { icon: MessageSquare, label: "Reviews", href: "/admincpanel/reviews" },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex w-full bg-secondary/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive flex items-center justify-center">
              <Shield className="h-5 w-5 text-destructive-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button className="w-full justify-start">
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Site
            </Link>
          </button>
          <button className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
