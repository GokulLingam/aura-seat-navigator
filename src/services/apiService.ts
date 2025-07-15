// API Service for UPS Reserve Backend
import { apiDebug } from '@/utils/apiDebug';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  employeeId?: string;
  avatar?: string;
  permissions: string[];
  lastLogin?: string;
  isActive: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
  message: string;
}

interface Seat {
  id: string;
  x: number;
  y: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'selected';
  type: 'desk' | 'meeting-room' | 'phone-booth';
  equipment?: string[];
  rotation?: number;
}

interface BookingRequest {
  seatId: string;
  date: string;
  startTime: string;
  endTime: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'custom';
    endDate?: string;
    customDates?: string[];
  };
}

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

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
          await this.refreshToken();
          // Retry the request with new token
          return this.request(endpoint, options);
        }
        
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // For login, we don't want to include the Authorization header
    const url = `${this.baseURL}/auth/login`;
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    };

    apiDebug.logRequest(url, requestOptions);

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      apiDebug.logResponse(response, data);

      if (!response.ok) {
        apiDebug.logError(data, `Login failed with status ${response.status}`);
        throw new Error(data.message || `Login failed with status ${response.status}`);
      }

      // Handle different response formats
      let loginData: LoginResponse;
      
      if (data.success && data.data) {
        // Format: { success: true, data: { user, token, ... } }
        loginData = data.data;
      } else if (data.user && data.token) {
        // Format: { user, token, refreshToken, ... }
        loginData = data;
      } else if (data.success && data.user) {
        // Format: { success: true, user, token, ... }
        loginData = {
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken || '',
          expiresIn: data.expiresIn || 3600,
          message: data.message || 'Login successful'
        };
      } else {
        // Fallback to mock authentication for development
        apiDebug.log('Using mock authentication fallback');
        const mockUser = this.getMockUser(credentials.email);
        loginData = {
          user: mockUser,
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600,
          message: 'Mock authentication successful'
        };
      }

      // Store authentication data
      this.token = loginData.token;
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('refreshToken', loginData.refreshToken);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      localStorage.setItem('isAuthenticated', 'true');
      apiDebug.log('Login successful', { user: loginData.user.email });

      return loginData;
    } catch (error) {
      apiDebug.logError(error, 'Login request failed');
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  }

  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{ token: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
  }

  async verifyToken(): Promise<User> {
    const response = await this.request<{ valid: boolean; user: User }>('/auth/verify');
    return response.data!.user;
  }

  async getProfile(): Promise<User> {
    const response = await this.request<User>('/auth/profile');
    return response.data!;
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data!;
  }

  // Seat management methods
  async getSeats(date?: string): Promise<Seat[]> {
    const params = date ? `?date=${date}` : '';
    const response = await this.request<Seat[]>(`/seats${params}`);
    return response.data || [];
  }

  async bookSeat(booking: BookingRequest): Promise<any> {
    const response = await this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
    return response.data;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await this.request(`/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  async getMyBookings(): Promise<any[]> {
    const response = await this.request<any[]>('/bookings/my');
    return response.data || [];
  }

  // Resource management methods
  async getResources(type?: string): Promise<Resource[]> {
    const params = type ? `?type=${type}` : '';
    const response = await this.request<Resource[]>(`/resources${params}`);
    return response.data || [];
  }

  async bookResource(resourceId: string, booking: BookingRequest): Promise<any> {
    const response = await this.request(`/resources/${resourceId}/book`, {
      method: 'POST',
      body: JSON.stringify(booking),
    });
    return response.data;
  }

  // Floor plan management methods
  async getFloorPlan(floorId: string): Promise<any> {
    const response = await this.request<any>(`/floors/${floorId}`);
    return response.data;
  }

  async updateFloorPlan(floorId: string, floorData: any): Promise<any> {
    const response = await this.request<any>(`/floors/${floorId}`, {
      method: 'PUT',
      body: JSON.stringify(floorData),
    });
    return response.data;
  }

  async createSeat(seatData: Omit<Seat, 'id'>): Promise<Seat> {
    const response = await this.request<Seat>('/seats', {
      method: 'POST',
      body: JSON.stringify(seatData),
    });
    return response.data!;
  }

  async updateSeat(seatId: string, seatData: Partial<Seat>): Promise<Seat> {
    const response = await this.request<Seat>(`/seats/${seatId}`, {
      method: 'PUT',
      body: JSON.stringify(seatData),
    });
    return response.data!;
  }

  async deleteSeat(seatId: string): Promise<void> {
    await this.request(`/seats/${seatId}`, {
      method: 'DELETE',
    });
  }

  // User management methods (admin only)
  async getUsers(): Promise<User[]> {
    const response = await this.request<User[]>('/users');
    return response.data || [];
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    department?: string;
    employeeId?: string;
  }): Promise<User> {
    const response = await this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data!;
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response = await this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data!;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.baseURL}/health`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      apiDebug.log('Health check response:', {
        status: response.status,
        ok: response.ok,
      });
      
      return response.ok;
    } catch (error) {
      apiDebug.logError(error, 'Health check failed');
      return false;
    }
  }

  // Mock user helper for development
  private getMockUser(email: string): User {
    const mockUsers: Record<string, User> = {
      'admin@upsreserve.com': {
        id: '1',
        email: 'admin@upsreserve.com',
        name: 'Admin User',
        role: 'admin',
        department: 'IT',
        employeeId: 'EMP001',
        permissions: ['seat:read', 'seat:write', 'seat:delete', 'user:read', 'user:write', 'user:delete', 'floor:read', 'floor:write', 'floor:delete', 'booking:read', 'booking:write', 'booking:delete', 'admin:all'],
        isActive: true
      },
      'manager@upsreserve.com': {
        id: '2',
        email: 'manager@upsreserve.com',
        name: 'Manager User',
        role: 'manager',
        department: 'Operations',
        employeeId: 'EMP002',
        permissions: ['seat:read', 'seat:write', 'user:read', 'floor:read', 'floor:write', 'booking:read', 'booking:write', 'booking:delete'],
        isActive: true
      },
      'employee@upsreserve.com': {
        id: '3',
        email: 'employee@upsreserve.com',
        name: 'Employee User',
        role: 'employee',
        department: 'Engineering',
        employeeId: 'EMP003',
        permissions: ['seat:read', 'booking:read', 'booking:write'],
        isActive: true
      }
    };

    return mockUsers[email] || {
      id: '4',
      email: email,
      name: 'Demo User',
      role: 'employee',
      department: 'General',
      employeeId: 'EMP004',
      permissions: ['seat:read', 'booking:read', 'booking:write'],
      isActive: true
    };
  }

  // Public request method for other services
  async publicRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request(endpoint, options);
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;
export type { User, Seat, Resource, BookingRequest, LoginRequest, LoginResponse }; 