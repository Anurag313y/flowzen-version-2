import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSuperAdminStore } from '@/store/superAdminStore';
import { Bell, LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SuperAdminHeaderProps {
  sidebarCollapsed: boolean;
}

export function SuperAdminHeader({ sidebarCollapsed }: SuperAdminHeaderProps) {
  const navigate = useNavigate();
  const { superAdminUser, logoutSuperAdmin, complaints } = useSuperAdminStore();
  
  const openComplaints = complaints.filter(c => c.status !== 'resolved').length;

  const handleLogout = () => {
    logoutSuperAdmin();
    toast.success('Logged out successfully');
    navigate('/super-admin/login');
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-slate-800 border-b border-slate-700 z-30 transition-all duration-300 flex items-center justify-between px-6",
        sidebarCollapsed ? "left-16" : "left-64"
      )}
    >
      <div>
        <h2 className="font-semibold text-white">Super Admin Console</h2>
        <p className="text-xs text-slate-400">Flozen SaaS Management</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-700" onClick={() => navigate('/super-admin/complaints')}>
          <Bell className="h-5 w-5" />
          {openComplaints > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {openComplaints}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto py-1.5 px-2 hover:bg-slate-700">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-slate-900 text-sm font-semibold">
                  SA
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-white">{superAdminUser?.name || 'Super Admin'}</p>
                <p className="text-xs text-slate-400">{superAdminUser?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/super-admin/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/super-admin/audit')}>
              <User className="h-4 w-4 mr-2" />
              Activity Log
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
