import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  Calendar,
  Clock,
  User,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useBranchStore } from '@/store/branchStore';
import { BranchSelector, Branch } from '@/components/shared/BranchSelector';
import { toast } from 'sonner';

interface AppHeaderProps {
  sidebarCollapsed: boolean;
}

export function AppHeader({ sidebarCollapsed }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { branches, selectedBranchId, selectBranch } = useBranchStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleBranchChange = (branch: Branch) => {
    selectBranch(branch.id);
    toast.success(`Switched to ${branch.name}`);
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId) || null;
  const branchList: Branch[] = branches.map(b => ({
    id: b.id,
    name: b.name,
    city: b.city,
    isMain: b.isMain,
  }));

  const displayName = user?.name || 'User';
  const displayRole = user?.role || 'manager';
  const initials = displayName.split(' ').map(n => n[0]).join('');

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-card border-b border-border transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-60"
      )}
    >
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left Section - Branch Selector & Search */}
        <div className="flex items-center gap-3 flex-1">
          {/* Branch Selector */}
          <BranchSelector
            branches={branchList}
            selectedBranch={selectedBranch ? {
              id: selectedBranch.id,
              name: selectedBranch.name,
              city: selectedBranch.city,
              isMain: selectedBranch.isMain,
            } : null}
            onSelectBranch={handleBranchChange}
            className="w-[180px]"
          />

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu, orders, tables..."
              className="pl-10 bg-background border-border h-9"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Date & Time */}
          <div className="hidden lg:flex items-center gap-3 text-muted-foreground border-r border-border pr-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(currentTime)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </Button>

          {/* Auto Refresh Indicator */}
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>Auto-refresh</span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-xs">
                  <span className="font-medium">{displayName}</span>
                  <span className="text-muted-foreground capitalize">{displayRole}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}