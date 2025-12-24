import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/pms/DataTable';
import { DateRangePicker } from '@/components/pms/DateRangePicker';
import { ReservationForm } from '@/components/pms/ReservationForm';
import { usePMSStore } from '@/store/pmsStore';
import { format } from 'date-fns';
import { Plus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import type { Reservation } from '@/types/pms';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-500',
  checked_in: 'bg-emerald-500',
  checked_out: 'bg-slate-400',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500',
};

export default function PMSReservationsPage() {
  const navigate = useNavigate();
  const { reservations, createReservation } = usePMSStore();
  const [showForm, setShowForm] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange>();
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  
  const filteredReservations = React.useMemo(() => {
    let result = [...reservations];
    
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    
    if (dateRange?.from) {
      result = result.filter(r => r.checkIn >= dateRange.from!);
    }
    if (dateRange?.to) {
      result = result.filter(r => r.checkIn <= dateRange.to!);
    }
    
    return result.sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime());
  }, [reservations, statusFilter, dateRange]);
  
  const columns: Column<Reservation>[] = [
    { key: 'confirmationNumber', header: 'Confirmation', sortable: true },
    { 
      key: 'guest', 
      header: 'Guest',
      cell: (row) => `${row.guest.firstName} ${row.guest.lastName}`
    },
    { 
      key: 'checkIn', 
      header: 'Check-in',
      sortable: true,
      cell: (row) => format(row.checkIn, 'MMM d, yyyy')
    },
    { 
      key: 'checkOut', 
      header: 'Check-out',
      cell: (row) => format(row.checkOut, 'MMM d, yyyy')
    },
    { key: 'nights', header: 'Nights' },
    { 
      key: 'roomType', 
      header: 'Room Type',
      cell: (row) => <span className="capitalize">{row.roomType}</span>
    },
    { 
      key: 'status', 
      header: 'Status',
      cell: (row) => (
        <Badge className={`${statusColors[row.status]} text-white`}>
          {row.status.replace('_', ' ')}
        </Badge>
      )
    },
    { 
      key: 'totalAmount', 
      header: 'Total',
      cell: (row) => `₹${row.totalAmount.toFixed(2)}`
    },
  ];
  
  const handleCreate = (data: Partial<Reservation>) => {
    createReservation(data);
    toast({ title: 'Reservation created successfully' });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reservations</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <DateRangePicker value={dateRange} onChange={setDateRange} placeholder="Filter by date" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="checked_out">Checked Out</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DataTable
        data={filteredReservations as any}
        columns={columns as any}
        onRowClick={(row) => navigate(`/pms/reservations/${row.id}`)}
        searchPlaceholder="Search by guest name or confirmation..."
      />
      
      <ReservationForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
