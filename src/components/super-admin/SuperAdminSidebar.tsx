import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  CreditCard,
  HeadphonesIcon,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Bell,
  Activity,
  ToggleLeft,
  Headset,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSuperAdminStore } from '@/store/superAdminStore';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

interface SuperAdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SuperAdminSidebar({ collapsed, onToggle }: SuperAdminSidebarProps) {
  const { complaints } = useSuperAdminStore();
  const openComplaints = complaints.filter(c => c.status !== 'resolved').length;

  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/super-admin' },
    { id: 'clients', label: 'Client List', icon: Building2, path: '/super-admin/clients' },
    { id: 'add-client', label: 'Add Client', icon: UserPlus, path: '/super-admin/clients/new' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, path: '/super-admin/subscriptions' },
    { id: 'services', label: 'Service Control', icon: ToggleLeft, path: '/super-admin/services' },
    { id: 'support-access', label: 'Support Access', icon: Headset, path: '/super-admin/support-access' },
    { id: 'complaints', label: 'Complaints', icon: HeadphonesIcon, path: '/super-admin/complaints', badge: openComplaints > 0 ? openComplaints : undefined },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/super-admin/notifications' },
    { id: 'audit', label: 'Audit Logs', icon: Activity, path: '/super-admin/audit' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/super-admin/settings' },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-slate-800 border-r border-slate-700 transition-all duration-300 z-40 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-slate-900" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">Flozen</h1>
              <p className="text-[10px] text-primary font-medium tracking-wider uppercase">Super Admin</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/super-admin'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                )
              }
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
              {!collapsed && (
                <>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-slate-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center text-slate-400 hover:text-white hover:bg-slate-700"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
