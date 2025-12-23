import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Timer,
  Sparkles,
  Wrench,
  MoreHorizontal,
  Play,
  CheckCheck,
  XCircle,
  ClipboardList,
  RefreshCw,
  UserPlus,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

type RoomStatus = 'clean' | 'dirty' | 'in-progress' | 'inspected' | 'maintenance';
type OccupancyStatus = 'vacant' | 'occupied' | 'checkout' | 'checkin';

interface RoomHousekeeping {
  id: string;
  number: string;
  floor: number;
  type: string;
  status: RoomStatus;
  occupancy: OccupancyStatus;
  assignedTo?: string;
  lastCleaned?: string;
  priority: 'normal' | 'high' | 'urgent';
  notes?: string;
  timer?: number;
  checklistCompleted?: number;
  checklistTotal?: number;
}

const mockRooms: RoomHousekeeping[] = [
  { id: '1', number: '101', floor: 1, type: 'Standard', status: 'clean', occupancy: 'occupied', lastCleaned: '10:30 AM', priority: 'normal', checklistCompleted: 8, checklistTotal: 8 },
  { id: '2', number: '102', floor: 1, type: 'Standard', status: 'dirty', occupancy: 'checkout', assignedTo: 'Maria', priority: 'high', checklistCompleted: 0, checklistTotal: 8 },
  { id: '3', number: '103', floor: 1, type: 'Deluxe', status: 'in-progress', occupancy: 'vacant', assignedTo: 'John', timer: 25, priority: 'normal', checklistCompleted: 5, checklistTotal: 10 },
  { id: '4', number: '201', floor: 2, type: 'Standard', status: 'inspected', occupancy: 'vacant', lastCleaned: '9:45 AM', priority: 'normal', checklistCompleted: 8, checklistTotal: 8 },
  { id: '5', number: '202', floor: 2, type: 'Deluxe', status: 'dirty', occupancy: 'checkout', assignedTo: 'Maria', priority: 'urgent', notes: 'VIP arrival at 2PM', checklistCompleted: 0, checklistTotal: 10 },
  { id: '6', number: '203', floor: 2, type: 'Suite', status: 'maintenance', occupancy: 'vacant', priority: 'normal', notes: 'AC repair' },
  { id: '7', number: '301', floor: 3, type: 'Standard', status: 'clean', occupancy: 'occupied', lastCleaned: '11:00 AM', priority: 'normal', checklistCompleted: 8, checklistTotal: 8 },
  { id: '8', number: '302', floor: 3, type: 'Deluxe', status: 'dirty', occupancy: 'checkout', priority: 'high', checklistCompleted: 0, checklistTotal: 10 },
  { id: '9', number: '303', floor: 3, type: 'Suite', status: 'in-progress', occupancy: 'checkin', assignedTo: 'Sarah', timer: 15, priority: 'urgent', checklistCompleted: 8, checklistTotal: 12 },
  { id: '10', number: '304', floor: 3, type: 'Premium Suite', status: 'inspected', occupancy: 'vacant', lastCleaned: '8:30 AM', priority: 'normal', checklistCompleted: 12, checklistTotal: 12 },
];

const staffMembers = ['Maria', 'John', 'Sarah', 'Emily', 'James'];

const defaultChecklist = [
  { id: '1', task: 'Make bed with fresh linens', category: 'Bedroom' },
  { id: '2', task: 'Vacuum carpet/mop floor', category: 'Bedroom' },
  { id: '3', task: 'Dust all surfaces', category: 'Bedroom' },
  { id: '4', task: 'Empty trash bins', category: 'General' },
  { id: '5', task: 'Clean bathroom sink', category: 'Bathroom' },
  { id: '6', task: 'Clean toilet', category: 'Bathroom' },
  { id: '7', task: 'Clean shower/bathtub', category: 'Bathroom' },
  { id: '8', task: 'Replace toiletries', category: 'Bathroom' },
  { id: '9', task: 'Replace towels', category: 'Bathroom' },
  { id: '10', task: 'Check minibar', category: 'Amenities' },
  { id: '11', task: 'Check TV/AC/Lights', category: 'Amenities' },
  { id: '12', task: 'Final inspection', category: 'General' },
];

