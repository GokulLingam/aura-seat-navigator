import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';
import { floorPlanApiService, type Building as BuildingType, type Floor, type Booking } from '@/services/floorPlanApiService';
import FloorPlanNew from '@/components/FloorPlanNew';
import { useAuth } from '@/hooks/useAuth';

const FloorPlanBookingPage: React.FC = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<BuildingType[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load buildings on component mount
  useEffect(() => {
    loadBuildings();
  }, []);

  // Load floors when building changes
  useEffect(() => {
    if (selectedBuilding) {
      loadFloors(selectedBuilding);
    } else {
      setFloors([]);
      setSelectedFloor('');
    }
  }, [selectedBuilding]);

  // Load user's bookings when date changes
  useEffect(() => {
    if (user) {
      loadMyBookings();
    }
  }, [selectedDate, user]);

  const loadBuildings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const buildingsData = await floorPlanApiService.getBuildings();
      setBuildings(buildingsData);
      
      // Auto-select first building if available
      if (buildingsData.length > 0 && !selectedBuilding) {
        setSelectedBuilding(buildingsData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load buildings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFloors = async (buildingId: string) => {
    try {
      setError(null);
      const floorsData = await floorPlanApiService.getFloors({ building_id: buildingId, active: true });
      setFloors(floorsData);
      
      // Auto-select first floor if available
      if (floorsData.length > 0) {
        setSelectedFloor(floorsData[0].id);
      } else {
        setSelectedFloor('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load floors');
    }
  };

  const loadMyBookings = async () => {
    if (!user) return;
    
    try {
      setIsLoadingBookings(true);
      const bookings = await floorPlanApiService.getBookings({ 
        user_id: user.id, 
        date: selectedDate 
      });
      setMyBookings(bookings);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleBookingCreated = (booking: Booking) => {
    setSuccessMessage(`Successfully booked desk ${booking.desk?.desk_number} for ${new Date(booking.start_time).toLocaleDateString()}`);
    setTimeout(() => setSuccessMessage(null), 5000);
    loadMyBookings(); // Refresh bookings
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await floorPlanApiService.deleteBooking(bookingId);
      setSuccessMessage('Booking cancelled successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
      loadMyBookings(); // Refresh bookings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Floor Plan Booking</h1>
          <p className="text-gray-600 mt-2">Select a building and floor to view available desks</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Controls and My Bookings */}
        <div className="space-y-6">
          {/* Selection Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Select Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="building">Building</Label>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="floor">Floor</Label>
                <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id}>
                        {floor.name} (Floor {floor.floor_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* My Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : myBookings.length === 0 ? (
                <p className="text-gray-500 text-sm">No bookings for this date</p>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          Desk {booking.desk?.desk_number}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.desk?.floor.name}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {selectedFloor && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Floor Stats</CardTitle>
              </CardHeader>
              <CardContent>
                {floors.find(f => f.id === selectedFloor) && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Desks:</span>
                      <span className="font-medium">{floors.find(f => f.id === selectedFloor)?.desk_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Available:</span>
                      <span className="font-medium text-green-600">
                        {floors.find(f => f.id === selectedFloor)?.available_desks || 0}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content - Floor Plan */}
        <div className="lg:col-span-2">
          {selectedFloor ? (
            <FloorPlanNew
              floorId={selectedFloor}
              selectedDate={selectedDate}
              onBookingCreated={handleBookingCreated}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a building and floor to view the floor plan</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloorPlanBookingPage; 