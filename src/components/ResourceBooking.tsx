import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, Monitor, Projector, Coffee, Car, Dumbbell, Wifi } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: 'meeting-room' | 'equipment' | 'amenity' | 'parking';
  capacity?: number;
  features: string[];
  location: string;
  availability: {
    date: string;
    slots: { time: string; available: boolean }[];
  }[];
  image?: string;
  price?: number;
}

const ResourceBooking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Recurring booking state
  const [recurrenceType, setRecurrenceType] = useState<'none' | 'daily' | 'weekly' | 'custom'>('none');
  const [customDates, setCustomDates] = useState<string[]>([]);

  const resources: Resource[] = [
    {
      id: 'MR1',
      name: 'Conference Room Alpha',
      type: 'meeting-room',
      capacity: 10,
      features: ['Projector', 'Whiteboard', 'Video Conference', 'WiFi'],
      location: 'Floor 3, Wing A',
      availability: [
        {
          date: '2024-01-15',
          slots: [
            { time: '09:00-10:00', available: true },
            { time: '10:00-11:00', available: false },
            { time: '11:00-12:00', available: true },
            { time: '14:00-15:00', available: true },
            { time: '15:00-16:00', available: false },
            { time: '16:00-17:00', available: true },
          ]
        }
      ]
    },
    {
      id: 'MR2',
      name: 'Meeting Room Beta',
      type: 'meeting-room',
      capacity: 6,
      features: ['TV Screen', 'Whiteboard', 'WiFi'],
      location: 'Floor 3, Wing B',
      availability: [
        {
          date: '2024-01-15',
          slots: [
            { time: '09:00-10:00', available: true },
            { time: '10:00-11:00', available: true },
            { time: '11:00-12:00', available: false },
            { time: '14:00-15:00', available: true },
            { time: '15:00-16:00', available: true },
            { time: '16:00-17:00', available: false },
          ]
        }
      ]
    },
    {
      id: 'LAP1',
      name: 'MacBook Pro 16"',
      type: 'equipment',
      features: ['M2 Pro Chip', '32GB RAM', '1TB SSD'],
      location: 'IT Equipment Desk',
      availability: [
        {
          date: '2024-01-15',
          slots: [
            { time: '09:00-12:00', available: true },
            { time: '12:00-17:00', available: false },
          ]
        }
      ]
    },
    {
      id: 'CAR1',
      name: 'Parking Space A1',
      type: 'parking',
      features: ['Covered', 'EV Charging', 'Security Camera'],
      location: 'Underground Garage Level 1',
      price: 5,
      availability: [
        {
          date: '2024-01-15',
          slots: [
            { time: 'All Day', available: true },
          ]
        }
      ]
    },
    {
      id: 'GYM1',
      name: 'Fitness Center',
      type: 'amenity',
      capacity: 15,
      features: ['Cardio Equipment', 'Weights', 'Lockers', 'Shower'],
      location: 'Floor 1, Health & Wellness',
      availability: [
        {
          date: '2024-01-15',
          slots: [
            { time: '07:00-09:00', available: true },
            { time: '12:00-14:00', available: true },
            { time: '17:00-19:00', available: false },
          ]
        }
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting-room': return <Users className="w-5 h-5" />;
      case 'equipment': return <Monitor className="w-5 h-5" />;
      case 'amenity': return <Coffee className="w-5 h-5" />;
      case 'parking': return <Car className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'projector': return <Projector className="w-3 h-3" />;
      case 'wifi': return <Wifi className="w-3 h-3" />;
      case 'video conference': return <Monitor className="w-3 h-3" />;
      case 'tv screen': return <Monitor className="w-3 h-3" />;
      case 'cardio equipment': 
      case 'weights': return <Dumbbell className="w-3 h-3" />;
      case 'ev charging': return <Car className="w-3 h-3" />;
      default: return null;
    }
  };

  const filteredResources = resources.filter(resource => 
    filterType === 'all' || resource.type === filterType
  );

  const selectedResourceData = resources.find(r => r.id === selectedResource);
  const availableSlots = selectedResourceData?.availability.find(a => a.date === selectedDate)?.slots || [];

  // Helper function to get availability for a specific resource
  const getResourceAvailability = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource?.availability.find(a => a.date === selectedDate)?.slots || [];
  };

  // Generate time slots for the selected date if not available
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({
        time: `${startTime}-${endTime}`,
        available: Math.random() > 0.3 // Random availability for demo
      });
    }
    return slots;
  };

  // Get or generate slots for the selected resource
  const getAvailableSlots = () => {
    if (selectedResourceData) {
      const existingSlots = selectedResourceData.availability.find(a => a.date === selectedDate)?.slots;
      if (existingSlots && existingSlots.length > 0) {
        return existingSlots;
      }
      // Generate slots if none exist for this date
      return generateTimeSlots();
    }
    return [];
  };

  const currentAvailableSlots = getAvailableSlots();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Resource Booking</h1>
        <p className="text-muted-foreground">Book meeting rooms, equipment, and amenities</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="date">Select Date</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="type">Resource Type</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="meeting-room">Meeting Rooms</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="amenity">Amenities</SelectItem>
              <SelectItem value="parking">Parking</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredResources.map((resource) => (
            <Card 
              key={resource.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedResource === resource.id ? 'ring-2 ring-accent border-accent' : ''
              }`}
              onClick={() => setSelectedResource(resource.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-accent/20 rounded-lg">
                      {getTypeIcon(resource.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{resource.location}</p>
                    </div>
                  </div>
                  {resource.price && (
                    <Badge variant="secondary">${resource.price}/day</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resource.capacity && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Capacity: {resource.capacity} people</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {resource.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {getFeatureIcon(feature)}
                        <span className={getFeatureIcon(feature) ? 'ml-1' : ''}>{feature}</span>
                      </Badge>
                    ))}
                  </div>

                  {/* Availability Preview */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Available slots today: </span>
                    <span className="font-medium">
                      {getResourceAvailability(resource.id).filter(slot => slot.available).length} of {getResourceAvailability(resource.id).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Booking Panel */}
        <div>
          {selectedResource ? (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Book {selectedResourceData?.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Available Time Slots</Label>
                  <div className="space-y-3 mt-2">
                    {/* Morning Slots */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Morning (9:00 AM - 12:00 PM)</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {currentAvailableSlots
                          .filter(slot => {
                            const startHour = parseInt(slot.time.split('-')[0].split(':')[0]);
                            return startHour >= 9 && startHour < 12;
                          })
                          .map((slot, idx) => (
                            <Button
                              key={`morning-${idx}`}
                              variant={selectedSlot === slot.time ? 'default' : 'outline'}
                              size="sm"
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot.time)}
                              className="justify-start"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              {slot.time}
                              {slot.available ? (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  Available
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="ml-auto text-xs">
                                  Booked
                                </Badge>
                              )}
                            </Button>
                          ))}
                      </div>
                    </div>

                    {/* Afternoon Slots */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Afternoon (12:00 PM - 5:00 PM)</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {currentAvailableSlots
                          .filter(slot => {
                            const startHour = parseInt(slot.time.split('-')[0].split(':')[0]);
                            return startHour >= 12 && startHour < 17;
                          })
                          .map((slot, idx) => (
                            <Button
                              key={`afternoon-${idx}`}
                              variant={selectedSlot === slot.time ? 'default' : 'outline'}
                              size="sm"
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot.time)}
                              className="justify-start"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              {slot.time}
                              {slot.available ? (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  Available
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="ml-auto text-xs">
                                  Booked
                                </Badge>
                              )}
                            </Button>
                          ))}
                      </div>
                    </div>

                    {/* Evening Slots (if any) */}
                    {currentAvailableSlots.some(slot => {
                      const startHour = parseInt(slot.time.split('-')[0].split(':')[0]);
                      return startHour >= 17;
                    }) && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Evening (5:00 PM+)</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {currentAvailableSlots
                            .filter(slot => {
                              const startHour = parseInt(slot.time.split('-')[0].split(':')[0]);
                              return startHour >= 17;
                            })
                            .map((slot, idx) => (
                              <Button
                                key={`evening-${idx}`}
                                variant={selectedSlot === slot.time ? 'default' : 'outline'}
                                size="sm"
                                disabled={!slot.available}
                                onClick={() => setSelectedSlot(slot.time)}
                                className="justify-start"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                {slot.time}
                                {slot.available ? (
                                  <Badge variant="secondary" className="ml-auto text-xs">
                                    Available
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="ml-auto text-xs">
                                    Booked
                                  </Badge>
                                )}
                              </Button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="text-sm text-muted-foreground border-t pt-3">
                  <p>
                    <strong>{currentAvailableSlots.filter(slot => slot.available).length}</strong> of{' '}
                    <strong>{currentAvailableSlots.length}</strong> slots available
                  </p>
                </div>

                {selectedSlot && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="text-sm">
                      <p><strong>Resource:</strong> {selectedResourceData?.name}</p>
                      <p><strong>Date:</strong> {selectedDate}</p>
                      <p><strong>Time:</strong> {selectedSlot}</p>
                      {selectedResourceData?.price && (
                        <p><strong>Cost:</strong> ${selectedResourceData.price}</p>
                      )}
                    </div>
                    
                    {/* Recurrence Section */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Recurrence</Label>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          size="sm" 
                          variant={recurrenceType === 'none' ? 'default' : 'outline'} 
                          onClick={() => setRecurrenceType('none')}
                        >
                          None
                        </Button>
                        <Button 
                          size="sm" 
                          variant={recurrenceType === 'daily' ? 'default' : 'outline'} 
                          onClick={() => setRecurrenceType('daily')}
                        >
                          Daily
                        </Button>
                        <Button 
                          size="sm" 
                          variant={recurrenceType === 'weekly' ? 'default' : 'outline'} 
                          onClick={() => setRecurrenceType('weekly')}
                        >
                          Weekly
                        </Button>
                        <Button 
                          size="sm" 
                          variant={recurrenceType === 'custom' ? 'default' : 'outline'} 
                          onClick={() => setRecurrenceType('custom')}
                        >
                          Custom Dates
                        </Button>
                      </div>
                      {recurrenceType === 'custom' && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="date"
                              onChange={e => {
                                const date = e.target.value;
                                if (date && !customDates.includes(date)) setCustomDates([...customDates, date]);
                              }}
                              className="border px-2 py-1 rounded text-xs flex-1"
                            />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {customDates.map(date => (
                              <span key={date} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                {date}
                                <button 
                                  onClick={() => setCustomDates(customDates.filter(d => d !== date))} 
                                  className="ml-1 text-amber-700 hover:text-amber-900"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => {
                        alert(`Resource ${selectedResourceData?.name} booked!\nDate: ${selectedDate}\nTime: ${selectedSlot}\nRecurrence: ${recurrenceType}${recurrenceType === 'custom' ? '\nCustom Dates: ' + customDates.join(', ') : ''}`);
                        setSelectedSlot(null);
                        setRecurrenceType('none');
                        setCustomDates([]);
                      }}
                    >
                      Confirm Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64 text-center">
                <div>
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a resource to view available time slots and book
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceBooking;