import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Monitor, Coffee, Phone, Settings, UserPlus, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiService from '@/services/apiService';

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

interface DashboardData {
  today: { bookings: Booking[]; count: number };
  upcoming: { bookings: Booking[]; count: number };
  history: { bookings: Booking[]; count: number };
  summary: { totalBookings: number; todayCount: number; upcomingCount: number; historyCount: number };
}

const BookingDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'history'>('today');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    today: { bookings: [], count: 0 },
    upcoming: { bookings: [], count: 0 },
    history: { bookings: [], count: 0 },
    summary: { totalBookings: 0, todayCount: 0, upcomingCount: 0, historyCount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user bookings from API
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getUserBookingsForDashboard(user.id);
        
        // Transform backend data to frontend format
        const transformBooking = (booking: any): Booking => ({
          id: booking.id,
          type: booking.bookType?.toLowerCase() || 'seat',
          name: booking.subType || 'Unknown',
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          location: `${booking.officeLocation || ''} ${booking.building || ''} ${booking.floor || ''}`.trim()
        });

        const transformedData: DashboardData = {
          today: {
            bookings: data.today.bookings.map(transformBooking),
            count: data.today.count
          },
          upcoming: {
            bookings: data.upcoming.bookings.map(transformBooking),
            count: data.upcoming.count
          },
          history: {
            bookings: data.history.bookings.map(transformBooking),
            count: data.history.count
          },
          summary: data.summary
        };

        setDashboardData(transformedData);
      } catch (err) {
        console.error('Failed to fetch user bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [user?.id]);

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

  const getCurrentBookings = () => {
    switch (activeTab) {
      case 'today':
        return dashboardData.today.bookings;
      case 'upcoming':
        return dashboardData.upcoming.bookings;
      case 'history':
        return dashboardData.history.bookings;
      default:
        return [];
    }
  };

  const currentBookings = getCurrentBookings();

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await apiService.cancelUserBooking(bookingId);
      // Refresh the data after cancellation
      const data = await apiService.getUserBookingsForDashboard(user?.id || '');
      
      // Transform and update the data
      const transformBooking = (booking: any): Booking => ({
        id: booking.id,
        type: booking.bookType?.toLowerCase() || 'seat',
        name: booking.subType || 'Unknown',
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        location: `${booking.officeLocation || ''} ${booking.building || ''} ${booking.floor || ''}`.trim()
      });

      const transformedData: DashboardData = {
        today: {
          bookings: data.today.bookings.map(transformBooking),
          count: data.today.count
        },
        upcoming: {
          bookings: data.upcoming.bookings.map(transformBooking),
          count: data.upcoming.count
        },
        history: {
          bookings: data.history.bookings.map(transformBooking),
          count: data.history.count
        },
        summary: data.summary
      };

      setDashboardData(transformedData);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
          {user?.role === 'ADMIN' && (
            <Badge variant="secondary" className="text-sm">Administrator</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {user?.role === 'ADMIN' 
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading bookings...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {currentBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings found for {activeTab}
                </div>
              ) : (
                currentBookings.map((booking) => (
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
                    {user?.role === 'ADMIN' && (
                    <Button variant="outline" size="sm">
                      Modify
                    </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={booking.status === 'cancelled'}
                    >
                      {booking.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                    </Button>
                  </div>
                                  </div>
                ))
              )}
            </div>
          )}
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
            <div className="text-2xl font-bold">{dashboardData.summary.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.summary.todayCount}</div>
            <p className="text-xs text-muted-foreground">Active reservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.summary.upcomingCount}</div>
            <p className="text-xs text-muted-foreground">Future bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">History</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.summary.historyCount}</div>
            <p className="text-xs text-muted-foreground">Past bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Section - Only visible to admin users */}
      {user?.role === 'ADMIN' && (
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