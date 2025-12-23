import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, CreditCard, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState({
    // POS Pricing
    posOneYear: 15000,
    posThreeYear: 36000,
    // PMS Pricing
    pmsOneYear: 20000,
    pmsThreeYear: 48000,
    // POS + PMS (Both) Pricing
    bothOneYear: 30000,
    bothThreeYear: 72000,
    // Other settings
    taxPercent: 18,
    currency: 'INR',
    expiryAlertDays: 10,
    emailNotifications: true,
    autoSuspendOnExpiry: true,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings</p>
      </div>

      <div className="grid gap-6">
        {/* Subscription Pricing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Subscription Pricing</CardTitle>
            </div>
            <CardDescription>Set subscription plan prices for each service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* POS Pricing */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                POS (Restaurant)
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="posOneYear">1 Year Plan (₹)</Label>
                  <Input
                    id="posOneYear"
                    type="number"
                    value={settings.posOneYear}
                    onChange={(e) => setSettings({ ...settings, posOneYear: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posThreeYear">3 Year Plan (₹)</Label>
                  <Input
                    id="posThreeYear"
                    type="number"
                    value={settings.posThreeYear}
                    onChange={(e) => setSettings({ ...settings, posThreeYear: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* PMS Pricing */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-blue-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                PMS (Hotel)
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="pmsOneYear">1 Year Plan (₹)</Label>
                  <Input
                    id="pmsOneYear"
                    type="number"
                    value={settings.pmsOneYear}
                    onChange={(e) => setSettings({ ...settings, pmsOneYear: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pmsThreeYear">3 Year Plan (₹)</Label>
                  <Input
                    id="pmsThreeYear"
                    type="number"
                    value={settings.pmsThreeYear}
                    onChange={(e) => setSettings({ ...settings, pmsThreeYear: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* POS + PMS Pricing */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-violet-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                POS + PMS (Both)
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="bothOneYear">1 Year Plan (₹)</Label>
                  <Input
                    id="bothOneYear"
                    type="number"
                    value={settings.bothOneYear}
                    onChange={(e) => setSettings({ ...settings, bothOneYear: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bothThreeYear">3 Year Plan (₹)</Label>
                  <Input
                    id="bothThreeYear"
                    type="number"
                    value={settings.bothThreeYear}
                    onChange={(e) => setSettings({ ...settings, bothThreeYear: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Tax & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxPercent">Tax / GST (%)</Label>
                <Input
                  id="taxPercent"
                  type="number"
                  value={settings.taxPercent}
                  onChange={(e) => setSettings({ ...settings, taxPercent: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Configure alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiryAlertDays">Expiry Alert Days</Label>
                <Input
                  id="expiryAlertDays"
                  type="number"
                  value={settings.expiryAlertDays}
                  onChange={(e) => setSettings({ ...settings, expiryAlertDays: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Show expiry warnings this many days before subscription ends
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive email alerts for important events</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Rules */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>System Rules</CardTitle>
              </div>
              <CardDescription>Automated system behaviors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label>Auto-suspend on Expiry</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically suspend client services when subscription expires
                  </p>
                </div>
                <Switch
                  checked={settings.autoSuspendOnExpiry}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoSuspendOnExpiry: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
