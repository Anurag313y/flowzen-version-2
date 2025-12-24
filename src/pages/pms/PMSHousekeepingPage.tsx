import { useState } from 'react';
import { usePMSStore } from '@/store/pmsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertCircle, User, BedDouble, Sparkles } from 'lucide-react';

const statusConfig = {
  clean: { label: 'Clean', color: 'bg-green-500', icon: CheckCircle },
  dirty: { label: 'Dirty', color: 'bg-red-500', icon: AlertCircle },
  inspected: { label: 'Inspected', color: 'bg-blue-500', icon: Sparkles },
  out_of_order: { label: 'Out of Order', color: 'bg-gray-500', icon: AlertCircle },
};

const housekeepers = [
  { id: 'hk1', name: 'Maria Garcia' },
  { id: 'hk2', name: 'John Smith' },
  { id: 'hk3', name: 'Sarah Johnson' },
  { id: 'hk4', name: 'Mike Brown' },
];

export default function PMSHousekeepingPage() {
  const { rooms, housekeepingTasks, updateHousekeepingStatus } = usePMSStore();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFloor, setFilterFloor] = useState<string>('all');

  const floors = [...new Set(rooms.map(r => r.floor))].sort();

  const getHousekeepingForRoom = (roomId: string) => {
    return housekeepingTasks.find(h => h.roomId === roomId);
  };

  const filteredRooms = rooms.filter(room => {
    const hk = getHousekeepingForRoom(room.id);
    if (filterStatus !== 'all' && hk?.status !== filterStatus) return false;
    if (filterFloor !== 'all' && room.floor.toString() !== filterFloor) return false;
    return true;
  });

  const handleStatusChange = (roomId: string, newStatus: string) => {
    updateHousekeepingStatus(roomId, newStatus as any);
    toast({
      title: 'Status Updated',
      description: `Room status changed to ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`,
    });
  };

  const stats = {
    clean: rooms.filter(r => r.housekeepingStatus === 'clean').length,
    dirty: rooms.filter(r => r.housekeepingStatus === 'dirty').length,
    inspected: rooms.filter(r => r.housekeepingStatus === 'inspected').length,
    outOfOrder: rooms.filter(r => r.status === 'maintenance').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Housekeeping Board</h1>
          <p className="text-muted-foreground">Manage room cleanliness and assignments</p>
        </div>
        <Button>
          <Sparkles className="h-4 w-4 mr-2" />
          Mark All Inspected
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.clean}</p>
                <p className="text-sm text-muted-foreground">Clean</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{stats.dirty}</p>
                <p className="text-sm text-muted-foreground">Dirty</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-500">{stats.inspected}</p>
                <p className="text-sm text-muted-foreground">Inspected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-500/10 border-gray-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold text-gray-500">{stats.outOfOrder}</p>
                <p className="text-sm text-muted-foreground">Out of Order</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="dirty">Dirty</SelectItem>
                <SelectItem value="inspected">Inspected</SelectItem>
                <SelectItem value="out_of_order">Out of Order</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map(floor => (
                  <SelectItem key={floor} value={floor.toString()}>Floor {floor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Room Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredRooms.map(room => {
          const hk = getHousekeepingForRoom(room.id);
          const status = hk?.status || 'clean';
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.clean;
          const StatusIcon = config.icon;

          return (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">{room.number}</CardTitle>
                  <Badge className={`${config.color} text-white text-xs`}>
                    {config.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{room.type}</p>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BedDouble className="h-3 w-3" />
                  <span>Floor {room.floor}</span>
                </div>
                {hk?.assignedTo && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{housekeepers.find(h => h.id === hk.assignedTo)?.name || 'Unassigned'}</span>
                  </div>
                )}
                <Select
                  value={status}
                  onValueChange={(val) => handleStatusChange(room.id, val)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="dirty">Dirty</SelectItem>
                    <SelectItem value="inspected">Inspected</SelectItem>
                    <SelectItem value="out_of_order">Out of Order</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
