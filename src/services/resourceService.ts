import apiService, { type Resource, type BookingRequest } from './apiService';

export interface ResourceBookingData {
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'custom';
    endDate?: string;
    customDates?: string[];
  };
}

export interface ResourceFilter {
  type?: 'meeting-room' | 'equipment' | 'amenity' | 'parking';
  location?: string;
  capacity?: number;
  features?: string[];
  date?: string;
}

class ResourceService {
  // Get all resources with optional filtering
  async getResources(filter?: ResourceFilter): Promise<Resource[]> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.type) {
        params.append('type', filter.type);
      }
      
      if (filter?.location) {
        params.append('location', filter.location);
      }
      
      if (filter?.capacity) {
        params.append('capacity', filter.capacity.toString());
      }
      
      if (filter?.features && filter.features.length > 0) {
        params.append('features', filter.features.join(','));
      }
      
      if (filter?.date) {
        params.append('date', filter.date);
      }
      
      const queryString = params.toString();
      const endpoint = queryString ? `/resources?${queryString}` : '/resources';
      
      return await apiService.getResources(filter?.type);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      throw error;
    }
  }

  // Book a resource
  async bookResource(bookingData: ResourceBookingData): Promise<any> {
    try {
      const booking: BookingRequest = {
        seatId: bookingData.resourceId, // API uses seatId for both seats and resources
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        recurring: bookingData.recurring,
      };
      
      return await apiService.bookResource(bookingData.resourceId, booking);
    } catch (error) {
      console.error('Failed to book resource:', error);
      throw error;
    }
  }

  // Get resource availability for a specific date
  async getResourceAvailability(resourceId: string, date: string): Promise<any[]> {
    try {
      const response = await apiService.publicRequest<any[]>(`/resources/${resourceId}/availability?date=${date}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch resource availability:', error);
      throw error;
    }
  }

  // Get resource availability for a date range
  async getResourceAvailabilityRange(resourceId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await apiService.publicRequest<any[]>(`/resources/${resourceId}/availability?startDate=${startDate}&endDate=${endDate}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch resource availability range:', error);
      throw error;
    }
  }

  // Get resource details
  async getResourceDetails(resourceId: string): Promise<Resource> {
    try {
      const response = await apiService.publicRequest<Resource>(`/resources/${resourceId}`);
      return response.data!;
    } catch (error) {
      console.error('Failed to fetch resource details:', error);
      throw error;
    }
  }

  // Search resources by criteria
  async searchResources(query: string, filter?: ResourceFilter): Promise<Resource[]> {
    try {
      const params = new URLSearchParams({ q: query });
      
      if (filter?.type) {
        params.append('type', filter.type);
      }
      
      if (filter?.location) {
        params.append('location', filter.location);
      }
      
      if (filter?.capacity) {
        params.append('capacity', filter.capacity.toString());
      }
      
      const response = await apiService.publicRequest<Resource[]>(`/resources/search?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to search resources:', error);
      throw error;
    }
  }

  // Get resource statistics
  async getResourceStats(date?: string): Promise<any> {
    try {
      const params = date ? `?date=${date}` : '';
      const response = await apiService.publicRequest<any>(`/resources/stats${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch resource statistics:', error);
      throw error;
    }
  }

  // Get popular resources
  async getPopularResources(limit: number = 10): Promise<Resource[]> {
    try {
      const response = await apiService.publicRequest<Resource[]>(`/resources/popular?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch popular resources:', error);
      throw error;
    }
  }

  // Get available resources for a specific time slot
  async getAvailableResources(date: string, startTime: string, endTime: string, filter?: ResourceFilter): Promise<Resource[]> {
    try {
      const params = new URLSearchParams({
        date,
        startTime,
        endTime,
      });
      
      if (filter?.type) {
        params.append('type', filter.type);
      }
      
      if (filter?.location) {
        params.append('location', filter.location);
      }
      
      if (filter?.capacity) {
        params.append('capacity', filter.capacity.toString());
      }
      
      const response = await apiService.publicRequest<Resource[]>(`/resources/available?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch available resources:', error);
      throw error;
    }
  }

  // Get resource categories
  async getResourceCategories(): Promise<string[]> {
    try {
      const response = await apiService.publicRequest<string[]>('/resources/categories');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch resource categories:', error);
      throw error;
    }
  }

  // Get resource locations
  async getResourceLocations(): Promise<string[]> {
    try {
      const response = await apiService.publicRequest<string[]>('/resources/locations');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch resource locations:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const resourceService = new ResourceService();

export default resourceService; 