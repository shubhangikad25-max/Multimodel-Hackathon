import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'doctor' | 'patient' | 'lab_tech' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  title: string;
  department: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string | null;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'cardiovision_auth_token';
const USER_STORAGE_KEY = 'cardiovision_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify token validity on boot if present
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const freshUser = await res.json();
          setUser(freshUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Backend currently unreachable during session verification, keeping cached session:', err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(data.detail || 'Invalid email or password');
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
      return false;
    }
  };

  const logout = () => {
    if (token) {
      // Fire-and-forget backend notification
      fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      logout();
    }
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        loading,
        error,
        login,
        logout,
        authFetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
