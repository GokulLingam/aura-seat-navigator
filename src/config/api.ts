// API Configuration
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // API timeout in milliseconds
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  
  // Feature flags
  FEATURES: {
    MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
    DEBUG_LOGGING: import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true',
    RECURRING_BOOKINGS: import.meta.env.VITE_ENABLE_RECURRING_BOOKINGS !== 'false',
    ADVANCED_FILTERS: import.meta.env.VITE_ENABLE_ADVANCED_FILTERS !== 'false',
    FLOOR_PLAN_EDITING: import.meta.env.VITE_ENABLE_FLOOR_PLAN_EDITING !== 'false',
    RESOURCE_BOOKING: import.meta.env.VITE_ENABLE_RESOURCE_BOOKING !== 'false',
  },
  
  // Authentication settings
  AUTH: {
    TOKEN_EXPIRY_WARNING_MINUTES: parseInt(import.meta.env.VITE_TOKEN_EXPIRY_WARNING_MINUTES || '5'),
    REFRESH_TOKEN_BEFORE_EXPIRY_MINUTES: 10,
  },
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify',
      PROFILE: '/auth/profile',
      CHANGE_PASSWORD: '/auth/change-password',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      REGISTER: '/auth/register',
    },
    SEATS: {
      LIST: '/seats',
      CREATE: '/seats',
      UPDATE: (id: string) => `/seats/${id}`,
      DELETE: (id: string) => `/seats/${id}`,
      AVAILABILITY: (id: string) => `/seats/${id}/availability`,
      STATS: '/seats/stats',
      SEARCH: '/seats/search',
    },
    BOOKINGS: {
      CREATE: '/bookings',
      LIST: '/bookings',
      MY_BOOKINGS: '/bookings/my',
      UPDATE: (id: string) => `/bookings/${id}`,
      DELETE: (id: string) => `/bookings/${id}`,
    },
    RESOURCES: {
      LIST: '/resources',
      CREATE: '/resources',
      UPDATE: (id: string) => `/resources/${id}`,
      DELETE: (id: string) => `/resources/${id}`,
      BOOK: (id: string) => `/resources/${id}/book`,
      AVAILABILITY: (id: string) => `/resources/${id}/availability`,
      STATS: '/resources/stats',
      SEARCH: '/resources/search',
      POPULAR: '/resources/popular',
      AVAILABLE: '/resources/available',
      CATEGORIES: '/resources/categories',
      LOCATIONS: '/resources/locations',
    },
    FLOORS: {
      LIST: '/floors',
      CREATE: '/floors',
      UPDATE: (id: string) => `/floors/${id}`,
      DELETE: (id: string) => `/floors/${id}`,
      LAYOUT: (id: string) => `/floors/${id}/layout`,
      STATS: (id: string) => `/floors/${id}/stats`,
      EXPORT: (id: string) => `/floors/${id}/export`,
      IMPORT: (id: string) => `/floors/${id}/import`,
      HISTORY: (id: string) => `/floors/${id}/history`,
      RESTORE: (id: string, versionId: string) => `/floors/${id}/restore/${versionId}`,
      LOCATION: '/floors/location',
      BUILDINGS: '/floors/buildings',
      BUILDING_FLOORS: (building: string) => `/floors/buildings/${building}/floors`,
      TEMPLATES: '/floors/templates',
      CREATE_FROM_TEMPLATE: (templateId: string) => `/floors/templates/${templateId}/create`,
    },
    USERS: {
      LIST: '/users',
      CREATE: '/users',
      UPDATE: (id: string) => `/users/${id}`,
      DELETE: (id: string) => `/users/${id}`,
    },
  },
  
  // HTTP status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied. You don\'t have permission for this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  },
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
    BACKOFF_MULTIPLIER: 2,
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to check if feature is enabled
export const isFeatureEnabled = (feature: keyof typeof API_CONFIG.FEATURES): boolean => {
  return API_CONFIG.FEATURES[feature];
};

// Helper function to get error message
export const getErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (error?.status) {
    switch (error.status) {
      case API_CONFIG.STATUS_CODES.UNAUTHORIZED:
        return API_CONFIG.ERROR_MESSAGES.UNAUTHORIZED;
      case API_CONFIG.STATUS_CODES.FORBIDDEN:
        return API_CONFIG.ERROR_MESSAGES.FORBIDDEN;
      case API_CONFIG.STATUS_CODES.NOT_FOUND:
        return API_CONFIG.ERROR_MESSAGES.NOT_FOUND;
      case API_CONFIG.STATUS_CODES.UNPROCESSABLE_ENTITY:
        return API_CONFIG.ERROR_MESSAGES.VALIDATION_ERROR;
      case API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR:
        return API_CONFIG.ERROR_MESSAGES.SERVER_ERROR;
      default:
        return API_CONFIG.ERROR_MESSAGES.SERVER_ERROR;
    }
  }
  
  return API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
}; 