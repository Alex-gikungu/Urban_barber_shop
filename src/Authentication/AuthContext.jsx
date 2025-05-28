import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

// Export the api instance
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set Authorization header for authenticated requests
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setUser(response.data);
        setToken(storedToken);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Session check failed:', error.response?.status, error.message);
        setUser(null);
        setToken('');
        setIsLoggedIn(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password, googleToken = null) => {
    try {
      let response;
      if (googleToken) {
        // Google login: call backend's Google token endpoint
        response = await api.post('/auth/google/token', { credential: googleToken });
      } else {
        // Email/password login
        response = await api.post('/auth/login', { email, password });
      }
      setUser(response.data.user);
      setToken(response.data.token);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      navigate('/profile');
    } catch (error) {
      console.error('Login failed:', error.response?.status, error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, token, login, logout, loading }}>
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