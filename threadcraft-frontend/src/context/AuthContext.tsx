import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  language: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  verify2FA: (userId: string, code: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // On app load, if a token exists, fetch the user profile
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (error) {
          // Token is invalid or expired, clear it
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  async function login(email: string, password: string) {
    const result = await authApi.login(email, password);
    
    // If the account requires 2FA, we don't get a token yet
    if (result.requires2FA) {
      return result;
    }
    
    // Otherwise, save the token and user
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    
    return result;
  }

  async function verify2FA(userId: string, code: string) {
    const result = await authApi.verify2FA(userId, code);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result;
  }

  async function register(data: any) {
    const result = await authApi.register(data);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result;
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      verify2FA,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}