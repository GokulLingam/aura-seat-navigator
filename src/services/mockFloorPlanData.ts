// Mock data for floor plan booking system
import type { Building, Floor, FloorLayout, Desk, Zone, Amenity } from './floorPlanApiService';

export const mockBuildings: Building[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Tech Campus Building A',
    address: '123 Innovation Drive',
    city: 'San Francisco',
    country: 'USA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Downtown Office',
    address: '456 Business Ave',
    city: 'New York',
    country: 'USA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockFloors: Floor[] = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    building_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'First Floor',
    floor_number: 1,
    description: 'Main workspace with open plan layout',
    is_active: true,
    desk_count: 25,
    available_desks: 18,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    building_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Second Floor',
    floor_number: 2,
    description: 'Meeting rooms and collaborative spaces',
    is_active: true,
    desk_count: 15,
    available_desks: 12,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockDesks: Desk[] = [
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    floor_id: '660e8400-e29b-41d4-a716-446655440001',
    desk_number: 'A1',
    x_position: 100,
    y_position: 100,
    width: 120,
    height: 80,
    status: 'available',
    desk_type: 'standard',
    equipment: {
      monitor: true,
      keyboard: true,
      phone: false,
      docking_station: true
    },
    rotation: 0,
    is_active: true,
    current_booking: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    floor_id: '660e8400-e29b-41d4-a716-446655440001',
    desk_number: 'A2',
    x_position: 250,
    y_position: 100,
    width: 120,
    height: 80,
    status: 'occupied',
    desk_type: 'standing',
    equipment: {
      monitor: true,
      keyboard: true,
      phone: true,
      docking_station: false
    },
    rotation: 0,
    is_active: true,
    current_booking: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440003',
    floor_id: '660e8400-e29b-41d4-a716-446655440001',
    desk_number: 'A3',
    x_position: 400,
    y_position: 100,
    width: 120,
    height: 80,
    status: 'available',
    desk_type: 'standard',
    equipment: {
      monitor: true,
      keyboard: true,
      phone: true,
      docking_station: false
    },
    rotation: 0,
    is_active: true,
    current_booking: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440004',
    floor_id: '660e8400-e29b-41d4-a716-446655440001',
    desk_number: 'B1',
    x_position: 100,
    y_position: 250,
    width: 120,
    height: 80,
    status: 'available',
    desk_type: 'collaborative',
    equipment: {
      monitor: true,
      keyboard: true,
      phone: false,
      docking_station: true
    },
    rotation: 0,
    is_active: true,
    current_booking: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440005',
    floor_id: '660e8400-e29b-41d4-a716-446655440001',
    desk_number: 'B2',
    x_position: 250,
    y_position: 250,
    width: 120,
    height: 80,
    status: 'reserved',
    desk_type: 'standard',
    equipment: {
      monitor: true,
      keyboard: true,
      phone: true,
      docking_station: true
    },
    rotation: 0,
    is_active: true,
    current_booking: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockZones: Zone[] = [
  {
    id: '880e8400-e29b-41d4-a716-446655440001',
    name: 'Quiet Zone',
    x: 0,
    y: 0,
    width: 400,
    height: 300,
    color: '#e3f2fd',
    description: 'Silent working area'
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440002',
    name: 'Collaborative Area',
    x: 500,
    y: 0,
    width: 400,
    height: 300,
    color: '#f3e5f5',
    description: 'Team collaboration space'
  }
];

export const mockAmenities: Amenity[] = [
  {
    id: '990e8400-e29b-41d4-a716-446655440001',
    name: 'Coffee Station',
    x: 50,
    y: 600,
    type: 'coffee_machine',
    icon: 'coffee'
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440002',
    name: 'Printer',
    x: 1000,
    y: 600,
    type: 'printer',
    icon: 'printer'
  }
];

export const mockFloorLayout: FloorLayout = {
  floor_id: '660e8400-e29b-41d4-a716-446655440001',
  layout_data: {
    dimensions: {
      width: 1200,
      height: 800,
      unit: 'pixels'
    },
    desks: mockDesks.filter(desk => desk.floor_id === '660e8400-e29b-41d4-a716-446655440001'),
    zones: mockZones,
    amenities: mockAmenities
  },
  version: 1,
  updated_at: '2024-01-15T10:30:00Z'
};

// Mock API service that returns the mock data
export const mockFloorPlanApiService = {
  getBuildings: async (): Promise<Building[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBuildings;
  },

  getFloors: async (params?: { building_id?: string; active?: boolean }): Promise<Floor[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filteredFloors = mockFloors;
    
    if (params?.building_id) {
      filteredFloors = filteredFloors.filter(floor => floor.building_id === params.building_id);
    }
    
    if (params?.active !== undefined) {
      filteredFloors = filteredFloors.filter(floor => floor.is_active === params.active);
    }
    
    return filteredFloors;
  },

  getFloor: async (id: string): Promise<Floor> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const floor = mockFloors.find(f => f.id === id);
    if (!floor) {
      throw new Error('Floor not found');
    }
    return floor;
  },

  getFloorLayout: async (floorId: string): Promise<FloorLayout> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (floorId === '660e8400-e29b-41d4-a716-446655440001') {
      return mockFloorLayout;
    }
    throw new Error('Floor layout not found');
  },

  getDesks: async (params?: { floor_id?: string; status?: string; desk_type?: string }): Promise<Desk[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filteredDesks = mockDesks;
    
    if (params?.floor_id) {
      filteredDesks = filteredDesks.filter(desk => desk.floor_id === params.floor_id);
    }
    
    if (params?.status) {
      filteredDesks = filteredDesks.filter(desk => desk.status === params.status);
    }
    
    if (params?.desk_type) {
      filteredDesks = filteredDesks.filter(desk => desk.desk_type === params.desk_type);
    }
    
    return filteredDesks;
  },

  createBooking: async (bookingData: any): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: 'bb0e8400-e29b-41d4-a716-446655440001',
      desk_id: bookingData.desk_id,
      user_id: 'aa0e8400-e29b-41d4-a716-446655440001',
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      status: 'confirmed',
      notes: bookingData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      desk: {
        id: bookingData.desk_id,
        desk_number: 'A1',
        floor: {
          id: '660e8400-e29b-41d4-a716-446655440001',
          name: 'First Floor',
          building: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Tech Campus Building A'
          }
        }
      }
    };
  },

  getBookings: async (params?: { user_id?: string; date?: string; desk_id?: string }): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return empty array for now - you can add mock bookings here
    return [];
  },

  deleteBooking: async (bookingId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock successful deletion
  }
}; 