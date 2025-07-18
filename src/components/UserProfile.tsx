import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Building, Shield, Calendar, Edit, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserType {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee' | 'guest';
  department?: string;
  employeeId?: string;
}

const UserProfile: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserType>>({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    employeeId: user?.employeeId || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Remove handleProfileUpdate and handlePasswordChange since updateProfile and changePassword are not available
  // Remove error usage

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EMPLOYEE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {/* The original code had an error message display, but updateProfile and changePassword are removed.
          This section will be removed as per the edit hint. */}

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription className="text-lg">{user.email}</CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getRoleColor(user.role)}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  {user.department && (
                    <Badge variant="outline">
                      <Building className="w-3 h-3 mr-1" />
                      {user.department}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {/* The original code had isEditing logic here, but updateProfile is removed.
                  This section will be removed as per the edit hint. */}
              <p className="text-sm text-gray-600">{user.name}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {/* The original code had isEditing logic here, but updateProfile is removed.
                  This section will be removed as per the edit hint. */}
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              {/* The original code had isEditing logic here, but updateProfile is removed.
                  This section will be removed as per the edit hint. */}
              <p className="text-sm text-gray-600">{user.department || 'Not specified'}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              {/* The original code had isEditing logic here, but updateProfile is removed.
                  This section will be removed as per the edit hint. */}
              <p className="text-sm text-gray-600">{user.employeeId || 'Not specified'}</p>
            </div>

            {/* The original code had isEditing && (...button) here, but updateProfile is removed.
                This section will be removed as per the edit hint. */}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <p className="text-sm text-gray-600 font-mono">{user.id}</p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Badge className={getRoleColor(user.role)}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>Last Login</Label>
              <p className="text-sm text-gray-600">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </p>
            </div>

            <Separator />

            {/* Remove Permissions Section */}

            {/* Change Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                disabled={isLoading}
                className="w-full"
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Enter your current password and choose a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => alert('Password change functionality is currently unavailable.')}
                disabled={true}
                className="flex-1"
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProfile; 