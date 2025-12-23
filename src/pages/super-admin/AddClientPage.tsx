import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminStore } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AddClientPage() {
  const navigate = useNavigate();
  const { addClient } = useSuperAdminStore();

  const [formData, setFormData] = useState({
    businessType: '' as 'restaurant' | 'hotel' | 'both' | '',
    businessName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    gstNumber: '',
    latitude: '',
    longitude: '',
    services: [] as ('pos' | 'pms')[],
    subscriptionPlan: '' as '1_year' | '3_year' | '',
    paymentStatus: '' as 'paid' | 'unpaid' | '',
    activationDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleServiceChange = (service: 'pos' | 'pms', checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      services: checked
        ? [...prev.services, service]
        : prev.services.filter((s) => s !== service),
    }));
  };

  const calculateExpiryDate = (activationDate: string, plan: '1_year' | '3_year') => {
    const date = new Date(activationDate);
    date.setFullYear(date.getFullYear() + (plan === '1_year' ? 1 : 3));
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (asDraft: boolean = false) => {
    if (!formData.businessType || !formData.businessName || !formData.ownerName || !formData.ownerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!asDraft && (!formData.subscriptionPlan || !formData.paymentStatus || formData.services.length === 0)) {
      toast.error('Please fill in subscription details');
      return;
    }

    const expiryDate = formData.subscriptionPlan
      ? calculateExpiryDate(formData.activationDate, formData.subscriptionPlan)
      : formData.activationDate;

    addClient({
      businessType: formData.businessType,
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      ownerPhone: formData.ownerPhone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      gstNumber: formData.gstNumber || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      services: formData.services.length > 0 ? formData.services : ['pos'],
      subscriptionPlan: formData.subscriptionPlan || '1_year',
      paymentStatus: formData.paymentStatus || 'unpaid',
      activationDate: formData.activationDate,
      expiryDate: expiryDate,
      status: asDraft ? 'draft' : 'active',
      posEnabled: !asDraft && formData.services.includes('pos'),
      pmsEnabled: !asDraft && formData.services.includes('pms'),
      notes: formData.notes || undefined,
    });

    toast.success(asDraft ? 'Client saved as draft' : 'Client added and activated successfully');
    navigate('/super-admin/clients');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/super-admin/clients')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Client</h1>
          <p className="text-muted-foreground">Register a new restaurant or hotel client</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Basic details about the business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value: 'restaurant' | 'hotel' | 'both') =>
                  setFormData((prev) => ({ ...prev, businessType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="both">Both (Restaurant + Hotel)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                placeholder="e.g., Spice Garden Restaurant"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Phone Number</Label>
                <Input
                  id="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ownerPhone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Email Address *</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, ownerEmail: e.target.value }))}
                placeholder="owner@business.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST / Tax ID (Optional)</Label>
              <Input
                id="gstNumber"
                value={formData.gstNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, gstNumber: e.target.value }))}
                placeholder="29ABCDE1234F1Z5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Business address and location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Street address, building name, etc."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                placeholder="Country"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (Optional)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                  placeholder="12.9716"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (Optional)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                  placeholder="77.5946"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>Select the services to enable</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pos"
                  checked={formData.services.includes('pos')}
                  onCheckedChange={(checked) => handleServiceChange('pos', checked as boolean)}
                />
                <Label htmlFor="pos" className="font-medium">POS (Restaurant)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pms"
                  checked={formData.services.includes('pms')}
                  onCheckedChange={(checked) => handleServiceChange('pms', checked as boolean)}
                />
                <Label htmlFor="pms" className="font-medium">PMS (Hotel)</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Plan and payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                <Select
                  value={formData.subscriptionPlan}
                  onValueChange={(value: '1_year' | '3_year') =>
                    setFormData((prev) => ({ ...prev, subscriptionPlan: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_year">1 Year</SelectItem>
                    <SelectItem value="3_year">3 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value: 'paid' | 'unpaid') =>
                    setFormData((prev) => ({ ...prev, paymentStatus: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activationDate">Activation Date</Label>
              <Input
                id="activationDate"
                type="date"
                value={formData.activationDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, activationDate: e.target.value }))}
              />
            </div>

            {formData.subscriptionPlan && formData.activationDate && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Expiry Date: <strong className="text-foreground">
                    {calculateExpiryDate(formData.activationDate, formData.subscriptionPlan)}
                  </strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
          <CardDescription>Private notes about this client (not visible to client)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any internal remarks or notes..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/super-admin/clients')}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => handleSubmit(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button onClick={() => handleSubmit(false)}>
          <Save className="h-4 w-4 mr-2" />
          Save & Activate
        </Button>
      </div>
    </div>
  );
}
