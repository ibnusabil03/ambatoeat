import api from './api';
import { jwtDecode } from "jwt-decode";


// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  
  if (response.data.success) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

// Login user
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  
  if (response.data.success) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Get current user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  try {
    // Check if token is expired
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      logout();
      return false;
    }
    
    return true;
  } catch (error) {
    logout();
    return false;
  }
};

// Check if user is admin
const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'ADMIN';
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  isAdmin
};

export default authService;