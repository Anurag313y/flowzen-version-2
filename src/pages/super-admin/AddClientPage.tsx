import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminStore, Branch } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Save, FileText, Plus, Building2, Trash2, MapPin, Phone, Mail, Star } from 'lucide-react';
import { toast } from 'sonner';

interface BranchFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  isMain: boolean;
}

const emptyBranch: BranchFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  phone: '',
  email: '',
  isMain: false,
};

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

  const [branches, setBranches] = useState<BranchFormData[]>([]);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [editingBranchIndex, setEditingBranchIndex] = useState<number | null>(null);
  const [branchForm, setBranchForm] = useState<BranchFormData>(emptyBranch);

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

  const openAddBranchDialog = () => {
    setBranchForm({
      ...emptyBranch,
      isMain: branches.length === 0,
    });
    setEditingBranchIndex(null);
    setBranchDialogOpen(true);
  };

  const openEditBranchDialog = (index: number) => {
    setBranchForm(branches[index]);
    setEditingBranchIndex(index);
    setBranchDialogOpen(true);
  };

  const handleSaveBranch = () => {
    if (!branchForm.name || !branchForm.city) {
      toast.error('Please fill in branch name and city');
      return;
    }

    if (editingBranchIndex !== null) {
      const updated = [...branches];
      updated[editingBranchIndex] = branchForm;
      
      // If setting as main, unset others
      if (branchForm.isMain) {
        updated.forEach((b, i) => {
          if (i !== editingBranchIndex) b.isMain = false;
        });
      }
      
      setBranches(updated);
    } else {
      const newBranches = [...branches, branchForm];
      
      // If setting as main, unset others
      if (branchForm.isMain) {
        newBranches.forEach((b, i) => {
          if (i !== newBranches.length - 1) b.isMain = false;
        });
      }
      
      setBranches(newBranches);
    }

    setBranchDialogOpen(false);
    setBranchForm(emptyBranch);
    setEditingBranchIndex(null);
  };

  const handleDeleteBranch = (index: number) => {
    const wasMain = branches[index].isMain;
    const updated = branches.filter((_, i) => i !== index);
    
    // If deleted branch was main, make first one main
    if (wasMain && updated.length > 0) {
      updated[0].isMain = true;
    }
    
    setBranches(updated);
  };

  const handleSetMainBranch = (index: number) => {
    const updated = branches.map((b, i) => ({
      ...b,
      isMain: i === index,
    }));
    setBranches(updated);
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

    // Create default branch if none added
    const clientBranches: Omit<Branch, 'id' | 'createdAt'>[] = branches.length > 0 
      ? branches.map(b => ({
          name: b.name,
          address: b.address,
          city: b.city,
          state: b.state,
          phone: b.phone,
          email: b.email,
          isMain: b.isMain,
          status: asDraft ? 'inactive' as const : 'active' as const,
        }))
      : [{
          name: 'Main Branch',
          address: formData.address,
          city: formData.city,
          state: formData.state,
          phone: formData.ownerPhone,
          email: formData.ownerEmail,
          isMain: true,
          status: asDraft ? 'inactive' as const : 'active' as const,
        }];

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
      branches: clientBranches.map((b, index) => ({
        ...b,
        id: `BR-NEW-${index + 1}`,
        createdAt: new Date().toISOString().split('T')[0],
      })),
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
            <CardTitle>Primary Location</CardTitle>
            <CardDescription>Main business address</CardDescription>
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

        {/* Branches Section - Full Width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Branches
                </CardTitle>
                <CardDescription>Manage all branches for this client</CardDescription>
              </div>
              <Button onClick={openAddBranchDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {branches.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-2">No branches added yet</p>
                <p className="text-sm text-muted-foreground mb-4">A default branch will be created from the primary location</p>
                <Button variant="outline" size="sm" onClick={openAddBranchDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.map((branch, index) => (
                  <div
                    key={index}
                    className="relative p-4 border rounded-lg hover:border-primary/50 transition-colors group"
                  >
                    {branch.isMain && (
                      <Badge className="absolute -top-2 left-3 bg-primary text-primary-foreground text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Main
                      </Badge>
                    )}
                    <div className="pt-2">
                      <h4 className="font-medium mb-2">{branch.name}</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{branch.city}, {branch.state}</span>
                        </div>
                        {branch.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{branch.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => openEditBranchDialog(index)}
                      >
                        Edit
                      </Button>
                      {!branch.isMain && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleSetMainBranch(index)}
                        >
                          Set Main
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteBranch(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Branch Dialog */}
      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBranchIndex !== null ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
            <DialogDescription>Enter branch details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name *</Label>
              <Input
                id="branchName"
                value={branchForm.name}
                onChange={(e) => setBranchForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Downtown Outlet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchAddress">Address</Label>
              <Textarea
                id="branchAddress"
                value={branchForm.address}
                onChange={(e) => setBranchForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchCity">City *</Label>
                <Input
                  id="branchCity"
                  value={branchForm.city}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchState">State</Label>
                <Input
                  id="branchState"
                  value={branchForm.state}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchPhone">Phone</Label>
                <Input
                  id="branchPhone"
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchEmail">Email</Label>
                <Input
                  id="branchEmail"
                  type="email"
                  value={branchForm.email}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="branch@email.com"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMain"
                checked={branchForm.isMain}
                onCheckedChange={(checked) => setBranchForm(prev => ({ ...prev, isMain: checked as boolean }))}
              />
              <Label htmlFor="isMain">Set as main branch</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBranchDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBranch}>
              {editingBranchIndex !== null ? 'Update' : 'Add'} Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
