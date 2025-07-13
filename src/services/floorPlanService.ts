import apiService from './apiService';

export interface FloorPlan {
  id: string;
  name: string;
  building: string;
  floor: number;
  width: number;
  height: number;
  seats: any[];
  resources: any[];
  deskAreas: any[];
  symbols: any[];
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
    fillColor: string;
    fillOpacity: number;
    strokeColor: string;
    strokeWidth: number;
  };
}

export interface FloorPlanUpdate {
  name?: string;
  width?: number;
  height?: number;
  seats?: any[];
  resources?: any[];
  deskAreas?: any[];
  symbols?: any[];
  layout?: {
    x: number;
    y: number;
    width: number;
    height: number;
    fillColor: string;
    fillOpacity: number;
    strokeColor: string;
    strokeWidth: number;
  };
}

class FloorPlanService {
  // Get all floor plans
  async getFloorPlans(): Promise<FloorPlan[]> {
    try {
      const response = await apiService.publicRequest<FloorPlan[]>('/floors');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch floor plans:', error);
      throw error;
    }
  }

  // Get a specific floor plan
  async getFloorPlan(floorId: string): Promise<FloorPlan> {
    try {
      return await apiService.getFloorPlan(floorId);
    } catch (error) {
      console.error('Failed to fetch floor plan:', error);
      throw error;
    }
  }

  // Create a new floor plan
  async createFloorPlan(floorData: Omit<FloorPlan, 'id'>): Promise<FloorPlan> {
    try {
      const response = await apiService.publicRequest<FloorPlan>('/floors', {
        method: 'POST',
        body: JSON.stringify(floorData),
      });
      return response.data!;
    } catch (error) {
      console.error('Failed to create floor plan:', error);
      throw error;
    }
  }

  // Update a floor plan
  async updateFloorPlan(floorId: string, floorData: FloorPlanUpdate): Promise<FloorPlan> {
    try {
      return await apiService.updateFloorPlan(floorId, floorData);
    } catch (error) {
      console.error('Failed to update floor plan:', error);
      throw error;
    }
  }

  // Delete a floor plan
  async deleteFloorPlan(floorId: string): Promise<void> {
    try {
      await apiService.publicRequest(`/floors/${floorId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete floor plan:', error);
      throw error;
    }
  }

  // Get floor plan by building and floor number
  async getFloorPlanByLocation(building: string, floor: number): Promise<FloorPlan> {
    try {
      const response = await apiService.publicRequest<FloorPlan>(`/floors/location?building=${building}&floor=${floor}`);
      return response.data!;
    } catch (error) {
      console.error('Failed to fetch floor plan by location:', error);
      throw error;
    }
  }

  // Get all buildings
  async getBuildings(): Promise<string[]> {
    try {
      const response = await apiService.publicRequest<string[]>('/floors/buildings');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch buildings:', error);
      throw error;
    }
  }

  // Get floors for a specific building
  async getFloorsByBuilding(building: string): Promise<number[]> {
    try {
      const response = await apiService.publicRequest<number[]>(`/floors/buildings/${building}/floors`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch floors by building:', error);
      throw error;
    }
  }

  // Save floor plan layout
  async saveFloorPlanLayout(floorId: string, layoutData: any): Promise<void> {
    try {
      await apiService.publicRequest(`/floors/${floorId}/layout`, {
        method: 'PUT',
        body: JSON.stringify(layoutData),
      });
    } catch (error) {
      console.error('Failed to save floor plan layout:', error);
      throw error;
    }
  }

  // Get floor plan statistics
  async getFloorPlanStats(floorId: string, date?: string): Promise<any> {
    try {
      const params = date ? `?date=${date}` : '';
      const response = await apiService.publicRequest<any>(`/floors/${floorId}/stats${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch floor plan statistics:', error);
      throw error;
    }
  }

  // Export floor plan data
  async exportFloorPlan(floorId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<any> {
    try {
      const response = await apiService.publicRequest<any>(`/floors/${floorId}/export?format=${format}`);
      return response.data;
    } catch (error) {
      console.error('Failed to export floor plan:', error);
      throw error;
    }
  }

  // Import floor plan data
  async importFloorPlan(floorId: string, importData: any): Promise<void> {
    try {
      await apiService.publicRequest(`/floors/${floorId}/import`, {
        method: 'POST',
        body: JSON.stringify(importData),
      });
    } catch (error) {
      console.error('Failed to import floor plan:', error);
      throw error;
    }
  }

  // Get floor plan version history
  async getFloorPlanHistory(floorId: string): Promise<any[]> {
    try {
      const response = await apiService.publicRequest<any[]>(`/floors/${floorId}/history`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch floor plan history:', error);
      throw error;
    }
  }

  // Restore floor plan to a specific version
  async restoreFloorPlanVersion(floorId: string, versionId: string): Promise<void> {
    try {
      await apiService.publicRequest(`/floors/${floorId}/restore/${versionId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to restore floor plan version:', error);
      throw error;
    }
  }

  // Get floor plan templates
  async getFloorPlanTemplates(): Promise<FloorPlan[]> {
    try {
      const response = await apiService.publicRequest<FloorPlan[]>('/floors/templates');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch floor plan templates:', error);
      throw error;
    }
  }

  // Create floor plan from template
  async createFromTemplate(templateId: string, floorData: Partial<FloorPlan>): Promise<FloorPlan> {
    try {
      const response = await apiService.publicRequest<FloorPlan>(`/floors/templates/${templateId}/create`, {
        method: 'POST',
        body: JSON.stringify(floorData),
      });
      return response.data!;
    } catch (error) {
      console.error('Failed to create floor plan from template:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const floorPlanService = new FloorPlanService();

export default floorPlanService; 