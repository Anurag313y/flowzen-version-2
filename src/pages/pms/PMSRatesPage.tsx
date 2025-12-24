import { useState } from 'react';
import { usePMSStore } from '@/store/pmsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, DollarSign, Calendar, Edit, Save } from 'lucide-react';
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';

interface RoomRate {
  roomType: string;
  baseRate: number;
  rates: Record<string, number>;
}

const roomTypes = ['standard', 'deluxe', 'suite', 'presidential'];

const defaultRates: Record<string, number> = {
  standard: 100,
  deluxe: 150,
  suite: 250,
  presidential: 500,
};

export default function PMSRatesPage() {
  const { rooms } = usePMSStore();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(startOfWeek(new Date()));
  const [editingCell, setEditingCell] = useState<{ type: string; date: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [rates, setRates] = useState<Record<string, Record<string, number>>>(() => {
    // Initialize rates for each room type
    const initial: Record<string, Record<string, number>> = {};
    roomTypes.forEach(type => {
      initial[type] = {};
    });
    return initial;
  });

  const daysToShow = 14;
  const dates = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, daysToShow - 1),
  });

  const getRate = (roomType: string, date: Date): number => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return rates[roomType]?.[dateKey] ?? defaultRates[roomType];
  };

  const handleEditStart = (roomType: string, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setEditingCell({ type: roomType, date: dateKey });
    setEditValue(getRate(roomType, date).toString());
  };

  const handleSaveRate = () => {
    if (!editingCell) return;
    const newRate = parseFloat(editValue);
    if (isNaN(newRate) || newRate < 0) {
      toast({ title: 'Invalid Rate', description: 'Please enter a valid rate', variant: 'destructive' });
      return;
    }
    setRates(prev => ({
      ...prev,
      [editingCell.type]: {
        ...prev[editingCell.type],
        [editingCell.date]: newRate,
      },
    }));
    toast({ title: 'Rate Updated', description: `Rate saved for ${editingCell.type} on ${editingCell.date}` });
    setEditingCell(null);
  };

  const handleBulkUpdate = (roomType: string, newRate: number) => {
    const updates: Record<string, number> = {};
    dates.forEach(date => {
      updates[format(date, 'yyyy-MM-dd')] = newRate;
    });
    setRates(prev => ({
      ...prev,
      [roomType]: { ...prev[roomType], ...updates },
    }));
    toast({ title: 'Bulk Update', description: `Updated all ${roomType} rates to ₹${newRate}` });
  };

  // Calculate inventory stats
  const roomsByType = roomTypes.reduce((acc, type) => {
    acc[type] = rooms.filter(r => r.type === type).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rates & Inventory</h1>
          <p className="text-muted-foreground">Manage room rates and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setStartDate(addDays(startDate, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {format(startDate, 'MMM dd')} - {format(addDays(startDate, daysToShow - 1), 'MMM dd, yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={() => setStartDate(addDays(startDate, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Room Type Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roomTypes.map(type => (
          <Card key={type}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground capitalize">{type}</p>
                  <p className="text-2xl font-bold">{roomsByType[type] || 0}</p>
                  <p className="text-xs text-muted-foreground">rooms</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Base Rate</p>
                  <p className="text-lg font-bold text-primary">₹{defaultRates[type]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rate Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rate Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left p-2 border-b font-medium text-muted-foreground w-32">Room Type</th>
                {dates.map(date => (
                  <th key={date.toISOString()} className="p-2 border-b text-center min-w-[80px]">
                    <div className="text-xs text-muted-foreground">{format(date, 'EEE')}</div>
                    <div className="text-sm font-medium">{format(date, 'MMM d')}</div>
                  </th>
                ))}
                <th className="p-2 border-b text-center w-24">Bulk</th>
              </tr>
            </thead>
            <tbody>
              {roomTypes.map(type => (
                <tr key={type} className="hover:bg-muted/50">
                  <td className="p-2 border-b font-medium capitalize">{type}</td>
                  {dates.map(date => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const rate = getRate(type, date);
                    const isEditing = editingCell?.type === type && editingCell?.date === dateKey;
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                      <td 
                        key={dateKey} 
                        className={`p-2 border-b text-center ${isWeekend ? 'bg-muted/30' : ''}`}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-8 w-20 text-center"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveRate()}
                            />
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveRate}>
                              <Save className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                            onClick={() => handleEditStart(type, date)}
                          >
                            ₹{rate}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-2 border-b text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-7">
                          <Edit className="h-3 w-3 mr-1" />
                          Set All
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="capitalize">Bulk Update {type} Rates</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground">
                            Set rate for all {daysToShow} days shown in the calendar.
                          </p>
                          <Input
                            type="number"
                            placeholder="Enter new rate"
                            id={`bulk-${type}`}
                            defaultValue={defaultRates[type]}
                          />
                          <Button 
                            className="w-full"
                            onClick={() => {
                              const input = document.getElementById(`bulk-${type}`) as HTMLInputElement;
                              const newRate = parseFloat(input.value);
                              if (!isNaN(newRate) && newRate > 0) {
                                handleBulkUpdate(type, newRate);
                              }
                            }}
                          >
                            Update All Rates
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/30 rounded" />
              <span className="text-muted-foreground">Weekend</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Click on rate to edit</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
