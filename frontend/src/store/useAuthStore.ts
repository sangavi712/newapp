import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  level?: number;
  xp?: number;
  avatar_url?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode base64 payload safely (using atob)
    const payload = JSON.parse(atob(parts[1]));
    if (payload && typeof payload.exp === 'number') {
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    }
    return false;
  } catch {
    return true; // Treat invalid structure as expired
  }
};

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { user: null, token: null, isAuthenticated: false };
    }
    try {
      const user = JSON.parse(userStr);
      return { user, token, isAuthenticated: true };
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  return { user: null, token: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthState>((set) => {
  const initialState = getInitialState();
  
  return {
    ...initialState,
    login: (user, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
