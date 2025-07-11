import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Monitor, Wifi, Coffee } from 'lucide-react';

interface Seat {
  id: string;
  x: number;
  y: number;
  status: 'available' | 'occupied' | 'selected';
  type: 'desk' | 'meeting-room' | 'phone-booth';
  equipment?: string[];
}

interface Resource {
  id: string;
  name: string;
  type: 'meeting-room' | 'equipment' | 'amenity';
  x: number;
  y: number;
  capacity?: number;
  status: 'available' | 'booked';
}

const FloorPlan = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Sample floor plan data
  const seats: Seat[] = [
    { id: 'D1', x: 10, y: 10, status: 'available', type: 'desk', equipment: ['Monitor', 'Dock'] },
    { id: 'D2', x: 10, y: 25, status: 'occupied', type: 'desk', equipment: ['Monitor'] },
    { id: 'D3', x: 10, y: 40, status: 'available', type: 'desk', equipment: ['Monitor', 'Dock'] },
    { id: 'D4', x: 25, y: 10, status: 'available', type: 'desk', equipment: ['Monitor'] },
    { id: 'D5', x: 25, y: 25, status: 'available', type: 'desk', equipment: ['Monitor', 'Dock'] },
    { id: 'D6', x: 25, y: 40, status: 'occupied', type: 'desk', equipment: ['Monitor'] },
    { id: 'D7', x: 40, y: 10, status: 'available', type: 'desk', equipment: ['Monitor', 'Dock'] },
    { id: 'D8', x: 40, y: 25, status: 'available', type: 'desk', equipment: ['Monitor'] },
    { id: 'D9', x: 40, y: 40, status: 'available', type: 'desk', equipment: ['Monitor', 'Dock'] },
    { id: 'PB1', x: 65, y: 15, status: 'available', type: 'phone-booth' },
    { id: 'PB2', x: 65, y: 35, status: 'occupied', type: 'phone-booth' },
  ];

  const resources: Resource[] = [
    { id: 'MR1', name: 'Conference Room A', type: 'meeting-room', x: 75, y: 10, capacity: 8, status: 'available' },
    { id: 'MR2', name: 'Meeting Room B', type: 'meeting-room', x: 75, y: 30, capacity: 4, status: 'booked' },
    { id: 'MR3', name: 'Boardroom', type: 'meeting-room', x: 75, y: 50, capacity: 12, status: 'available' },
    { id: 'CAFE', name: 'Coffee Station', type: 'amenity', x: 50, y: 55, status: 'available' },
  ];

  const handleSeatClick = (seatId: string, status: string) => {
    if (status === 'available') {
      setSelectedSeat(selectedSeat === seatId ? null : seatId);
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'occupied') return 'bg-seat-occupied';
    if (seat.id === selectedSeat) return 'bg-seat-selected border-accent';
    return 'bg-seat-available hover:bg-seat-selected';
  };

  const getResourceColor = (resource: Resource) => {
    return resource.status === 'available' ? 'bg-resource-available' : 'bg-resource-booked';
  };

  return (
    <div className="space-y-6">
      {/* Floor Plan Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Office Floor Plan</h2>
          <p className="text-muted-foreground">Select a seat or resource to book</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          />
          <Button variant="golden">
            Book Selected
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-seat-available rounded border"></div>
            <span>Available Desk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-seat-occupied rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-seat-selected rounded border-2 border-accent"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-resource-available rounded"></div>
            <span>Meeting Room Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-resource-booked rounded"></div>
            <span>Meeting Room Booked</span>
          </div>
        </div>
      </Card>

      {/* Interactive Floor Plan */}
      <Card className="p-6 bg-gradient-subtle">
        <div className="relative w-full h-96 bg-background rounded-lg border overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 70">
            {/* Office Layout Background */}
            <rect x="5" y="5" width="90" height="60" fill="transparent" stroke="hsl(var(--border))" strokeWidth="0.5" />
            
            {/* Desk Area */}
            <rect x="7" y="7" width="50" height="45" fill="hsl(var(--muted))" fillOpacity="0.3" rx="2" />
            <text x="32" y="12" textAnchor="middle" fontSize="2" fill="hsl(var(--muted-foreground))">Open Workspace</text>
            
            {/* Meeting Rooms Area */}
            <rect x="70" y="7" width="23" height="45" fill="hsl(var(--secondary))" fillOpacity="0.3" rx="2" />
            <text x="81.5" y="12" textAnchor="middle" fontSize="2" fill="hsl(var(--muted-foreground))">Meeting Rooms</text>
            
            {/* Phone Booths Area */}
            <rect x="60" y="7" width="8" height="45" fill="hsl(var(--accent))" fillOpacity="0.2" rx="1" />
            <text x="64" y="12" textAnchor="middle" fontSize="1.5" fill="hsl(var(--muted-foreground))">Phone</text>
            <text x="64" y="14" textAnchor="middle" fontSize="1.5" fill="hsl(var(--muted-foreground))">Booths</text>

            {/* Render Seats */}
            {seats.map((seat) => (
              <g key={seat.id}>
                <rect
                  x={seat.x - 2}
                  y={seat.y - 2}
                  width="4"
                  height="4"
                  fill={
                    seat.status === 'occupied' 
                      ? 'hsl(var(--seat-occupied))' 
                      : seat.id === selectedSeat 
                        ? 'hsl(var(--seat-selected))'
                        : 'hsl(var(--seat-available))'
                  }
                  stroke={seat.id === selectedSeat ? 'hsl(var(--accent))' : 'hsl(var(--border))'}
                  strokeWidth={seat.id === selectedSeat ? "0.5" : "0.2"}
                  rx="0.5"
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleSeatClick(seat.id, seat.status)}
                />
                <text
                  x={seat.x}
                  y={seat.y + 0.5}
                  textAnchor="middle"
                  fontSize="1.5"
                  fill="hsl(var(--foreground))"
                  className="cursor-pointer pointer-events-none"
                >
                  {seat.id}
                </text>
                {seat.type === 'phone-booth' && (
                  <circle
                    cx={seat.x}
                    cy={seat.y - 3}
                    r="0.5"
                    fill="hsl(var(--accent))"
                  />
                )}
              </g>
            ))}

            {/* Render Resources */}
            {resources.map((resource) => (
              <g key={resource.id}>
                <rect
                  x={resource.x - 3}
                  y={resource.y - 2}
                  width="6"
                  height="4"
                  fill={resource.status === 'available' ? 'hsl(var(--resource-available))' : 'hsl(var(--resource-booked))'}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.2"
                  rx="0.5"
                  className="cursor-pointer transition-all duration-200"
                />
                <text
                  x={resource.x}
                  y={resource.y + 0.5}
                  textAnchor="middle"
                  fontSize="1.2"
                  fill="hsl(var(--foreground))"
                  className="cursor-pointer pointer-events-none"
                >
                  {resource.id}
                </text>
                {resource.capacity && (
                  <text
                    x={resource.x}
                    y={resource.y + 2.5}
                    textAnchor="middle"
                    fontSize="1"
                    fill="hsl(var(--muted-foreground))"
                    className="pointer-events-none"
                  >
                    {resource.capacity}p
                  </text>
                )}
              </g>
            ))}

            {/* Amenities */}
            <circle
              cx="50"
              cy="57"
              r="2"
              fill="hsl(var(--accent))"
              fillOpacity="0.7"
              stroke="hsl(var(--accent))"
              strokeWidth="0.3"
            />
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fontSize="1.2"
              fill="hsl(var(--accent-foreground))"
            >
              ☕
            </text>
          </svg>
        </div>
      </Card>

      {/* Selected Seat Info */}
      {selectedSeat && (
        <Card className="p-4 border-accent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Seat {selectedSeat}</h3>
              <div className="flex gap-2 mt-2">
                {seats.find(s => s.id === selectedSeat)?.equipment?.map((eq, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {eq === 'Monitor' && <Monitor className="w-3 h-3 mr-1" />}
                    {eq === 'Dock' && <Wifi className="w-3 h-3 mr-1" />}
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="golden">
              Book This Seat
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FloorPlan;