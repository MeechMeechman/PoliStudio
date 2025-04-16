import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start not authenticated

  useEffect(() => {
    console.log('[AuthContext] useEffect running');
    // Check if user is logged in on component mount
    const token = localStorage.getItem('token');
    console.log('[AuthContext] Token from localStorage:', token);

    if (token) {
      console.log('[AuthContext] Token found, setting isAuthenticated = true');
      setIsAuthenticated(true);
      // You could fetch user data here if needed
      // fetchUserData();
    } else {
      console.log('[AuthContext] No token found, isAuthenticated remains false');
    }

    console.log('[AuthContext] Setting loading = false');
    setLoading(false);
  }, []);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8000/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout(); // Logout if token is invalid
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/auth/login', {
        email,
        password
      });

      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('tokenType', response.data.token_type);
        setIsAuthenticated(true);
        // fetchUserData(); // Fetch user data after login
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.'
      };
    }
  };

  // Register function
  const register = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/auth/register', {
        email,
        password,
        is_active: true
      });

      if (response.data && response.data.id) {
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed. Please try again.'
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Create the auth value object
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
