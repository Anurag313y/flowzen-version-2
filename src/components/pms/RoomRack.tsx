import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format, addDays, differenceInDays, isSameDay, isWithinInterval } from 'date-fns';
import type { Room, Reservation } from '@/types/pms';
import { ChevronLeft, ChevronRight, User, Calendar, Moon } from 'lucide-react';

interface RoomRackProps {
  rooms: Room[];
  reservations: Reservation[];
  startDate: Date;
  daysToShow?: number;
  onReservationClick?: (reservation: Reservation) => void;
  onCellClick?: (room: Room, date: Date) => void;
  onDragEnd?: (reservationId: string, newRoomId: string, newDate: Date) => void;
  className?: string;
}

const roomTypeColors: Record<string, string> = {
  standard: 'bg-blue-500',
  deluxe: 'bg-purple-500',
  suite: 'bg-amber-500',
  executive: 'bg-emerald-500',
  presidential: 'bg-rose-500',
};

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-500',
  checked_in: 'bg-emerald-500',
  checked_out: 'bg-slate-400',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500',
};

export function RoomRack({
  rooms,
  reservations,
  startDate,
  daysToShow = 14,
  onReservationClick,
  onCellClick,
  onDragEnd,
  className,
}: RoomRackProps) {
  const [viewStart, setViewStart] = React.useState(startDate);
  const [draggedRes, setDraggedRes] = React.useState<string | null>(null);
  
  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(viewStart, i));
  
  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);
  
  const getReservationForCell = (room: Room, date: Date): Reservation | undefined => {
    return reservations.find(res => 
      res.roomId === room.id &&
      (res.status === 'checked_in' || res.status === 'confirmed') &&
      isWithinInterval(date, { start: res.checkIn, end: addDays(res.checkOut, -1) })
    );
  };
  
  const getReservationSpan = (reservation: Reservation, date: Date): number => {
    const endDate = addDays(viewStart, daysToShow);
    const resEnd = reservation.checkOut < endDate ? reservation.checkOut : endDate;
    return Math.max(1, differenceInDays(resEnd, date));
  };
  
  const isReservationStart = (reservation: Reservation, date: Date): boolean => {
    return isSameDay(reservation.checkIn, date) || isSameDay(date, viewStart);
  };
  
  const handleDragStart = (e: React.DragEvent, resId: string) => {
    setDraggedRes(resId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, room: Room, date: Date) => {
    e.preventDefault();
    if (draggedRes && onDragEnd) {
      onDragEnd(draggedRes, room.id, date);
    }
    setDraggedRes(null);
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewStart(d => addDays(d, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewStart(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewStart(d => addDays(d, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Checked In</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-200" />
            <span>Available</span>
          </div>
        </div>
      </div>
      
      {/* Grid */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-muted/50">
                <th className="sticky left-0 z-10 bg-muted/50 border-r p-2 text-left font-medium w-24">
                  Room
                </th>
                {dates.map(date => (
                  <th
                    key={date.toISOString()}
                    className={cn(
                      "p-2 text-center font-medium min-w-[80px] border-r text-xs",
                      isSameDay(date, new Date()) && "bg-primary/10"
                    )}
                  >
                    <div>{format(date, 'EEE')}</div>
                    <div className="text-lg font-semibold">{format(date, 'd')}</div>
                    <div className="text-muted-foreground">{format(date, 'MMM')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(roomsByFloor).map(([floor, floorRooms]) => (
                <React.Fragment key={floor}>
                  <tr className="bg-muted/30">
                    <td colSpan={daysToShow + 1} className="px-3 py-1 font-semibold text-sm">
                      Floor {floor}
                    </td>
                  </tr>
                  {floorRooms.map(room => {
                    let skipCells = 0;
                    
                    return (
                      <tr key={room.id} className="border-t">
                        <td className="sticky left-0 z-10 bg-card border-r p-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-white", roomTypeColors[room.type])}>
                              {room.number}
                            </Badge>
                            <span className="text-xs text-muted-foreground capitalize">
                              {room.type}
                            </span>
                          </div>
                        </td>
                        {dates.map((date, idx) => {
                          if (skipCells > 0) {
                            skipCells--;
                            return null;
                          }
                          
                          const reservation = getReservationForCell(room, date);
                          
                          if (reservation && isReservationStart(reservation, date)) {
                            const span = getReservationSpan(reservation, date);
                            skipCells = span - 1;
                            
                            return (
                              <td
                                key={date.toISOString()}
                                colSpan={span}
                                className="p-1 border-r"
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      draggable
                                      onDragStart={e => handleDragStart(e, reservation.id)}
                                      onClick={() => onReservationClick?.(reservation)}
                                      className={cn(
                                        "rounded-md p-2 cursor-pointer transition-all",
                                        "hover:ring-2 hover:ring-primary",
                                        statusColors[reservation.status],
                                        "text-white text-xs"
                                      )}
                                    >
                                      <div className="font-medium truncate">
                                        {reservation.guest.lastName}, {reservation.guest.firstName.charAt(0)}.
                                      </div>
                                      <div className="flex items-center gap-1 opacity-80">
                                        <Moon className="h-3 w-3" />
                                        {reservation.nights}
                                        <User className="h-3 w-3 ml-1" />
                                        {reservation.adults}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-sm space-y-1">
                                      <div className="font-semibold">
                                        {reservation.guest.firstName} {reservation.guest.lastName}
                                      </div>
                                      <div>
                                        {format(reservation.checkIn, 'MMM d')} - {format(reservation.checkOut, 'MMM d')}
                                      </div>
                                      <div className="capitalize">{reservation.status.replace('_', ' ')}</div>
                                      <div>₹{reservation.totalAmount.toFixed(2)}</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            );
                          }
                          
                          if (reservation) {
                            return null; // Part of existing reservation
                          }
                          
                          return (
                            <td
                              key={date.toISOString()}
                              className={cn(
                                "p-1 border-r hover:bg-accent cursor-pointer transition-colors",
                                isSameDay(date, new Date()) && "bg-primary/5"
                              )}
                              onDragOver={handleDragOver}
                              onDrop={e => handleDrop(e, room, date)}
                              onClick={() => onCellClick?.(room, date)}
                            />
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
