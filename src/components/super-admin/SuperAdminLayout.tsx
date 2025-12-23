import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminHeader } from './SuperAdminHeader';
import { cn } from '@/lib/utils';

export function SuperAdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      <SuperAdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <SuperAdminHeader sidebarCollapsed={sidebarCollapsed} />
      
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300 bg-slate-100",
          sidebarCollapsed ? "pl-16" : "pl-64"
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
