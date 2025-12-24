import { useState } from 'react';
import { usePMSStore } from '@/store/pmsStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Wrench, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';
import { format } from 'date-fns';

const priorityConfig = {
  low: { label: 'Low', color: 'bg-blue-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-500' },
};

const statusConfig = {
  open: { label: 'Open', color: 'bg-red-500', icon: AlertTriangle },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
};

export default function PMSMaintenancePage() {
  const { rooms, maintenanceTickets, createMaintenanceTicket, updateMaintenanceTicket } = usePMSStore();
  const { toast } = useToast();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [newTicket, setNewTicket] = useState({
    roomId: '',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  const filteredTickets = maintenanceTickets.filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (filterPriority !== 'all' && ticket.priority !== filterPriority) return false;
    if (searchQuery) {
      const room = rooms.find(r => r.id === ticket.roomId);
      const searchLower = searchQuery.toLowerCase();
      if (!ticket.title.toLowerCase().includes(searchLower) &&
          !room?.number.toLowerCase().includes(searchLower)) return false;
    }
    return true;
  });

  const handleCreateTicket = () => {
    if (!newTicket.roomId || !newTicket.title) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }
    createMaintenanceTicket({
      roomId: newTicket.roomId,
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      status: 'open',
      createdAt: new Date(),
    });
    toast({ title: 'Ticket Created', description: 'Maintenance ticket has been created' });
    setShowNewTicket(false);
    setNewTicket({ roomId: '', title: '', description: '', priority: 'medium' });
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateMaintenanceTicket(ticketId, { status: newStatus as any });
    toast({ title: 'Status Updated', description: `Ticket status changed to ${statusConfig[newStatus as keyof typeof statusConfig]?.label}` });
  };

  const stats = {
    open: maintenanceTickets.filter(t => t.status === 'open').length,
    inProgress: maintenanceTickets.filter(t => t.status === 'in_progress').length,
    completed: maintenanceTickets.filter(t => t.status === 'resolved').length,
    urgent: maintenanceTickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maintenance Board</h1>
          <p className="text-muted-foreground">Track and manage maintenance tickets</p>
        </div>
        <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Maintenance Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Room *</label>
                <Select value={newTicket.roomId} onValueChange={(val) => setNewTicket(prev => ({ ...prev, roomId: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>Room {room.number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={newTicket.title}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Issue title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the issue..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={newTicket.priority} onValueChange={(val: any) => setNewTicket(prev => ({ ...prev, priority: val }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTicket} className="w-full">Create Ticket</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{stats.open}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-500">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-500">{stats.urgent}</p>
                <p className="text-sm text-muted-foreground">Urgent</p>
              </div>
            </div>
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
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No maintenance tickets found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map(ticket => {
            const room = rooms.find(r => r.id === ticket.roomId);
            const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];
            const status = statusConfig[ticket.status as keyof typeof statusConfig];
            const StatusIcon = status?.icon || AlertTriangle;

            return (
              <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${status?.color}/20`}>
                        <StatusIcon className={`h-5 w-5 ${status?.color?.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{ticket.title}</CardTitle>
                        <CardDescription>Room {room?.number} • Created {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${priority?.color} text-white`}>{priority?.label}</Badge>
                      <Badge variant="outline" className={status?.color?.replace('bg-', 'border-') + ' ' + status?.color?.replace('bg-', 'text-')}>
                        {status?.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{ticket.description || 'No description provided'}</p>
                  <div className="flex gap-2">
                    {ticket.status !== 'completed' && (
                      <>
                        {ticket.status === 'open' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(ticket.id, 'in_progress')}>
                            Start Work
                          </Button>
                        )}
                        {ticket.status === 'in_progress' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(ticket.id, 'completed')}>
                            Mark Complete
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
