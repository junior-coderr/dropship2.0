'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check localStorage for existing token
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signIn = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setIsAuthDrawerOpen(false);
  };

  const signOut = async () => {
    try {
      // Clear auth states
      setUser(null);
      setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Show success toast
      toast.success('Logged out successfully');
      
      // Optional: Clear any other app state that needs to be reset
      // For example, clear cart or user preferences
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
      return false;
    }
  };

  const openAuthDrawer = () => {
    setIsAuthDrawerOpen(true);
  };

  const closeAuthDrawer = () => {
    setIsAuthDrawerOpen(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        token, 
        signIn, 
        signOut,
        isAuthDrawerOpen,
        openAuthDrawer,
        closeAuthDrawer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
