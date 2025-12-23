import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ShoppingCart,
  BarChart3,
  Bed,
  ClipboardCheck,
  Utensils,
  Package,
  Users,
  Globe,
  Tag,
  CalendarDays,
  Wrench,
  LayoutGrid,
  ChefHat,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

interface ModuleConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  enabled: boolean;
  features: FeatureConfig[];
}

const initialPOSModules: ModuleConfig[] = [
  {
    id: 'pos',
    name: 'POS / Billing',
    icon: ShoppingCart,
    description: 'Point of sale and billing features',
    enabled: true,
    features: [
      { id: 'pos-dinein', name: 'Dine-In Orders', description: 'Enable dine-in order type', enabled: true, category: 'pos' },
      { id: 'pos-takeaway', name: 'Takeaway Orders', description: 'Enable takeaway order type', enabled: true, category: 'pos' },
      { id: 'pos-delivery', name: 'Delivery Orders', description: 'Enable delivery order type', enabled: true, category: 'pos' },
      { id: 'pos-kot', name: 'KOT Generation', description: 'Kitchen order ticket generation', enabled: true, category: 'pos' },
      { id: 'pos-split', name: 'Split Bill', description: 'Allow splitting bills', enabled: true, category: 'pos' },
      { id: 'pos-merge', name: 'Merge Bills', description: 'Allow merging bills', enabled: true, category: 'pos' },
      { id: 'pos-nc', name: 'NC (No Charge)', description: 'Allow no charge orders', enabled: true, category: 'pos' },
      { id: 'pos-void', name: 'Void Orders', description: 'Allow voiding orders', enabled: true, category: 'pos' },
    ],
  },
  {
    id: 'tables',
    name: 'Table Management',
    icon: LayoutGrid,
    description: 'Restaurant table management',
    enabled: true,
    features: [
      { id: 'tables-sections', name: 'Table Sections', description: 'Organize tables by sections', enabled: true, category: 'tables' },
      { id: 'tables-reservation', name: 'Table Reservation', description: 'Reserve tables in advance', enabled: true, category: 'tables' },
      { id: 'tables-transfer', name: 'Table Transfer', description: 'Transfer orders between tables', enabled: true, category: 'tables' },
      { id: 'tables-settlement', name: 'Direct Settlement', description: 'Settle bills directly from table view', enabled: true, category: 'tables' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen Display',
    icon: ChefHat,
    description: 'Kitchen order management',
    enabled: true,
    features: [
      { id: 'kitchen-rush', name: 'Rush Orders', description: 'Mark orders as rush/priority', enabled: true, category: 'kitchen' },
      { id: 'kitchen-timer', name: 'Preparation Timer', description: 'Show preparation time for orders', enabled: true, category: 'kitchen' },
      { id: 'kitchen-sound', name: 'Sound Alerts', description: 'Audio notifications for new orders', enabled: true, category: 'kitchen' },
    ],
  },
  {
    id: 'menu',
    name: 'Menu Management',
    icon: Utensils,
    description: 'Menu and item management',
    enabled: true,
    features: [
      { id: 'menu-categories', name: 'Categories', description: 'Organize items by category', enabled: true, category: 'menu' },
      { id: 'menu-modifiers', name: 'Modifiers', description: 'Add-ons and customizations', enabled: true, category: 'menu' },
      { id: 'menu-variants', name: 'Variants', description: 'Size/portion variants', enabled: true, category: 'menu' },
      { id: 'menu-combos', name: 'Combos/Deals', description: 'Combo meals and deals', enabled: true, category: 'menu' },
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: Package,
    description: 'Stock and inventory management',
    enabled: true,
    features: [
      { id: 'inv-tracking', name: 'Stock Tracking', description: 'Track ingredient stock levels', enabled: true, category: 'inventory' },
      { id: 'inv-alerts', name: 'Low Stock Alerts', description: 'Notifications for low stock', enabled: true, category: 'inventory' },
      { id: 'inv-expiry', name: 'Expiry Tracking', description: 'Track item expiry dates', enabled: true, category: 'inventory' },
      { id: 'inv-recipes', name: 'Recipe Management', description: 'Link items to recipes', enabled: false, category: 'inventory' },
    ],
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: Users,
    description: 'Customer management',
    enabled: true,
    features: [
      { id: 'cust-loyalty', name: 'Loyalty Program', description: 'Points and rewards system', enabled: true, category: 'customers' },
      { id: 'cust-history', name: 'Order History', description: 'Track customer order history', enabled: true, category: 'customers' },
      { id: 'cust-feedback', name: 'Feedback System', description: 'Collect customer feedback', enabled: false, category: 'customers' },
    ],
  },
  {
    id: 'online',
    name: 'Online Orders',
    icon: Globe,
    description: 'Online ordering integration',
    enabled: true,
    features: [
      { id: 'online-zomato', name: 'Zomato Integration', description: 'Sync with Zomato', enabled: true, category: 'online' },
      { id: 'online-swiggy', name: 'Swiggy Integration', description: 'Sync with Swiggy', enabled: true, category: 'online' },
      { id: 'online-direct', name: 'Direct Online Orders', description: 'Website ordering', enabled: false, category: 'online' },
    ],
  },
  {
    id: 'discounts',
    name: 'Discounts',
    icon: Tag,
    description: 'Discount and coupon management',
    enabled: true,
    features: [
      { id: 'disc-coupons', name: 'Coupon Codes', description: 'Promotional coupon codes', enabled: true, category: 'discounts' },
      { id: 'disc-happy', name: 'Happy Hour', description: 'Time-based discounts', enabled: true, category: 'discounts' },
      { id: 'disc-bulk', name: 'Bulk Discounts', description: 'Quantity-based discounts', enabled: false, category: 'discounts' },
    ],
  },
  {
    id: 'reports',
    name: 'Reports',
    icon: BarChart3,
    description: 'Analytics and reporting',
    enabled: true,
    features: [
      { id: 'rep-sales', name: 'Sales Report', description: 'Daily/weekly/monthly sales', enabled: true, category: 'reports' },
      { id: 'rep-items', name: 'Item-wise Report', description: 'Item-wise sales analysis', enabled: true, category: 'reports' },
      { id: 'rep-payment', name: 'Payment Report', description: 'Payment method analysis', enabled: true, category: 'reports' },
      { id: 'rep-staff', name: 'Staff Performance', description: 'Staff sales report', enabled: true, category: 'reports' },
      { id: 'rep-hourly', name: 'Hourly Analysis', description: 'Hour-wise sales pattern', enabled: true, category: 'reports' },
      { id: 'rep-tax', name: 'Tax Report', description: 'GST and tax reports', enabled: true, category: 'reports' },
      { id: 'rep-discount', name: 'Discount Report', description: 'Discount usage analysis', enabled: false, category: 'reports' },
    ],
  },
];

const initialPMSModules: ModuleConfig[] = [
  {
    id: 'reservations',
    name: 'Reservations',
    icon: CalendarDays,
    description: 'Room reservation management',
    enabled: true,
    features: [
      { id: 'res-online', name: 'Online Booking', description: 'Accept online reservations', enabled: true, category: 'reservations' },
      { id: 'res-calendar', name: 'Calendar View', description: 'Visual calendar for bookings', enabled: true, category: 'reservations' },
      { id: 'res-overbooking', name: 'Overbooking Control', description: 'Prevent overbooking', enabled: true, category: 'reservations' },
      { id: 'res-deposit', name: 'Advance Deposit', description: 'Collect advance payments', enabled: true, category: 'reservations' },
    ],
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    icon: ClipboardCheck,
    description: 'Room housekeeping management',
    enabled: true,
    features: [
      { id: 'hk-status', name: 'Room Status', description: 'Track room cleaning status', enabled: true, category: 'housekeeping' },
      { id: 'hk-assign', name: 'Staff Assignment', description: 'Assign staff to rooms', enabled: true, category: 'housekeeping' },
      { id: 'hk-timer', name: 'Cleaning Timer', description: 'Track cleaning duration', enabled: true, category: 'housekeeping' },
      { id: 'hk-inspect', name: 'Inspection Checklist', description: 'Room inspection checklist', enabled: true, category: 'housekeeping' },
      { id: 'hk-minibar', name: 'Minibar Tracking', description: 'Track minibar consumption', enabled: false, category: 'housekeeping' },
    ],
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    icon: Wrench,
    description: 'Property maintenance management',
    enabled: true,
    features: [
      { id: 'maint-tickets', name: 'Maintenance Tickets', description: 'Create and track issues', enabled: true, category: 'maintenance' },
      { id: 'maint-schedule', name: 'Scheduled Maintenance', description: 'Preventive maintenance', enabled: true, category: 'maintenance' },
      { id: 'maint-vendors', name: 'Vendor Management', description: 'Manage service vendors', enabled: false, category: 'maintenance' },
    ],
  },
  {
    id: 'pms-reports',
    name: 'Hotel Reports',
    icon: BarChart3,
    description: 'Hotel analytics and reports',
    enabled: true,
    features: [
      { id: 'pms-occ', name: 'Occupancy Report', description: 'Room occupancy analysis', enabled: true, category: 'pms-reports' },
      { id: 'pms-revenue', name: 'Revenue Report', description: 'Revenue per room analysis', enabled: true, category: 'pms-reports' },
      { id: 'pms-guest', name: 'Guest Report', description: 'Guest demographics', enabled: true, category: 'pms-reports' },
      { id: 'pms-forecast', name: 'Forecast Report', description: 'Occupancy forecasting', enabled: false, category: 'pms-reports' },
    ],
  },
];

function ModuleCard({ module, onToggleModule, onToggleFeature }: {
  module: ModuleConfig;
  onToggleModule: (moduleId: string) => void;
  onToggleFeature: (moduleId: string, featureId: string) => void;
}) {
  const Icon = module.icon;
  const enabledFeatures = module.features.filter(f => f.enabled).length;

  return (
    <AccordionItem value={module.id} className="border rounded-lg mb-2">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-4 flex-1">
          <div className={cn(
            "p-2 rounded-lg",
            module.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left flex-1">
            <div className="font-medium">{module.name}</div>
            <div className="text-sm text-muted-foreground">
              {enabledFeatures}/{module.features.length} features enabled
            </div>
          </div>
          <div className="mr-4" onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={module.enabled}
              onCheckedChange={() => onToggleModule(module.id)}
            />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid gap-3 mt-2">
          {module.features.map((feature) => (
            <div
              key={feature.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                !module.enabled && "opacity-50"
              )}
            >
              <div>
                <Label htmlFor={feature.id} className="font-medium cursor-pointer">
                  {feature.name}
                </Label>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                id={feature.id}
                checked={feature.enabled}
                onCheckedChange={() => onToggleFeature(module.id, feature.id)}
                disabled={!module.enabled}
              />
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function ConfigurationsPage() {
  const [posModules, setPosModules] = useState<ModuleConfig[]>(initialPOSModules);
  const [pmsModules, setPmsModules] = useState<ModuleConfig[]>(initialPMSModules);

  const handleTogglePOSModule = (moduleId: string) => {
    setPosModules(posModules.map(m => 
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const handleTogglePOSFeature = (moduleId: string, featureId: string) => {
    setPosModules(posModules.map(m => 
      m.id === moduleId
        ? { ...m, features: m.features.map(f => f.id === featureId ? { ...f, enabled: !f.enabled } : f) }
        : m
    ));
  };

  const handleTogglePMSModule = (moduleId: string) => {
    setPmsModules(pmsModules.map(m => 
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const handleTogglePMSFeature = (moduleId: string, featureId: string) => {
    setPmsModules(pmsModules.map(m => 
      m.id === moduleId
        ? { ...m, features: m.features.map(f => f.id === featureId ? { ...f, enabled: !f.enabled } : f) }
        : m
    ));
  };

  const handleSaveConfig = () => {
    toast.success('Configuration saved successfully');
  };

  const posEnabledCount = posModules.filter(m => m.enabled).length;
  const pmsEnabledCount = pmsModules.filter(m => m.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">System Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Enable or disable modules and features for your system
          </p>
        </div>
        <Button onClick={handleSaveConfig} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{posEnabledCount}/{posModules.length}</div>
              <div className="text-sm text-muted-foreground">POS Modules Enabled</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Bed className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">{pmsEnabledCount}/{pmsModules.length}</div>
              <div className="text-sm text-muted-foreground">PMS Modules Enabled</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="pos" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pos" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Restaurant POS
          </TabsTrigger>
          <TabsTrigger value="pms" className="gap-2">
            <Bed className="h-4 w-4" />
            Hotel PMS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant POS Configuration</CardTitle>
              <CardDescription>
                Configure modules and features for your restaurant point of sale system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {posModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onToggleModule={handleTogglePOSModule}
                    onToggleFeature={handleTogglePOSFeature}
                  />
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hotel PMS Configuration</CardTitle>
              <CardDescription>
                Configure modules and features for your hotel property management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {pmsModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onToggleModule={handleTogglePMSModule}
                    onToggleFeature={handleTogglePMSFeature}
                  />
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
