import React from 'react';
import { RoomRack } from '@/components/pms/RoomRack';
import { ReservationForm } from '@/components/pms/ReservationForm';
import { usePMSStore } from '@/store/pmsStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Reservation, Room } from '@/types/pms';

export default function PMSRoomRackPage() {
  const { rooms, reservations, createReservation, assignRoom } = usePMSStore();
  const [showForm, setShowForm] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  
  const handleCellClick = (room: Room, date: Date) => {
    setSelectedRoom(room);
    setSelectedDate(date);
    setShowForm(true);
  };
  
  const handleDragEnd = (reservationId: string, newRoomId: string, newDate: Date) => {
    assignRoom(reservationId, newRoomId);
    toast({ title: 'Room assignment updated' });
  };
  
  const handleCreate = (data: Partial<Reservation>) => {
    createReservation({
      ...data,
      roomId: selectedRoom?.id,
      room: selectedRoom || undefined,
    });
    toast({ title: 'Reservation created' });
    setShowForm(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Room Rack</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>
      
      <RoomRack
        rooms={rooms}
        reservations={reservations}
        startDate={new Date()}
        daysToShow={14}
        onCellClick={handleCellClick}
        onDragEnd={handleDragEnd}
        onReservationClick={(res) => toast({ title: `Reservation: ${res.confirmationNumber}` })}
      />
      
      <ReservationForm
        open={showForm}
        onClose={() => { setShowForm(false); setSelectedRoom(null); }}
        onSubmit={handleCreate}
        initialData={selectedRoom && selectedDate ? { 
          roomType: selectedRoom.type,
          checkIn: selectedDate 
        } : undefined}
      />
    </div>
  );
}
