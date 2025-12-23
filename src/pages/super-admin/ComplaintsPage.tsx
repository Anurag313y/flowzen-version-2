import { useState } from 'react';
import { useSuperAdminStore, Complaint } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ComplaintsPage() {
  const { complaints, updateComplaintStatus } = useSuperAdminStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const getPriorityColor = (priority: Complaint['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'low':
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'open':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'in_progress':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'resolved':
        return 'bg-success/10 text-success border-success/30';
    }
  };

  const getStatusIcon = (status: Complaint['status']) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const filteredComplaints = complaints.filter((c) =>
    statusFilter === 'all' ? true : c.status === statusFilter
  );

  const handleUpdateStatus = (complaint: Complaint, newStatus: Complaint['status']) => {
    updateComplaintStatus(complaint.id, newStatus, internalNote || undefined);
    toast.success(`Ticket ${complaint.id} marked as ${newStatus.replace('_', ' ')}`);
    setDialogOpen(false);
    setSelectedComplaint(null);
    setInternalNote('');
  };

  const openDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setInternalNote(complaint.internalNotes || '');
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground">Manage client issues and complaints</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-destructive">
                  {complaints.filter((c) => c.status === 'open').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-warning">
                  {complaints.filter((c) => c.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-success">
                  {complaints.filter((c) => c.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No tickets found
            </CardContent>
          </Card>
        ) : (
          filteredComplaints.map((complaint) => (
            <Card key={complaint.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-medium">{complaint.id}</span>
                      <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(complaint.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(complaint.status)}
                          {complaint.status.replace('_', ' ')}
                        </span>
                      </Badge>
                      <Badge variant="outline" className="uppercase text-xs">
                        {complaint.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{complaint.clientName}</h3>
                    <p className="text-muted-foreground mt-1">{complaint.description}</p>
                    {complaint.internalNotes && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Internal Note:
                        </p>
                        <p className="text-sm mt-1">{complaint.internalNotes}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>Created: {format(new Date(complaint.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      {complaint.resolvedAt && (
                        <span>Resolved: {format(new Date(complaint.resolvedAt), 'MMM dd, yyyy HH:mm')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {complaint.status !== 'resolved' && (
                      <>
                        {complaint.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(complaint, 'in_progress')}
                          >
                            Mark In Progress
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-success hover:bg-success/90"
                          onClick={() => openDialog(complaint)}
                        >
                          Mark Resolved
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => openDialog(complaint)}>
                      Add Note
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Note/Resolve Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedComplaint?.status === 'resolved' ? 'Edit Note' : 'Resolve Ticket'}
            </DialogTitle>
            <DialogDescription>
              Add or update internal notes for ticket {selectedComplaint?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Client: {selectedComplaint?.clientName}</p>
              <p className="text-sm text-muted-foreground">{selectedComplaint?.description}</p>
            </div>
            <Textarea
              placeholder="Add internal notes..."
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {selectedComplaint?.status !== 'resolved' && (
              <Button
                className="bg-success hover:bg-success/90"
                onClick={() => selectedComplaint && handleUpdateStatus(selectedComplaint, 'resolved')}
              >
                Mark as Resolved
              </Button>
            )}
            {selectedComplaint?.status === 'resolved' && (
              <Button
                onClick={() => {
                  if (selectedComplaint) {
                    updateComplaintStatus(selectedComplaint.id, 'resolved', internalNote);
                    toast.success('Note updated');
                    setDialogOpen(false);
                  }
                }}
              >
                Save Note
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
