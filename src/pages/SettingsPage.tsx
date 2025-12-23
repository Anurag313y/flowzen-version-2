import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Printer,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Users,
  Receipt,
} from 'lucide-react';

interface SettingSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingSection({ icon: Icon, title, description, children }: SettingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your system preferences
        </p>
      </div>

      {/* Outlet Settings */}
      <SettingSection
        icon={Building2}
        title="Outlet Information"
        description="Basic outlet details and configuration"
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outletName">Outlet Name</Label>
              <Input id="outletName" defaultValue="Main Restaurant" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outletType">Outlet Type</Label>
              <Select defaultValue="restaurant">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" defaultValue="123 Main Street, City" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst">GST Number</Label>
              <Input id="gst" defaultValue="22AAAAA0000A1Z5" />
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Printer Settings */}
      <SettingSection
        icon={Printer}
        title="Printer Configuration"
        description="Set up bill and KOT printers"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Bill Printer</p>
              <p className="text-sm text-muted-foreground">Epson TM-T82X</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">KOT Printer</p>
              <p className="text-sm text-muted-foreground">Kitchen Display</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Print Bills</p>
              <p className="text-sm text-muted-foreground">Print bill on payment completion</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </SettingSection>

      {/* Tax Settings */}
      <SettingSection
        icon={Receipt}
        title="Tax & Charges"
        description="Configure taxes and service charges"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>GST Rate (%)</Label>
              <Input type="number" defaultValue="5" />
            </div>
            <div className="space-y-2">
              <Label>Service Charge (%)</Label>
              <Input type="number" defaultValue="5" />
            </div>
            <div className="space-y-2">
              <Label>Rounding</Label>
              <Select defaultValue="nearest">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Nearest Rupee</SelectItem>
                  <SelectItem value="up">Round Up</SelectItem>
                  <SelectItem value="down">Round Down</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tax Inclusive Pricing</p>
              <p className="text-sm text-muted-foreground">Menu prices include tax</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </SettingSection>

      {/* Notification Settings */}
      <SettingSection
        icon={Bell}
        title="Notifications"
        description="Manage alerts and notifications"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Low Stock Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when stock is low</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Order Notifications</p>
              <p className="text-sm text-muted-foreground">Sound alerts for new orders</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Reports</p>
              <p className="text-sm text-muted-foreground">Email daily summary reports</p>
            </div>
            <Switch />
          </div>
        </div>
      </SettingSection>

      {/* Security Settings */}
      <SettingSection
        icon={Shield}
        title="Security & Access"
        description="Manage roles and permissions"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Approval for Voids</p>
              <p className="text-sm text-muted-foreground">Manager approval needed</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Approval for NC</p>
              <p className="text-sm text-muted-foreground">Manager approval for no-charge</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Discount Limits</p>
              <p className="text-sm text-muted-foreground">Max 20% discount without approval</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </div>
      </SettingSection>

      {/* Payment Settings */}
      <SettingSection
        icon={CreditCard}
        title="Payment Methods"
        description="Configure accepted payment methods"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Cash</p>
              <p className="text-sm text-muted-foreground">Accept cash payments</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Card</p>
              <p className="text-sm text-muted-foreground">Credit/Debit cards</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">UPI</p>
              <p className="text-sm text-muted-foreground">UPI payments</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </SettingSection>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">Save Changes</Button>
      </div>
    </div>
  );
}
