import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  category: 'electrical' | 'plumbing' | 'hvac' | 'furniture' | 'equipment' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  reportedBy: string;
  assignedTo: string;
  createdAt: Date;
  completedAt?: Date;
  estimatedCost?: number;
}

const initialRequests: MaintenanceRequest[] = [
  { id: '1', title: 'AC not cooling in Room 201', description: 'Guest complained about AC not providing cold air. Checked settings, seems like refrigerant issue.', location: 'Room 201', category: 'hvac', priority: 'high', status: 'in-progress', reportedBy: 'Front Desk', assignedTo: 'Raj Kumar', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), estimatedCost: 5000 },
  { id: '2', title: 'Leaky faucet in Room 105', description: 'Bathroom sink faucet is dripping constantly', location: 'Room 105', category: 'plumbing', priority: 'medium', status: 'pending', reportedBy: 'Housekeeping', assignedTo: '', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), estimatedCost: 500 },
  { id: '3', title: 'Light bulb replacement - Lobby', description: 'Several ceiling lights in the main lobby need replacement', location: 'Main Lobby', category: 'electrical', priority: 'low', status: 'completed', reportedBy: 'Manager', assignedTo: 'Suresh', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), estimatedCost: 2000 },
  { id: '4', title: 'Broken chair in Restaurant', description: 'One of the dining chairs has a broken leg', location: 'Restaurant', category: 'furniture', priority: 'medium', status: 'pending', reportedBy: 'Restaurant Staff', assignedTo: '', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), estimatedCost: 1500 },
  { id: '5', title: 'Coffee machine malfunction', description: 'Coffee machine in breakfast area showing error E02', location: 'Breakfast Area', category: 'equipment', priority: 'high', status: 'in-progress', reportedBy: 'Kitchen Staff', assignedTo: 'Vendor - Café Solutions', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), estimatedCost: 8000 },
  { id: '6', title: 'Power outlet not working - Room 302', description: 'Guest reported non-functional power outlet near desk', location: 'Room 302', category: 'electrical', priority: 'urgent', status: 'pending', reportedBy: 'Guest', assignedTo: '', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), estimatedCost: 300 },
];

const categoryConfig = {
  'electrical': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Electrical' },
  'plumbing': { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Plumbing' },
  'hvac': { color: 'bg-sky-100 text-sky-700 border-sky-200', label: 'HVAC' },
  'furniture': { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Furniture' },
  'equipment': { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Equipment' },
  'other': { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Other' },
};

const priorityConfig = {
  'low': { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Low' },
  'medium': { color: 'text-primary', bg: 'bg-primary/10', label: 'Medium' },
  'high': { color: 'text-warning', bg: 'bg-warning/10', label: 'High' },
  'urgent': { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Urgent' },
};

const statusConfig = {
  'pending': { icon: Clock, color: 'text-warning bg-warning/10', label: 'Pending' },
  'in-progress': { icon: Wrench, color: 'text-primary bg-primary/10', label: 'In Progress' },
  'completed': { icon: CheckCircle, color: 'text-success bg-success/10', label: 'Completed' },
  'cancelled': { icon: AlertTriangle, color: 'text-muted-foreground bg-muted', label: 'Cancelled' },
};

const technicians = ['Raj Kumar', 'Suresh', 'Mohammed', 'Vendor - Café Solutions', 'Vendor - AC Experts'];

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '', description: '', location: '', category: 'other' as MaintenanceRequest['category'], priority: 'medium' as MaintenanceRequest['priority'], estimatedCost: ''
  });

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    urgent: requests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleAddRequest = () => {
    if (!newRequest.title.trim() || !newRequest.location.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    const request: MaintenanceRequest = {
      id: Date.now().toString(),
      title: newRequest.title,
      description: newRequest.description,
      location: newRequest.location,
      category: newRequest.category,
      priority: newRequest.priority,
      status: 'pending',
      reportedBy: 'Current User',
      assignedTo: '',
      createdAt: new Date(),
      estimatedCost: newRequest.estimatedCost ? parseFloat(newRequest.estimatedCost) : undefined,
    };
    setRequests([request, ...requests]);
    setNewRequest({ title: '', description: '', location: '', category: 'other', priority: 'medium', estimatedCost: '' });
    setIsAddDialogOpen(false);
    toast.success('Maintenance request created');
  };

  const handleUpdateStatus = (id: string, newStatus: MaintenanceRequest['status']) => {
    setRequests(requests.map(r => 
      r.id === id ? { 
        ...r, 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : r.completedAt
      } : r
    ));
    toast.success(`Status updated to ${statusConfig[newStatus].label}`);
  };

  const handleAssign = (id: string, technician: string) => {
    setRequests(requests.map(r => 
      r.id === id ? { ...r, assignedTo: technician, status: 'in-progress' } : r
    ));
    toast.success(`Assigned to ${technician}`);
  };

  const handleDelete = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    toast.success('Request deleted');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Maintenance</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage maintenance requests
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Maintenance Request</DialogTitle>
              <DialogDescription>Report an issue that needs attention</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="e.g., AC not working"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={newRequest.location}
                  onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                  placeholder="e.g., Room 201"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Detailed description of the issue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={newRequest.category} onValueChange={(v) => setNewRequest({ ...newRequest, category: v as MaintenanceRequest['category'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select value={newRequest.priority} onValueChange={(v) => setNewRequest({ ...newRequest, priority: v as MaintenanceRequest['priority'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost">Estimated Cost (optional)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={newRequest.estimatedCost}
                  onChange={(e) => setNewRequest({ ...newRequest, estimatedCost: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddRequest}>Create Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className={cn(stats.urgent > 0 && "ring-2 ring-destructive")}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">{stats.urgent}</div>
            <div className="text-sm text-muted-foreground">Urgent</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => {
                const category = categoryConfig[request.category];
                const priority = priorityConfig[request.priority];
                const status = statusConfig[request.status];
                const StatusIcon = status.icon;

                return (
                  <TableRow key={request.id} className={cn(
                    request.priority === 'urgent' && request.status !== 'completed' && "bg-destructive/5"
                  )}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{request.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{request.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={category.color}>{category.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(priority.color, priority.bg)}>{priority.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.assignedTo || (
                        <Select onValueChange={(v) => handleAssign(request.id, v)}>
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue placeholder="Assign" />
                          </SelectTrigger>
                          <SelectContent>
                            {technicians.map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="iconSm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {request.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(request.id, 'in-progress')}>
                              Start Work
                            </DropdownMenuItem>
                          )}
                          {request.status === 'in-progress' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(request.id, 'completed')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(request.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
