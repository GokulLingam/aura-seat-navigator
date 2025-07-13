import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Monitor, Coffee, Phone, Settings, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Booking {
  id: string;
  type: 'seat' | 'meeting-room' | 'resource';
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  location: string;
}

const BookingDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'history'>('today');

  const bookings: Booking[] = [
    {
      id: 'B001',
      type: 'seat',
      name: 'Desk D5',
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '17:00',
      status: 'confirmed',
      location: 'Floor 3, Open Workspace'
    },
    {
      id: 'B002',
      type: 'meeting-room',
      name: 'Conference Room A',
      date: '2024-01-15',
      startTime: '14:00',
      endTime: '15:30',
      status: 'confirmed',
      location: 'Floor 3, Meeting Area'
    },
    {
      id: 'B003',
      type: 'seat',
      name: 'Phone Booth PB1',
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '11:00',
      status: 'pending',
      location: 'Floor 3, Quiet Zone'
    },
    {
      id: 'B004',
      type: 'meeting-room',
      name: 'Boardroom',
      date: '2024-01-16',
      startTime: '16:00',
      endTime: '17:00',
      status: 'confirmed',
      location: 'Floor 3, Executive Area'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seat': return <Monitor className="w-4 h-4" />;
      case 'meeting-room': return <Users className="w-4 h-4" />;
      case 'resource': return <Coffee className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const today = new Date().toISOString().split('T')[0];
    const bookingDate = booking.date;
    
    switch (activeTab) {
      case 'today':
        return bookingDate === today;
      case 'upcoming':
        return bookingDate > today;
      case 'history':
        return bookingDate < today;
      default:
        return true;
    }
  });

  const stats = {
    totalBookings: bookings.length,
    todayBookings: bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length,
    upcomingBookings: bookings.filter(b => b.date > new Date().toISOString().split('T')[0]).length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
          {user?.role === 'admin' && (
            <Badge variant="secondary" className="text-sm">Administrator</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {user?.role === 'admin' 
            ? 'Manage workspace reservations and system settings' 
            : 'Manage your workspace reservations'
          }
        </p>
      </div>
{/* Booking Tabs */}
<Card>
        <CardHeader>
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {(['today', 'upcoming', 'history'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="flex-1 capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bookings found for {activeTab}
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-accent/20 rounded-lg">
                      {getTypeIcon(booking.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{booking.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.startTime} - {booking.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    {user?.role === 'admin' && (
                    <Button variant="outline" size="sm">
                      Modify
                    </Button>
                    )}
                    <Button variant="destructive" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
            <p className="text-xs text-muted-foreground">Active reservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">Future bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Section - Only visible to admin users */}
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Administrator Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <UserPlus className="w-6 h-6" />
                <span>Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Settings className="w-6 h-6" />
                <span>System Settings</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Calendar className="w-6 h-6" />
                <span>All Bookings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingDashboard;