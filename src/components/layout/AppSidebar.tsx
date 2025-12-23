import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  ClipboardList,
  CreditCard,
  Package,
  ShoppingBag,
  BarChart3,
  Bed,
  Users,
  Wrench,
  Globe,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Hotel,
  Home,
  CalendarDays,
  ClipboardCheck,
  ChefHat,
  LayoutGrid,
  Tag,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  section: 'operations' | 'management' | 'business' | 'hotel' | 'config';
  badge?: number;
}

// Add Configurations section item
const configItem: SidebarItem = { id: 'configurations', label: 'Configurations', icon: Settings, path: '/configurations', section: 'config' };

const sidebarItems: SidebarItem[] = [
  // Dashboard
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard', section: 'operations' },
  
  // Operations Section
  { id: 'pos', label: 'POS / Billing', icon: ShoppingCart, path: '/pos', section: 'operations' },
  { id: 'orders', label: 'Orders', icon: ClipboardList, path: '/orders', section: 'operations', badge: 5 },
  { id: 'tables', label: 'Tables', icon: LayoutGrid, path: '/tables', section: 'operations' },
  { id: 'kitchen', label: 'Kitchen (KOT)', icon: ChefHat, path: '/kitchen', section: 'operations', badge: 3 },
  
  // Management Section
  { id: 'menu', label: 'Menu', icon: Utensils, path: '/menu', section: 'management' },
  { id: 'recipes', label: 'Recipes', icon: ChefHat, path: '/recipes', section: 'management' },
  { id: 'inventory', label: 'Inventory', icon: Package, path: '/inventory', section: 'management' },
  { id: 'customers', label: 'Customers', icon: Users, path: '/customers', section: 'management' },
  { id: 'online-orders', label: 'Online Orders', icon: Globe, path: '/online-orders', section: 'management', badge: 2 },
  
  // Business Section
  { id: 'discounts', label: 'Discounts', icon: Tag, path: '/discounts', section: 'business' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports', section: 'business' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', section: 'business' },
  
  // Hotel PMS Section
  { id: 'reservations', label: 'Reservations', icon: CalendarDays, path: '/reservations', section: 'hotel' },
  { id: 'housekeeping', label: 'Housekeeping', icon: ClipboardCheck, path: '/housekeeping', section: 'hotel' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, path: '/maintenance', section: 'hotel' },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();

  const renderSection = (section: 'operations' | 'management' | 'business' | 'hotel' | 'config', title: string) => {
    let items = sidebarItems.filter(item => item.section === section);
    if (section === 'config') items = [configItem];
    
    return (
      <div className="mb-4">
        {!collapsed && (
          <div className="flex items-center justify-between px-4 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              {title}
            </span>
            <ChevronRight className="h-3 w-3 text-sidebar-muted" />
          </div>
        )}
        <nav className="space-y-1 px-2">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-transparent text-sidebar-primary font-medium",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive && "text-sidebar-primary"
                )} />
                {!collapsed && (
                  <>
                    <span className="text-sm flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-primary text-primary-foreground h-5 min-w-[20px] flex items-center justify-center text-xs rounded-full">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <Utensils className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-sidebar-accent-foreground">Flowzen</span>
              <p className="text-xs text-sidebar-muted">Restaurant Manager</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="py-4 overflow-y-auto h-[calc(100vh-120px)]">
        {renderSection('operations', 'Operations')}
        {renderSection('management', 'Management')}
        {renderSection('business', 'Business')}
        {renderSection('hotel', 'Hotel PMS')}
        {renderSection('config', 'System')}
      </div>

      {/* Collapse Toggle */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-2 px-3 py-2 w-full rounded-lg transition-colors",
            "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center"
          )}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
