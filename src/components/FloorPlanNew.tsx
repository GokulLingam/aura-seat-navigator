import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar, Clock, MapPin, Monitor, Keyboard, Phone, Wifi, Coffee, Printer } from 'lucide-react';
import { floorPlanApiService, type Floor, type FloorLayout, type Desk, type Booking, type BookingRequest } from '@/services/floorPlanApiService';
import { useAuth } from '@/hooks/useAuth';

interface FloorPlanNewProps {
  floorId: string;
  selectedDate?: string;
  onBookingCreated?: (booking: Booking) => void;
}

const FloorPlanNew: React.FC<FloorPlanNewProps> = ({ 
  floorId, 
  selectedDate = new Date().toISOString().split('T')[0],
  onBookingCreated 
}) => {
  const { user } = useAuth();
  const [floor, setFloor] = useState<Floor | null>(null);
  const [layout, setLayout] = useState<FloorLayout | null>(null);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<Partial<BookingRequest>>({
    start_time: '',
    end_time: '',
    notes: ''
  });
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // Load floor and layout data
  const loadFloorData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [floorData, layoutData] = await Promise.all([
        floorPlanApiService.getFloor(floorId),
        floorPlanApiService.getFloorLayout(floorId)
      ]);
      
      setFloor(floorData);
      setLayout(layoutData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load floor data');
    } finally {
      setIsLoading(false);
    }
  }, [floorId]);

  useEffect(() => {
    loadFloorData();
  }, [loadFloorData]);

  // Handle desk selection
  const handleDeskClick = (desk: Desk) => {
    setSelectedDesk(desk);
    setIsBookingDialogOpen(true);
  };

  // Handle booking creation
  const handleCreateBooking = async () => {
    if (!selectedDesk || !bookingData.start_time || !bookingData.end_time) {
      return;
    }

    try {
      setIsCreatingBooking(true);
      
      const bookingRequest: BookingRequest = {
        desk_id: selectedDesk.id,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        notes: bookingData.notes
      };

      const newBooking = await floorPlanApiService.createBooking(bookingRequest);
      
      setIsBookingDialogOpen(false);
      setSelectedDesk(null);
      setBookingData({ start_time: '', end_time: '', notes: '' });
      
      // Reload floor data to update desk status
      await loadFloorData();
      
      onBookingCreated?.(newBooking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Get desk status color
  const getDeskStatusColor = (desk: Desk) => {
    switch (desk.status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'occupied':
        return 'bg-red-500 hover:bg-red-600';
      case 'reserved':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'maintenance':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  // Get desk status text
  const getDeskStatusText = (desk: Desk) => {
    switch (desk.status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'reserved':
        return 'Reserved';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Unknown';
    }
  };

  // Get equipment icon
  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'monitor':
        return <Monitor className="w-3 h-3" />;
      case 'keyboard':
        return <Keyboard className="w-3 h-3" />;
      case 'phone':
        return <Phone className="w-3 h-3" />;
      case 'wifi':
        return <Wifi className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!floor || !layout) {
    return (
      <Alert>
        <AlertDescription>No floor data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Floor Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {floor.name}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Floor {floor.floor_number}</span>
            <span>•</span>
            <span>{layout.layout_data.desks.length} desks</span>
            <span>•</span>
            <span>{layout.layout_data.desks.filter(d => d.status === 'available').length} available</span>
          </div>
        </CardHeader>
      </Card>

      {/* Floor Plan Canvas */}
      <Card>
        <CardContent className="p-6">
          <div 
            className="relative border border-gray-200 rounded-lg overflow-hidden"
            style={{
              width: layout.layout_data.dimensions.width,
              height: layout.layout_data.dimensions.height,
              maxWidth: '100%',
              maxHeight: '600px'
            }}
          >
            {/* Zones */}
            {layout.layout_data.zones?.map((zone) => (
              <div
                key={zone.id}
                className="absolute border-2 border-dashed rounded"
                style={{
                  left: zone.x,
                  top: zone.y,
                  width: zone.width,
                  height: zone.height,
                  backgroundColor: zone.color + '20',
                  borderColor: zone.color
                }}
                title={zone.description}
              >
                <div className="absolute top-1 left-2 text-xs font-medium text-gray-700">
                  {zone.name}
                </div>
              </div>
            ))}

            {/* Desks */}
            {layout.layout_data.desks.map((desk) => (
              <div
                key={desk.id}
                className={`absolute cursor-pointer transition-all duration-200 rounded border-2 ${
                  desk.status === 'available' ? 'hover:scale-105' : ''
                } ${getDeskStatusColor(desk)}`}
                style={{
                  left: desk.x_position,
                  top: desk.y_position,
                  width: desk.width,
                  height: desk.height,
                  transform: desk.rotation ? `rotate(${desk.rotation}deg)` : undefined
                }}
                onClick={() => desk.status === 'available' && handleDeskClick(desk)}
                title={`${desk.desk_number} - ${getDeskStatusText(desk)}`}
              >
                <div className="flex flex-col items-center justify-center h-full text-white text-xs font-medium">
                  <span>{desk.desk_number}</span>
                  <div className="flex gap-1 mt-1">
                    {desk.equipment.monitor && getEquipmentIcon('monitor')}
                    {desk.equipment.keyboard && getEquipmentIcon('keyboard')}
                    {desk.equipment.phone && getEquipmentIcon('phone')}
                  </div>
                </div>
              </div>
            ))}

            {/* Amenities */}
            {layout.layout_data.amenities?.map((amenity) => (
              <div
                key={amenity.id}
                className="absolute bg-blue-100 border border-blue-300 rounded p-2 cursor-pointer hover:bg-blue-200"
                style={{
                  left: amenity.x,
                  top: amenity.y
                }}
                title={amenity.name}
              >
                <div className="flex items-center gap-1 text-xs text-blue-700">
                  {amenity.type === 'coffee_machine' && <Coffee className="w-3 h-3" />}
                  {amenity.type === 'printer' && <Printer className="w-3 h-3" />}
                  <span>{amenity.name}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm">Maintenance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Desk {selectedDesk?.desk_number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={bookingData.start_time}
                  onChange={(e) => setBookingData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={bookingData.end_time}
                  onChange={(e) => setBookingData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requirements or notes..."
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCreateBooking}
                disabled={isCreatingBooking || !bookingData.start_time || !bookingData.end_time}
                className="flex-1"
              >
                {isCreatingBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Book Desk'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBookingDialogOpen(false)}
                disabled={isCreatingBooking}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FloorPlanNew; 