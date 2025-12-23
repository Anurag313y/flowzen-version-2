import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { useSuperAdminStore } from "./store/superAdminStore";

// Pages
import LoginPage from "./pages/LoginPage";
import WaiterPage from "./pages/WaiterPage";
import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import OrdersPage from "./pages/OrdersPage";
import KitchenPage from "./pages/KitchenPage";
import ReservationsPage from "./pages/ReservationsPage";
import HousekeepingPage from "./pages/HousekeepingPage";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AuditPage from "./pages/AuditPage";
import NotFound from "./pages/NotFound";
import TablesPage from "./pages/TablesPage";
import MenuManagementPage from "./pages/MenuManagementPage";
import RecipeManagementPage from "./pages/RecipeManagementPage";
import CustomersPage from "./pages/CustomersPage";
import OnlineOrdersPage from "./pages/OnlineOrdersPage";
import MaintenancePage from "./pages/MaintenancePage";
import DiscountsPage from "./pages/DiscountsPage";
import ConfigurationsPage from "./pages/ConfigurationsPage";

// Super Admin Pages
import SuperAdminLoginPage from "./pages/super-admin/SuperAdminLoginPage";
import SuperAdminDashboardPage from "./pages/super-admin/SuperAdminDashboardPage";
import ClientListPage from "./pages/super-admin/ClientListPage";
import AddClientPage from "./pages/super-admin/AddClientPage";
import ClientViewPage from "./pages/super-admin/ClientViewPage";
import ClientEditPage from "./pages/super-admin/ClientEditPage";
import ComplaintsPage from "./pages/super-admin/ComplaintsPage";
import AuditLogsPage from "./pages/super-admin/AuditLogsPage";
import SuperAdminSettingsPage from "./pages/super-admin/SuperAdminSettingsPage";
import SubscriptionsPage from "./pages/super-admin/SubscriptionsPage";
import ServiceControlPage from "./pages/super-admin/ServiceControlPage";
import NotificationsPage from "./pages/super-admin/NotificationsPage";
import SupportAccessPage from "./pages/super-admin/SupportAccessPage";
import { SuperAdminLayout } from "./components/super-admin/SuperAdminLayout";
import { SuperAdminProtectedRoute } from "./components/super-admin/SuperAdminProtectedRoute";
import { SupportModeWrapper } from "./components/support/SupportModeWrapper";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();
  const { isSuperAdminAuthenticated } = useSuperAdminStore();

  return (
    <Routes>
      {/* Public Login Route */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'waiter' ? '/waiter' : '/dashboard'} replace />
          ) : (
            <LoginPage />
          )
        } 
      />

      {/* Super Admin Routes */}
      <Route 
        path="/super-admin/login" 
        element={
          isSuperAdminAuthenticated ? (
            <Navigate to="/super-admin" replace />
          ) : (
            <SuperAdminLoginPage />
          )
        } 
      />
      <Route
        path="/super-admin"
        element={
          <SuperAdminProtectedRoute>
            <SuperAdminLayout />
          </SuperAdminProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboardPage />} />
        <Route path="clients" element={<ClientListPage />} />
        <Route path="clients/new" element={<AddClientPage />} />
        <Route path="clients/:id" element={<ClientViewPage />} />
        <Route path="clients/:id/edit" element={<ClientEditPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="services" element={<ServiceControlPage />} />
        <Route path="support-access" element={<SupportAccessPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
        <Route path="settings" element={<SuperAdminSettingsPage />} />
      </Route>

      {/* Waiter Route - Mobile First */}
      <Route
        path="/waiter"
        element={
          <SupportModeWrapper allowedRoles={['waiter']}>
            <WaiterPage />
          </SupportModeWrapper>
        }
      />

      {/* Manager Routes - With Layout */}
      <Route
        element={
          <SupportModeWrapper allowedRoles={['manager']}>
            <AppLayout />
          </SupportModeWrapper>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/menu" element={<MenuManagementPage />} />
        <Route path="/recipes" element={<RecipeManagementPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/online-orders" element={<OnlineOrdersPage />} />
        <Route path="/discounts" element={<DiscountsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/housekeeping" element={<HousekeepingPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/configurations" element={<ConfigurationsPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
