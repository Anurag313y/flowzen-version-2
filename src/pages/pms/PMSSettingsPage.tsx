import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Clock, Mail, Bell, CreditCard, Globe, Save } from 'lucide-react';

export default function PMSSettingsPage() {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // Property Info
    propertyName: 'Grand Hotel',
    propertyAddress: '123 Main Street, City, State 12345',
    propertyPhone: '+1 (555) 123-4567',
    propertyEmail: 'info@grandhotel.com',
    
    // Timing
    checkInTime: '15:00',
    checkOutTime: '11:00',
    timezone: 'America/New_York',
    
    // Notifications
    emailConfirmations: true,
    emailReminders: true,
    smsNotifications: false,
    
    // Policies
    cancellationHours: 24,
    depositRequired: true,
    depositPercentage: 20,
    
    // Currency
    currency: 'USD',
    taxRate: 12,
  });

  const handleSave = () => {
    toast({ title: 'Settings Saved', description: 'Your PMS settings have been updated' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PMS Settings</h1>
          <p className="text-muted-foreground">Configure your property management system</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="property" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Property Tab */}
        <TabsContent value="property">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Property Information
              </CardTitle>
              <CardDescription>Basic information about your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyName">Property Name</Label>
                  <Input
                    id="propertyName"
                    value={settings.propertyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, propertyName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyPhone">Phone</Label>
                  <Input
                    id="propertyPhone"
                    value={settings.propertyPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, propertyPhone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Address</Label>
                <Input
                  id="propertyAddress"
                  value={settings.propertyAddress}
                  onChange={(e) => setSettings(prev => ({ ...prev, propertyAddress: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyEmail">Email</Label>
                <Input
                  id="propertyEmail"
                  type="email"
                  value={settings.propertyEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, propertyEmail: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Tab */}
        <TabsContent value="timing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Check-in/Check-out Times
              </CardTitle>
              <CardDescription>Configure default timing for reservations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime">Check-in Time</Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={settings.checkInTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, checkInTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOutTime">Check-out Time</Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={settings.checkOutTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, checkOutTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(val) => setSettings(prev => ({ ...prev, timezone: val }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure guest communication preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Confirmations</Label>
                  <p className="text-sm text-muted-foreground">Send email when reservation is confirmed</p>
                </div>
                <Switch
                  checked={settings.emailConfirmations}
                  onCheckedChange={(val) => setSettings(prev => ({ ...prev, emailConfirmations: val }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send reminder email before check-in</p>
                </div>
                <Switch
                  checked={settings.emailReminders}
                  onCheckedChange={(val) => setSettings(prev => ({ ...prev, emailReminders: val }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS for important updates</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(val) => setSettings(prev => ({ ...prev, smsNotifications: val }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Booking Policies
              </CardTitle>
              <CardDescription>Configure reservation and cancellation policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancellationHours">Cancellation Notice (hours)</Label>
                <Input
                  id="cancellationHours"
                  type="number"
                  value={settings.cancellationHours}
                  onChange={(e) => setSettings(prev => ({ ...prev, cancellationHours: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground">Hours before check-in for free cancellation</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Deposit Required</Label>
                  <p className="text-sm text-muted-foreground">Require deposit at time of booking</p>
                </div>
                <Switch
                  checked={settings.depositRequired}
                  onCheckedChange={(val) => setSettings(prev => ({ ...prev, depositRequired: val }))}
                />
              </div>
              {settings.depositRequired && (
                <div className="space-y-2">
                  <Label htmlFor="depositPercentage">Deposit Percentage</Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    value={settings.depositPercentage}
                    onChange={(e) => setSettings(prev => ({ ...prev, depositPercentage: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Settings
              </CardTitle>
              <CardDescription>Configure currency and tax settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={settings.currency} onValueChange={(val) => setSettings(prev => ({ ...prev, currency: val }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
