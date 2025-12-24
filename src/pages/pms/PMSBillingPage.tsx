import { useState, useMemo } from 'react';
import { usePMSStore } from '@/store/pmsStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Receipt, DollarSign, CreditCard, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { FolioEditor } from '@/components/pms/FolioEditor';

export default function PMSBillingPage() {
  const { reservations, guests, getFolio, addFolioCharge, addFolioPayment } = usePMSStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolio, setSelectedFolio] = useState<string | null>(null);

  // Get active reservations (checked_in or confirmed)
  const activeReservations = reservations.filter(r => 
    r.status === 'checked_in' || r.status === 'confirmed'
  );

  const filteredReservations = activeReservations.filter(res => {
    const guest = guests.find(g => g.id === res.guestId);
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      guest?.firstName.toLowerCase().includes(searchLower) ||
      guest?.lastName.toLowerCase().includes(searchLower) ||
      res.confirmationNumber?.toLowerCase().includes(searchLower)
    );
  });

  const selectedReservation = reservations.find(r => r.id === selectedFolio);
  const selectedGuest = selectedReservation ? guests.find(g => g.id === selectedReservation.guestId) : null;
  const currentFolio = selectedReservation ? getFolio(selectedReservation.id) : null;

  const handleAddCharge = (charge: any) => {
    if (selectedFolio) {
      addFolioCharge(selectedFolio, charge);
      toast({ title: 'Charge Added', description: `${charge.description} - $${charge.amount.toFixed(2)}` });
    }
  };

  const handleAddPayment = (amount: number, method: string) => {
    if (selectedFolio) {
      addFolioPayment(selectedFolio, amount, method);
      toast({ title: 'Payment Recorded', description: `$${amount.toFixed(2)} via ${method}` });
    }
  };

  // Calculate totals from all active reservations
  const folioStats = useMemo(() => {
    let totalOutstanding = 0;
    let totalCharges = 0;
    let totalPayments = 0;
    activeReservations.forEach(res => {
      const folio = getFolio(res.id);
      totalOutstanding += folio.balance;
      totalCharges += folio.totalCharges;
      totalPayments += folio.totalPayments;
    });
    return { totalOutstanding, totalCharges, totalPayments };
  }, [activeReservations, getFolio]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Folios</h1>
          <p className="text-muted-foreground">Manage guest charges and payments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">${folioStats.totalOutstanding.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Receipt className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">${folioStats.totalCharges.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Charges</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-500">${folioStats.totalPayments.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by guest name or confirmation number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <div className="grid gap-4">
        {filteredReservations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active reservations found</p>
            </CardContent>
          </Card>
        ) : (
          filteredReservations.map(reservation => {
            const guest = guests.find(g => g.id === reservation.guestId);
            const folio = folios.find(f => f.reservationId === reservation.id);
            const balance = folio?.balance || 0;

            return (
              <Card 
                key={reservation.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedFolio(reservation.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{guest?.firstName} {guest?.lastName}</CardTitle>
                        <CardDescription>
                          {reservation.confirmationNumber} • Room {reservation.roomId?.slice(-3)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={reservation.status === 'checked_in' ? 'default' : 'secondary'}>
                        {reservation.status === 'checked_in' ? 'In-House' : 'Confirmed'}
                      </Badge>
                      <p className={`text-lg font-bold mt-1 ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ${Math.abs(balance).toFixed(2)} {balance > 0 ? 'Due' : balance < 0 ? 'Credit' : ''}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(reservation.checkIn), 'MMM dd')} - {format(new Date(reservation.checkOut), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Receipt className="h-4 w-4" />
                      <span>{folio?.items.length || 0} transactions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Folio Editor Dialog */}
      <Dialog open={!!selectedFolio} onOpenChange={() => setSelectedFolio(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Guest Folio</DialogTitle>
          </DialogHeader>
          {currentFolio && selectedGuest && (
            <FolioEditor
              folio={currentFolio}
              guestName={`${selectedGuest.firstName} ${selectedGuest.lastName}`}
              onAddCharge={handleAddCharge}
              onAddPayment={handleAddPayment}
              onVoidItem={() => {}}
              onTransferItem={() => {}}
              onPrintFolio={() => toast({ title: 'Print', description: 'Printing folio...' })}
              onEmailFolio={() => toast({ title: 'Email', description: 'Sending folio via email...' })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
