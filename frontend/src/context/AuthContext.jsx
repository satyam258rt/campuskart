import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campuskart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campuskart_token'));
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('campuskart_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('campuskart_token');
      localStorage.removeItem('campuskart_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: authToken, user: loggedUser } = res.data;
    setToken(authToken);
    setUser(loggedUser);
    localStorage.setItem('campuskart_token', authToken);
    localStorage.setItem('campuskart_user', JSON.stringify(loggedUser));
    toast.success(`Welcome back, ${loggedUser.name}!`);
    return loggedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: authToken, user: newUser } = res.data;
    setToken(authToken);
    setUser(newUser);
    localStorage.setItem('campuskart_token', authToken);
    localStorage.setItem('campuskart_user', JSON.stringify(newUser));
    toast.success('Registration successful! Welcome to CampusKart.');
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campuskart_token');
    localStorage.removeItem('campuskart_user');
    toast.info('Logged out safely');
    // Full page refresh and navigate to login screen so UI state resets completely
    window.location.href = '/login';
  };

  const updateProfile = async (updateData) => {
    const res = await api.put('/auth/profile', updateData);
    const updatedUser = res.data.user;
    setUser(updatedUser);
    localStorage.setItem('campuskart_user', JSON.stringify(updatedUser));
    toast.success('Profile updated successfully');
    return updatedUser;
  };

  const roles = user?.roles || [];
  const isStudent = roles.includes('student');
  const isVendor = roles.includes('vendor') || roles.includes('seller');
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  const isSuperAdmin = roles.includes('super_admin');
  const isSeller = isVendor || isAdmin;
  const isLessor = roles.includes('lessor') || isAdmin;
  const primaryRole = isAdmin ? 'Admin' : isVendor ? 'Vendor' : 'Student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isStudent,
        isVendor,
        isAdmin,
        isSuperAdmin,
        isSeller,
        isLessor,
        primaryRole,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
