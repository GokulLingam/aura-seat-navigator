import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Settings, 
  BarChart3, 
  Shield, 
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import UserManagement from '@/components/UserManagement';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');

  const adminFeatures = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      color: 'bg-green-500',
      features: ['Create Users', 'Assign Roles', 'Manage Permissions', 'User Analytics']
    },
    {
      title: 'Booking Management',
      description: 'Oversee all bookings and reservations',
      icon: Calendar,
      color: 'bg-purple-500',
      features: ['View All Bookings', 'Cancel Bookings', 'Booking Reports', 'Conflict Resolution']
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      color: 'bg-orange-500',
      features: ['Office Locations', 'Working Hours', 'Holiday Calendar', 'System Preferences']
    },
    {
      title: 'Analytics & Reports',
      description: 'View detailed analytics and reports',
      icon: BarChart3,
      color: 'bg-red-500',
      features: ['Usage Statistics', 'Occupancy Reports', 'Trend Analysis', 'Export Data']
    },
    {
      title: 'Security & Access',
      description: 'Manage security settings and access control',
      icon: Shield,
      color: 'bg-indigo-500',
      features: ['Access Logs', 'Security Settings', 'Backup Management', 'Audit Trails']
    }
  ];

  const quickActions = [
    { label: 'Manage Users', icon: Users, path: '/admin/users' },
    { label: 'View Reports', icon: BarChart3, path: '/reports' },
    { label: 'System Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {user?.role === 'ADMIN' && <TabsTrigger value="users">Manage Users</TabsTrigger>}
        </TabsList>
        <TabsContent value="overview">
          {/* Admin Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name}. Manage your office space and users from here.
              </p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              👑 Administrator
            </Badge>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Admin Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 hover:bg-purple-50"
                    >
                      Manage {feature.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-green-600">System Uptime</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-blue-600">Active Users</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">89%</div>
                  <div className="text-sm text-purple-600">Seat Occupancy</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-orange-600">Pending Actions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {user?.role === 'ADMIN' && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminDashboard; 