const statusConfig = {
  'clean': { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Clean' },
  'dirty': { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Dirty' },
  'in-progress': { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'In Progress' },
  'inspected': { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10', label: 'Inspected' },
  'maintenance': { icon: Wrench, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Maintenance' },
};

const occupancyConfig = {
  'vacant': { color: 'text-muted-foreground', border: 'border-muted' },
  'occupied': { color: 'text-success', border: 'border-success/30' },
  'checkout': { color: 'text-warning', border: 'border-warning/30' },
  'checkin': { color: 'text-primary', border: 'border-primary/30' },
};

const priorityConfig = {
  'normal': { color: 'text-muted-foreground' },
  'high': { color: 'text-warning' },
  'urgent': { color: 'text-destructive' },
};

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<RoomHousekeeping[]>(mockRooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<RoomHousekeeping | null>(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.number.includes(searchTerm) || 
      room.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter;
    return matchesSearch && matchesStatus && matchesFloor;
  });

  const stats = {
    clean: rooms.filter(r => r.status === 'clean').length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    inProgress: rooms.filter(r => r.status === 'in-progress').length,
    inspected: rooms.filter(r => r.status === 'inspected').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const handleStatusChange = (roomId: string, newStatus: RoomStatus) => {
    setRooms(rooms.map(r => 
      r.id === roomId ? { 
        ...r, 
        status: newStatus,
        lastCleaned: newStatus === 'clean' || newStatus === 'inspected' ? new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : r.lastCleaned
      } : r
    ));
    toast.success(`Room status updated to ${newStatus}`);
  };

  const handleStartCleaning = (room: RoomHousekeeping) => {
    setRooms(rooms.map(r => 
      r.id === room.id ? { ...r, status: 'in-progress' as const, timer: 0 } : r
    ));
    toast.success(`Started cleaning room ${room.number}`);
  };

  const openChecklist = (room: RoomHousekeeping) => {
    setSelectedRoom(room);
    setCheckedItems([]);
    setIsChecklistOpen(true);
  };

  const openAssignDialog = (room: RoomHousekeeping) => {
    setSelectedRoom(room);
    setSelectedStaff(room.assignedTo || '');
    setIsAssignOpen(true);
  };

  const handleAssignStaff = () => {
    if (!selectedRoom || !selectedStaff) return;
    setRooms(rooms.map(r => 
      r.id === selectedRoom.id ? { ...r, assignedTo: selectedStaff } : r
    ));
    setIsAssignOpen(false);
    toast.success(`${selectedStaff} assigned to room ${selectedRoom.number}`);
  };

  const handleCompleteChecklist = () => {
    if (!selectedRoom) return;
    setRooms(rooms.map(r => 
      r.id === selectedRoom.id ? { 
        ...r, 
        status: 'clean' as const,
        checklistCompleted: checkedItems.length,
        lastCleaned: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      } : r
    ));
    setIsChecklistOpen(false);
    toast.success(`Room ${selectedRoom.number} marked as clean`);
  };

  const handleRefresh = () => {
    toast.success('Room status refreshed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Housekeeping</h1>
          <p className="text-sm text-muted-foreground">
            Room status and cleaning management
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.clean}</div>
              <div className="text-sm text-muted-foreground">Clean</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.dirty}</div>
              <div className="text-sm text-muted-foreground">Dirty</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.inspected}</div>
              <div className="text-sm text-muted-foreground">Inspected</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-background">
              <Wrench className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.maintenance}</div>
              <div className="text-sm text-muted-foreground">Maintenance</div>
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
                placeholder="Search rooms or staff..."
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
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="dirty">Dirty</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="inspected">Inspected</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Room Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredRooms.map((room) => {
          const status = statusConfig[room.status];
          const StatusIcon = status.icon;
          const occupancy = occupancyConfig[room.occupancy];
          const priority = priorityConfig[room.priority];

          return (
            <Card 
              key={room.id} 
              className={cn(
                "cursor-pointer hover:shadow-md transition-shadow",
                room.priority === 'urgent' && "ring-2 ring-destructive/50"
              )}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-lg font-bold">{room.number}</div>
                    <div className="text-xs text-muted-foreground">{room.type}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={cn("text-xs", occupancy.color, occupancy.border)}>
                      {room.occupancy}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="iconSm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openAssignDialog(room)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openChecklist(room)}>
                          <ClipboardList className="h-4 w-4 mr-2" />
                          View Checklist
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(room.id, 'clean')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Clean
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(room.id, 'inspected')}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Mark Inspected
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(room.id, 'dirty')}>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Mark Dirty
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(room.id, 'maintenance')}>
                          <Wrench className="h-4 w-4 mr-2" />
                          Mark Maintenance
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Status */}
                <div className={cn("flex items-center gap-2 p-2 rounded-lg mb-3", status.bg)}>
                  <StatusIcon className={cn("h-4 w-4", status.color)} />
                  <span className={cn("text-sm font-medium", status.color)}>{status.label}</span>
                </div>

                {/* Checklist Progress */}
                {room.checklistTotal && room.status !== 'maintenance' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Checklist</span>
                      <span>{room.checklistCompleted}/{room.checklistTotal}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${((room.checklistCompleted || 0) / room.checklistTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2 text-sm">
                  {room.assignedTo && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>{room.assignedTo}</span>
                    </div>
                  )}
                  {room.timer !== undefined && room.status === 'in-progress' && (
                    <div className="flex items-center gap-2 text-warning">
                      <Timer className="h-3.5 w-3.5" />
                      <span>{room.timer} min</span>
                    </div>
                  )}
                  {room.lastCleaned && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{room.lastCleaned}</span>
                    </div>
                  )}
                </div>

                {/* Priority & Notes */}
                {(room.priority !== 'normal' || room.notes) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    {room.priority !== 'normal' && (
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs mr-2", priority.color)}
                      >
                        {room.priority}
                      </Badge>
                    )}
                    {room.notes && (
                      <span className="text-xs text-muted-foreground">{room.notes}</span>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                {room.status === 'dirty' && (
                  <Button 
                    size="sm" 
                    className="w-full mt-3 gap-2"
                    onClick={() => handleStartCleaning(room)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start Cleaning
                  </Button>
                )}
                {room.status === 'in-progress' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full mt-3 gap-2"
                    onClick={() => openChecklist(room)}
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Complete Checklist
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Checklist Dialog */}
      <Dialog open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cleaning Checklist - Room {selectedRoom?.number}</DialogTitle>
            <DialogDescription>Complete all tasks before marking the room as clean</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {defaultChecklist.slice(0, selectedRoom?.checklistTotal || 8).map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                <Checkbox
                  id={item.id}
                  checked={checkedItems.includes(item.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCheckedItems([...checkedItems, item.id]);
                    } else {
                      setCheckedItems(checkedItems.filter(id => id !== item.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor={item.id} className="cursor-pointer">{item.task}</Label>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChecklistOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCompleteChecklist}
              disabled={checkedItems.length < (selectedRoom?.checklistTotal || 8)}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Complete ({checkedItems.length}/{selectedRoom?.checklistTotal || 8})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Staff - Room {selectedRoom?.number}</DialogTitle>
            <DialogDescription>Select a staff member to assign to this room</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Select Staff Member</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignStaff} disabled={!selectedStaff}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
