// Mock Authentication Service for Development
// This simulates the API responses for development without requiring a backend

import { User, LoginCredentials, LoginResponse, AuthState } from './authService';

// Mock user data
const MOCK_USERS: Record<string, User> = {
  'admin@upsreserve.com': {
    id: 'user_admin_001',
    email: 'admin@upsreserve.com',
    name: 'Admin User',
    role: 'ADMIN',
    department: 'IT',
    employeeId: 'EMP001',
    avatar: '',
    permissions: [
      'seat:read',
      'seat:write',
      'seat:delete',
      'user:read',
      'user:write',
      'user:delete',
      'floor:read',
      'floor:write',
      'floor:delete',
      'booking:read',
      'booking:write',
      'booking:delete',
      'admin:all'
    ],
    lastLogin: new Date().toISOString(),
    isActive: true
  },
  'manager@upsreserve.com': {
    id: 'user_manager_001',
    email: 'manager@upsreserve.com',
    name: 'Manager User',
    role: 'manager',
    department: 'Operations',
    employeeId: 'EMP002',
    avatar: '',
    permissions: [
      'seat:read',
      'seat:write',
      'user:read',
      'floor:read',
      'floor:write',
      'booking:read',
      'booking:write',
      'booking:delete'
    ],
    lastLogin: new Date().toISOString(),
    isActive: true
  },
  'employee@upsreserve.com': {
    id: 'user_employee_001',
    email: 'employee@upsreserve.com',
    name: 'Employee User',
    role: 'employee',
    department: 'Sales',
    employeeId: 'EMP003',
    avatar: '',
    permissions: [
      'seat:read',
      'booking:read',
      'booking:write'
    ],
    lastLogin: new Date().toISOString(),
    isActive: true
  }
};

// Mock passwords (in real app, these would be hashed)
const MOCK_PASSWORDS: Record<string, string> = {
  'admin@upsreserve.com': 'admin123',
  'manager@upsreserve.com': 'manager123',
  'employee@upsreserve.com': 'employee123'
};

// Generate mock tokens
const generateMockToken = (userId: string, type: 'access' | 'refresh'): string => {
  const payload = {
    userId,
    type,
    exp: type === 'access' 
      ? Math.floor(Date.now() / 1000) + 3600 // 1 hour
      : Math.floor(Date.now() / 1000) + 604800 // 7 days
  };
  return `mock_${type}_${btoa(JSON.stringify(payload))}`;
};

// Simulate API delay
const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API responses
export const mockAuthAPI = {
  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await simulateApiDelay(800);

    const user = MOCK_USERS[credentials.email];
    const correctPassword = MOCK_PASSWORDS[credentials.email];

    if (!user || credentials.password !== correctPassword) {
      throw new Error('Invalid credentials');
    }

    const token = generateMockToken(user.id, 'access');
    const refreshToken = generateMockToken(user.id, 'refresh');

    return {
      success: true,
      user: {
        ...user,
        lastLogin: new Date().toISOString()
      },
      token,
      refreshToken,
      expiresIn: 3600,
      message: 'Login successful'
    };
  },

  // Logout
  async logout(): Promise<{ success: boolean; message: string }> {
    await simulateApiDelay(300);
    return {
      success: true,
      message: 'Logged out successfully'
    };
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    await simulateApiDelay(500);

    try {
      const payload = JSON.parse(atob(refreshToken.replace('mock_refresh_', '')));
      const user = Object.values(MOCK_USERS).find(u => u.id === payload.userId);
      
      if (!user || payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Invalid refresh token');
      }

      const newToken = generateMockToken(user.id, 'access');
      const newRefreshToken = generateMockToken(user.id, 'refresh');

      return {
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  },

  // Verify token
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    await simulateApiDelay(200);

    try {
      const payload = JSON.parse(atob(token.replace('mock_access_', '')));
      const user = Object.values(MOCK_USERS).find(u => u.id === payload.userId);
      
      if (!user || payload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false };
      }

      return {
        valid: true,
        user
      };
    } catch (error) {
      return { valid: false };
    }
  },

  // Get profile
  async getProfile(): Promise<{ user: User }> {
    await simulateApiDelay(300);
    
    // In a real app, this would extract user from token
    // For mock, we'll return a default user
    const user = MOCK_USERS['admin@upsreserve.com'];
    
    return { user };
  },

  // Update profile
  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    await simulateApiDelay(500);
    
    const user = MOCK_USERS['admin@upsreserve.com'];
    const updatedUser = { ...user, ...updates };
    
    // Update the mock user
    MOCK_USERS['admin@upsreserve.com'] = updatedUser;
    
    return { user: updatedUser };
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    await simulateApiDelay(400);

    if (currentPassword !== 'admin123') {
      throw new Error('Current password is incorrect');
    }

    // Update mock password
    MOCK_PASSWORDS['admin@upsreserve.com'] = newPassword;

    return {
      success: true,
      message: 'Password changed successfully'
    };
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await simulateApiDelay(600);

    if (!MOCK_USERS[email]) {
      throw new Error('User not found');
    }

    return {
      success: true,
      message: 'Password reset email sent successfully'
    };
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    await simulateApiDelay(400);

    // Mock token validation
    if (!token || token === 'invalid_token') {
      throw new Error('Invalid reset token');
    }

    return {
      success: true,
      message: 'Password reset successfully'
    };
  },

  // Register user (admin only)
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: User['role'];
    department?: string;
    employeeId?: string;
  }): Promise<{ success: boolean; user: User; message: string }> {
    await simulateApiDelay(800);

    if (MOCK_USERS[userData.email]) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      department: userData.department,
      employeeId: userData.employeeId,
      avatar: '',
      permissions: getPermissionsForRole(userData.role),
      lastLogin: new Date().toISOString(),
      isActive: true
    };

    MOCK_USERS[userData.email] = newUser;
    MOCK_PASSWORDS[userData.email] = userData.password;

    return {
      success: true,
      user: newUser,
      message: 'User registered successfully'
    };
  }
};

// Helper function to get permissions for a role
function getPermissionsForRole(role: User['role']): string[] {
  switch (role) {
    case 'ADMIN':
      return [
        'seat:read',
        'seat:write',
        'seat:delete',
        'user:read',
        'user:write',
        'user:delete',
        'floor:read',
        'floor:write',
        'floor:delete',
        'booking:read',
        'booking:write',
        'booking:delete',
        'admin:all'
      ];
    case 'manager':
      return [
        'seat:read',
        'seat:write',
        'user:read',
        'floor:read',
        'floor:write',
        'booking:read',
        'booking:write',
        'booking:delete'
      ];
    case 'employee':
      return [
        'seat:read',
        'booking:read',
        'booking:write'
      ];
    case 'guest':
      return [
        'seat:read',
        'booking:read'
      ];
    default:
      return [];
  }
}

// Export for use in authService
export default mockAuthAPI; 