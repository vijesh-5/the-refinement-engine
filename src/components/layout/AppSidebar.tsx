import { Link } from "react-router-dom";
import { 
  PenLine, 
  Megaphone, 
  ShoppingBag, 
  LayoutDashboard, 
  FileText, 
  LayoutTemplate, 
  Settings,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
      isActive 
        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

interface NavGroupProps {
  label: string;
  children: React.ReactNode;
}

const NavGroup = ({ label, children }: NavGroupProps) => (
  <div className="space-y-1">
    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
      {label}
    </div>
    {children}
  </div>
);

export function AppSidebar() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <PenLine className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Artifex</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        <NavGroup label="Main">
          <NavItem 
            to="/app" 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Dashboard" 
            isActive={pathname === '/app'}
          />
        </NavGroup>

        <NavGroup label="Create">
          <NavItem 
            to="/app/blog" 
            icon={<PenLine className="w-4 h-4" />} 
            label="Blog Creator" 
            isActive={pathname === '/app/blog'}
          />
          <NavItem 
            to="/app/ads" 
            icon={<Megaphone className="w-4 h-4" />} 
            label="Ad Copywriter" 
            isActive={pathname === '/app/ads'}
          />
          <NavItem 
            to="/app/products" 
            icon={<ShoppingBag className="w-4 h-4" />} 
            label="Product Descriptions" 
            isActive={pathname === '/app/products'}
          />
        </NavGroup>

        <NavGroup label="Library">
          <NavItem 
            to="/app/content" 
            icon={<FileText className="w-4 h-4" />} 
            label="My Content" 
            isActive={pathname === '/app/content'}
          />
          <NavItem 
            to="/app/templates" 
            icon={<LayoutTemplate className="w-4 h-4" />} 
            label="Templates" 
            isActive={pathname === '/app/templates'}
          />
        </NavGroup>

        <NavGroup label="Account">
          <NavItem 
            to="/app/settings" 
            icon={<Settings className="w-4 h-4" />} 
            label="Settings" 
            isActive={pathname === '/app/settings'}
          />
        </NavGroup>
      </nav>

      {/* Upgrade prompt */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-primary-muted/30 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-1">Upgrade to Pro</p>
          <p className="text-xs text-foreground-muted mb-3">Unlock unlimited generation</p>
          <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-lg hover:bg-primary-hover transition-colors">
            Upgrade <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
