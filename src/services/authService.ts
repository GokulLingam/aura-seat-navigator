// Authentication Service for UPS Reserve
// Handles login, logout, token management, and role-based authorization

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'GUEST';
  department?: string;
  employeeId?: string;
  avatar?: string;
  permissions: string[];
  lastLogin?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
  message?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  VERIFY: '/auth/verify',
  PROFILE: '/auth/profile',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
};

// Token management
const TOKEN_KEY = 'ups_reserve_token';
const REFRESH_TOKEN_KEY = 'ups_reserve_refresh_token';
const USER_KEY = 'ups_reserve_user';

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    this.initializeFromStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize auth state from localStorage
  private initializeFromStorage(): void {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (token && userStr) {
        const user = JSON.parse(userStr);
        this.authState = {
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      this.clearStorage();
    }
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    listener(this.authState); // Initial call

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  // API request helper with authentication
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Use mock API for development
    if (process.env.NODE_ENV === 'development') {
      return this.mockApiRequest<T>(endpoint, options);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${this.getToken()}`,
          };
          const retryResponse = await fetch(url, config);
          if (!retryResponse.ok) {
            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
          }
          return await retryResponse.json();
        } else {
          // Refresh failed, logout user
          await this.logout();
          throw new Error('Authentication expired. Please login again.');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Mock API request helper for development
  private async mockApiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { mockAuthAPI } = await import('./mockAuthService');
    
    try {
      switch (endpoint) {
        case AUTH_ENDPOINTS.LOGIN:
          const credentials = JSON.parse(options.body as string);
          return await mockAuthAPI.login(credentials) as T;
        
        case AUTH_ENDPOINTS.LOGOUT:
          return await mockAuthAPI.logout() as T;
        
        case AUTH_ENDPOINTS.REFRESH:
          const { refreshToken } = JSON.parse(options.body as string);
          return await mockAuthAPI.refreshToken(refreshToken) as T;
        
        case AUTH_ENDPOINTS.VERIFY:
          const token = this.getToken();
          if (!token) throw new Error('No token provided');
          return await mockAuthAPI.verifyToken(token) as T;
        
        case AUTH_ENDPOINTS.PROFILE:
          if (options.method === 'PUT') {
            const updates = JSON.parse(options.body as string);
            return await mockAuthAPI.updateProfile(updates) as T;
          } else {
            return await mockAuthAPI.getProfile() as T;
          }
        
        case AUTH_ENDPOINTS.CHANGE_PASSWORD:
          const { currentPassword, newPassword } = JSON.parse(options.body as string);
          return await mockAuthAPI.changePassword(currentPassword, newPassword) as T;
        
        case AUTH_ENDPOINTS.FORGOT_PASSWORD:
          const { email } = JSON.parse(options.body as string);
          return await mockAuthAPI.forgotPassword(email) as T;
        
        case AUTH_ENDPOINTS.RESET_PASSWORD:
          const resetData = JSON.parse(options.body as string);
          return await mockAuthAPI.resetPassword(resetData.token, resetData.newPassword) as T;
        
        case AUTH_ENDPOINTS.REGISTER:
          const userData = JSON.parse(options.body as string);
          return await mockAuthAPI.register(userData) as T;
        
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }
    } catch (error) {
      console.error('Mock API request failed:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    this.setLoading(true);
    this.setError(null);

    try {
      const response = await this.apiRequest<LoginResponse>(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success) {
        this.setAuthState(response.user, response.token, response.refreshToken);
        this.saveToStorage(response.user, response.token, response.refreshToken, credentials.rememberMe);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      this.setError(errorMessage);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await this.apiRequest(AUTH_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthState();
      this.clearStorage();
    }
  }

  // Refresh access token
  private async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: RefreshTokenResponse = await response.json();
        this.authState.token = data.token;
        this.authState.refreshToken = data.refreshToken;
        this.saveToStorage(this.authState.user!, data.token, data.refreshToken, true);
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Verify token validity
  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.apiRequest<{ valid: boolean; user?: User }>(
        AUTH_ENDPOINTS.VERIFY
      );
      
      if (response.valid && response.user) {
        this.authState.user = response.user;
        this.saveToStorage(response.user, this.authState.token!, this.authState.refreshToken!, true);
        this.notifyListeners();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  // Get user profile
  async getProfile(): Promise<User> {
    const response = await this.apiRequest<{ user: User }>(AUTH_ENDPOINTS.PROFILE);
    this.authState.user = response.user;
    this.saveToStorage(response.user, this.authState.token!, this.authState.refreshToken!, true);
    this.notifyListeners();
    return response.user;
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await this.apiRequest<{ user: User }>(AUTH_ENDPOINTS.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    this.authState.user = response.user;
    this.saveToStorage(response.user, this.authState.token!, this.authState.refreshToken!, true);
    this.notifyListeners();
    return response.user;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return await this.apiRequest(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return await this.apiRequest(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return await this.apiRequest(AUTH_ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Register new user (admin only)
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: User['role'];
    department?: string;
    employeeId?: string;
  }): Promise<{ success: boolean; user: User; message: string }> {
    return await this.apiRequest(AUTH_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Authorization helpers
  hasPermission(permission: string): boolean {
    return this.authState.user?.permissions.includes(permission) || false;
  }

  hasRole(role: User['role']): boolean {
    return this.authState.user?.role === role;
  }

  hasAnyRole(roles: User['role'][]): boolean {
    return roles.includes(this.authState.user?.role || 'GUEST');
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isManager(): boolean {
    return this.hasAnyRole(['ADMIN', 'MANAGER']);
  }

  isEmployee(): boolean {
    return this.hasAnyRole(['ADMIN', 'MANAGER', 'EMPLOYEE']);
  }

  // Getters
  getCurrentUser(): User | null {
    return this.authState.user;
  }

  getToken(): string | null {
    return this.authState.token;
  }

  getRefreshToken(): string | null {
    return this.authState.refreshToken;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // Private setters
  private setAuthState(user: User, token: string, refreshToken: string): void {
    this.authState = {
      user,
      token,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
    this.notifyListeners();
  }

  private clearAuthState(): void {
    this.authState = {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
    this.notifyListeners();
  }

  private setLoading(isLoading: boolean): void {
    this.authState.isLoading = isLoading;
    this.notifyListeners();
  }

  private setError(error: string | null): void {
    this.authState.error = error;
    this.notifyListeners();
  }

  // Storage helpers
  private saveToStorage(user: User, token: string, refreshToken: string, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  private clearStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

 