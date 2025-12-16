import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../lib/api';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        // getMe returns { success: true, data: { user: {...}, profile: {...} } }
        const userData = response.data.data.user || response.data.data;
        
        if (userData.role !== 'admin') {
          throw new Error('Not an admin user');
        }
        
        // Normalize user data (convert id to _id if needed)
        const normalizedUser = {
          _id: userData._id || userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        };
        
        setUser(normalizedUser);
        localStorage.setItem('admin_user', JSON.stringify(normalizedUser));
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    if (response.data.success) {
      const { accessToken, user: userData } = response.data.data;
      
      if (userData.role !== 'admin') {
        throw new Error('Access denied. Admin role required.');
      }
      
      // Normalize user data (convert id to _id)
      const normalizedUser = {
        _id: userData._id || userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      };
      
      localStorage.setItem('admin_token', accessToken);
      localStorage.setItem('admin_user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

