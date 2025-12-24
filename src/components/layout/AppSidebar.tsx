import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ShoppingCart,
  ClipboardList,
  Package,
  BarChart3,
  Users,
  Wrench,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Utensils,
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
  section: 'operations' | 'management' | 'business' | 'hotel' | 'system';
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  // Operations Section
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard', section: 'operations' },
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
  
  // System Section
  { id: 'configurations', label: 'Configurations', icon: Settings, path: '/configurations', section: 'system' },
];

interface SectionConfig {
  key: 'operations' | 'management' | 'business' | 'hotel' | 'system';
  title: string;
}

const sections: SectionConfig[] = [
  { key: 'operations', title: 'Operations' },
  { key: 'management', title: 'Management' },
  { key: 'business', title: 'Business' },
  { key: 'hotel', title: 'Hotel PMS' },
  { key: 'system', title: 'System' },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  
  // Initialize open sections based on active route
  const getInitialOpenSections = () => {
    const openSections: Record<string, boolean> = {};
    sections.forEach(section => {
      const hasActiveItem = sidebarItems.some(
        item => item.section === section.key && location.pathname === item.path
      );
      openSections[section.key] = hasActiveItem;
    });
    // Always keep operations open by default
    if (!Object.values(openSections).some(v => v)) {
      openSections.operations = true;
    }
    return openSections;
  };

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(getInitialOpenSections);

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const renderSection = (section: SectionConfig) => {
    const items = sidebarItems.filter(item => item.section === section.key);
    const isOpen = openSections[section.key];
    const hasActiveItem = items.some(item => location.pathname === item.path);
    
    return (
      <Collapsible
        key={section.key}
        open={isOpen}
        onOpenChange={() => toggleSection(section.key)}
        className="mb-1"
      >
        <CollapsibleTrigger
          className={cn(
            "flex items-center justify-between w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded-lg mx-2",
            hasActiveItem 
              ? "text-sidebar-primary bg-sidebar-accent/50" 
              : "text-sidebar-muted hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
            collapsed && "justify-center px-2 mx-1"
          )}
        >
          {!collapsed && <span>{section.title}</span>}
          {collapsed ? (
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
          ) : (
            <ChevronDown 
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-1">
          <nav className="space-y-0.5 px-2">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-primary font-medium",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-colors",
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
        </CollapsibleContent>
      </Collapsible>
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
      <div className="py-3 overflow-y-auto h-[calc(100vh-120px)]">
        {sections.map(section => renderSection(section))}
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
