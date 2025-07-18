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
  private refreshTokenValue: string | null = null;
  private user: User | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
    this.refreshTokenValue = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
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
      let loginData: LoginResponse;
      if (data.success && data.data) {
        loginData = data.data;
      } else if (data.user && data.token) {
        loginData = data;
      } else if (data.success && data.user) {
        loginData = {
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken || '',
          expiresIn: data.expiresIn || 3600,
          message: data.message || 'Login successful'
        };
      } else {
        throw new Error('Unexpected login response format');
      }
      this.token = loginData.token;
      this.refreshTokenValue = loginData.refreshToken;
      this.user = loginData.user;
      // Persist to localStorage
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('refreshToken', loginData.refreshToken);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      localStorage.setItem('isAuthenticated', 'true');
      return loginData;
    } catch (error) {
      apiDebug.logError(error, 'Login failed');
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
      this.refreshTokenValue = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  }

  async refreshToken(): Promise<void> {
    const refreshToken = this.refreshTokenValue;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{ token: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    // Log the raw response
    console.log('refreshToken raw response:', response);

    // Try to access token in both possible locations
    const token = response.data?.token ?? (response as any).token;
    const newRefreshToken = response.data?.refreshToken ?? (response as any).refreshToken;

    if (!token || !newRefreshToken) {
      throw new Error('Token or refreshToken not found in refreshToken response');
    }

    this.token = token;
    this.refreshTokenValue = newRefreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', newRefreshToken);

    // Immediately verify the new token and update user
    const user = await this.verifyToken();
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  async verifyToken(): Promise<User> {
    const response = await this.request<{ valid: boolean; user: User }>('/auth/verify');
    // Log the raw response
    console.log('verifyToken raw response:', response);
    // Try to access user in both possible locations
    if (response.data && response.data.user) {
      return response.data.user;
    } else if ((response as any).user) {
      return (response as any).user;
    } else {
      throw new Error('User not found in verifyToken response');
    }
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

  async cancelUserBooking(bookingId: string): Promise<any> {
    const response = await this.request(`/bookings/${bookingId}`, {
      method: 'DELETE',
    });
    return response.data;
  }

  // User Management Methods (Admin Only)
  async getAllUsers(): Promise<any[]> {
    const response = await this.request<{ users: any[] }>('/admin/users');
    return response.data?.users || [];
  }

  async getActiveUsers(): Promise<any[]> {
    const response = await this.request<{ users: any[] }>('/admin/users/active');
    return response.data?.users || [];
  }

  async getUserById(userId: string): Promise<any> {
    const response = await this.request<{ user: any }>(`/admin/users/${userId}`);
    return response.data?.user;
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    employeeId?: string;
    avatar?: string;
    permissions?: string[];
    isActive?: boolean;
  }): Promise<any> {
    try {
      const response = await this.request<{ user: any }>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response.data?.user;
    } catch (error: any) {
      // Try to extract detailed error message from backend
      let errorMsg = 'Failed to create user';
      if (error?.response) {
        try {
          const data = await error.response.json();
          errorMsg = data.message || data.error || errorMsg;
          if (data.errors) {
            errorMsg += ': ' + Object.values(data.errors).join(', ');
          }
        } catch {}
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      throw new Error(errorMsg);
    }
  }

  async updateUser(userId: string, userData: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    department?: string;
    employeeId?: string;
    avatar?: string;
    permissions?: string[];
    isActive?: boolean;
  }): Promise<any> {
    const response = await this.request<{ user: any }>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data?.user;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async deactivateUser(userId: string): Promise<any> {
    const response = await this.request<{ user: any }>(`/admin/users/${userId}/deactivate`, {
      method: 'PATCH',
    });
    return response.data?.user;
  }

  async activateUser(userId: string): Promise<any> {
    const response = await this.request<{ user: any }>(`/admin/users/${userId}/activate`, {
      method: 'PATCH',
    });
    return response.data?.user;
  }

  async getUsersByRole(role: string): Promise<any[]> {
    const response = await this.request<{ users: any[] }>(`/admin/users/role/${role}`);
    return response.data?.users || [];
  }

  async getUsersByDepartment(department: string): Promise<any[]> {
    const response = await this.request<{ users: any[] }>(`/admin/users/department/${department}`);
    return response.data?.users || [];
  }

  async getAvailableRoles(): Promise<string[]> {
    const response = await this.request<{ roles: string[] }>('/admin/users/roles');
    return response.data?.roles || [];
  }

  async getMyBookings(): Promise<any[]> {
    const response = await this.request<any[]>('/bookings/my');
    return response.data || [];
  }

  async getUserBookingsForDashboard(userId: string): Promise<{
    today: { bookings: any[]; count: number };
    upcoming: { bookings: any[]; count: number };
    history: { bookings: any[]; count: number };
    summary: { totalBookings: number; todayCount: number; upcomingCount: number; historyCount: number };
  }> {
    const response = await this.request<{
      today: { bookings: any[]; count: number };
      upcoming: { bookings: any[]; count: number };
      history: { bookings: any[]; count: number };
      summary: { totalBookings: number; todayCount: number; upcomingCount: number; historyCount: number };
    }>(`/bookings/user/${userId}/dashboard`);
    return response.data || {
      today: { bookings: [], count: 0 },
      upcoming: { bookings: [], count: 0 },
      history: { bookings: [], count: 0 },
      summary: { totalBookings: 0, todayCount: 0, upcomingCount: 0, historyCount: 0 }
    };
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

  // Public request method for other services
  async publicRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request(endpoint, options);
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;
export type { User, Seat, Resource, BookingRequest, LoginRequest, LoginResponse }; 