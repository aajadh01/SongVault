import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vault_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminMe = async () => {
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/admin/me');
        if (res.data.success) {
          setAdmin(res.data.admin);
        }
      } catch (err) {
        console.error('Failed to authenticate admin session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchAdminMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/admin/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('vault_admin_token', res.data.token);
      setToken(res.data.token);
      setAdmin(res.data.admin);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('vault_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
