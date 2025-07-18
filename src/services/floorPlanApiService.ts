// Floor Plan Booking System API Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
}

interface Floor {
  id: string;
  building_id: string;
  name: string;
  floor_number: number;
  description: string;
  is_active: boolean;
  desk_count?: number;
  available_desks?: number;
  created_at: string;
  updated_at: string;
}

interface FloorLayout {
  floor_id: string;
  layout_data: {
    dimensions: {
      width: number;
      height: number;
      unit?: string;
    };
    desks: Desk[];
    zones?: Zone[];
    amenities?: Amenity[];
  };
  version: number;
  updated_at: string;
}

interface Desk {
  id: string;
  floor_id: string;
  desk_number: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  desk_type: 'standard' | 'standing' | 'collaborative';
  equipment: {
    monitor: boolean;
    keyboard: boolean;
    phone: boolean;
    docking_station?: boolean;
  };
  rotation?: number;
  is_active: boolean;
  current_booking?: Booking | null;
  created_at: string;
  updated_at: string;
}

interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  description: string;
}

interface Amenity {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
  icon: string;
}

interface Booking {
  id: string;
  desk_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  desk?: {
    id: string;
    desk_number: string;
    floor: {
      id: string;
      name: string;
      building: {
        id: string;
        name: string;
      };
    };
  };
}

interface BookingRequest {
  desk_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

interface AvailabilityResponse {
  date: string;
  floor_id: string;
  availability: {
    desk_id: string;
    desk_number: string;
    status: 'available' | 'booked';
    booking?: {
      id: string;
      start_time: string;
      end_time: string;
    };
  }[];
}

class FloorPlanApiService {
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
        throw new Error(data.error?.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Buildings API
  async getBuildings(): Promise<Building[]> {
    const response = await this.request<Building[]>('/buildings');
    return response.data || [];
  }

  async getBuilding(id: string): Promise<Building> {
    const response = await this.request<Building>(`/buildings/${id}`);
    return response.data!;
  }

  async createBuilding(buildingData: Omit<Building, 'id' | 'created_at' | 'updated_at'>): Promise<Building> {
    const response = await this.request<Building>('/buildings', {
      method: 'POST',
      body: JSON.stringify(buildingData),
    });
    return response.data!;
  }

  async updateBuilding(id: string, buildingData: Partial<Building>): Promise<Building> {
    const response = await this.request<Building>(`/buildings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(buildingData),
    });
    return response.data!;
  }

  async deleteBuilding(id: string): Promise<void> {
    await this.request(`/buildings/${id}`, {
      method: 'DELETE',
    });
  }

  // Floors API
  async getFloors(params?: { building_id?: string; active?: boolean }): Promise<Floor[]> {
    const queryParams = new URLSearchParams();
    if (params?.building_id) queryParams.append('building_id', params.building_id);
    if (params?.active !== undefined) queryParams.append('active', params.active.toString());
    
    const endpoint = `/floors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<Floor[]>(endpoint);
    return response.data || [];
  }

  async getFloor(id: string): Promise<Floor> {
    const response = await this.request<Floor>(`/floors/${id}`);
    return response.data!;
  }

  async createFloor(floorData: Omit<Floor, 'id' | 'created_at' | 'updated_at'>): Promise<Floor> {
    const response = await this.request<Floor>('/floors', {
      method: 'POST',
      body: JSON.stringify(floorData),
    });
    return response.data!;
  }

  async updateFloor(id: string, floorData: Partial<Floor>): Promise<Floor> {
    const response = await this.request<Floor>(`/floors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(floorData),
    });
    return response.data!;
  }

  async deleteFloor(id: string): Promise<void> {
    await this.request(`/floors/${id}`, {
      method: 'DELETE',
    });
  }

  // Floor Layout API
  async getFloorLayout(floorId: string): Promise<FloorLayout> {
    const response = await this.request<FloorLayout>(`/floors/${floorId}/layout`);
    return response.data!;
  }

  async updateFloorLayout(floorId: string, layoutData: FloorLayout['layout_data']): Promise<FloorLayout> {
    const response = await this.request<FloorLayout>(`/floors/${floorId}/layout`, {
      method: 'PUT',
      body: JSON.stringify({ layout_data: layoutData }),
    });
    return response.data!;
  }

  // Desks API
  async getDesks(params?: { floor_id?: string; status?: string; desk_type?: string }): Promise<Desk[]> {
    const queryParams = new URLSearchParams();
    if (params?.floor_id) queryParams.append('floor_id', params.floor_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.desk_type) queryParams.append('desk_type', params.desk_type);
    
    const endpoint = `/desks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<Desk[]>(endpoint);
    return response.data || [];
  }

  async getDesk(id: string): Promise<Desk> {
    const response = await this.request<Desk>(`/desks/${id}`);
    return response.data!;
  }

  async createDesk(deskData: Omit<Desk, 'id' | 'created_at' | 'updated_at'>): Promise<Desk> {
    const response = await this.request<Desk>('/desks', {
      method: 'POST',
      body: JSON.stringify(deskData),
    });
    return response.data!;
  }

  async updateDesk(id: string, deskData: Partial<Desk>): Promise<Desk> {
    const response = await this.request<Desk>(`/desks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deskData),
    });
    return response.data!;
  }

  async deleteDesk(id: string): Promise<void> {
    await this.request(`/desks/${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings API
  async getBookings(params?: { user_id?: string; date?: string; desk_id?: string }): Promise<Booking[]> {
    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.desk_id) queryParams.append('desk_id', params.desk_id);
    
    const endpoint = `/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<Booking[]>(endpoint);
    return response.data || [];
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.request<Booking>(`/bookings/${id}`);
    return response.data!;
  }

  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    const response = await this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    return response.data!;
  }

  async updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    const response = await this.request<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
    return response.data!;
  }

  async deleteBooking(id: string): Promise<void> {
    await this.request(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async getAvailability(params: { floor_id: string; date: string }): Promise<AvailabilityResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('floor_id', params.floor_id);
    queryParams.append('date', params.date);
    
    const response = await this.request<AvailabilityResponse>(`/bookings/availability?${queryParams.toString()}`);
    return response.data!;
  }

  // Utility methods
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const floorPlanApiService = new FloorPlanApiService();
export type {
  Building,
  Floor,
  FloorLayout,
  Desk,
  Zone,
  Amenity,
  Booking,
  BookingRequest,
  AvailabilityResponse,
  ApiResponse,
}; 