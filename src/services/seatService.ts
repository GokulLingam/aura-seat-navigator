import apiService, { type Seat, type BookingRequest } from './apiService';

export interface SeatBookingData {
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

export interface SeatFilter {
  date?: string;
  equipment?: string[];
  status?: 'available' | 'occupied' | 'selected';
  type?: 'desk' | 'meeting-room' | 'phone-booth';
}

class SeatService {
  // Get all seats with optional filtering
  async getSeats(filter?: SeatFilter): Promise<Seat[]> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.date) {
        params.append('date', filter.date);
      }
      
      if (filter?.equipment && filter.equipment.length > 0) {
        params.append('equipment', filter.equipment.join(','));
      }
      
      if (filter?.status) {
        params.append('status', filter.status);
      }
      
      if (filter?.type) {
        params.append('type', filter.type);
      }
      
      const queryString = params.toString();
      const endpoint = queryString ? `/seats?${queryString}` : '/seats';
      
      return await apiService.getSeats(filter?.date);
    } catch (error) {
      console.error('Failed to fetch seats:', error);
      throw error;
    }
  }

  // Book a seat
  async bookSeat(bookingData: SeatBookingData): Promise<any> {
    try {
      const booking: BookingRequest = {
        seatId: bookingData.seatId,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        recurring: bookingData.recurring,
      };
      
      return await apiService.bookSeat(booking);
    } catch (error) {
      console.error('Failed to book seat:', error);
      throw error;
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      await apiService.cancelBooking(bookingId);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  }

  // Get user's bookings
  async getMyBookings(): Promise<any[]> {
    try {
      return await apiService.getMyBookings();
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      throw error;
    }
  }

  // Create a new seat (admin only)
  async createSeat(seatData: Omit<Seat, 'id'>): Promise<Seat> {
    try {
      return await apiService.createSeat(seatData);
    } catch (error) {
      console.error('Failed to create seat:', error);
      throw error;
    }
  }

  // Update a seat (admin only)
  async updateSeat(seatId: string, seatData: Partial<Seat>): Promise<Seat> {
    try {
      return await apiService.updateSeat(seatId, seatData);
    } catch (error) {
      console.error('Failed to update seat:', error);
      throw error;
    }
  }

  // Delete a seat (admin only)
  async deleteSeat(seatId: string): Promise<void> {
    try {
      await apiService.deleteSeat(seatId);
    } catch (error) {
      console.error('Failed to delete seat:', error);
      throw error;
    }
  }

  // Get seat availability for a specific date range
  async getSeatAvailability(seatId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await apiService.publicRequest<any[]>(`/seats/${seatId}/availability?startDate=${startDate}&endDate=${endDate}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch seat availability:', error);
      throw error;
    }
  }

  // Get seat statistics
  async getSeatStats(date?: string): Promise<any> {
    try {
      const params = date ? `?date=${date}` : '';
      const response = await apiService.publicRequest<any>(`/seats/stats${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch seat statistics:', error);
      throw error;
    }
  }

  // Search seats by criteria
  async searchSeats(query: string, filter?: SeatFilter): Promise<Seat[]> {
    try {
      const params = new URLSearchParams({ q: query });
      
      if (filter?.date) {
        params.append('date', filter.date);
      }
      
      if (filter?.equipment && filter.equipment.length > 0) {
        params.append('equipment', filter.equipment.join(','));
      }
      
      const response = await apiService.publicRequest<Seat[]>(`/seats/search?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to search seats:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const seatService = new SeatService();

export default seatService; 