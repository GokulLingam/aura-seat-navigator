import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import apiService, { type User } from '@/services/apiService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Use user from localStorage as initial state
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          try {
            console.log('[AuthProvider] Calling verifyToken (initial)');
            const userData = await apiService.verifyToken();
            console.log('[AuthProvider] verifyToken (initial) result:', userData);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (verifyError) {
            console.warn('[AuthProvider] Token verify failed, trying refresh:', verifyError);
            try {
              console.log('[AuthProvider] Calling refreshToken');
              await apiService.refreshToken();
              console.log('[AuthProvider] refreshToken success, now calling verifyToken (after refresh)');
              const userData = await apiService.verifyToken();
              console.log('[AuthProvider] verifyToken (after refresh) result:', userData);
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            } catch (refreshError) {
              console.error('[AuthProvider] Token refresh failed:', refreshError);
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              localStorage.removeItem('isAuthenticated');
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthProvider] Token verification and refresh failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    isLoading: loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 