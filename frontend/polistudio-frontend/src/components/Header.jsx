import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Header.css';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [userEmail, setUserEmail] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user info if authenticated
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:8000/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUserEmail(response.data.email);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout(); // Use the logout function from AuthContext
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="app-header">
      <div className="header-logo">
        <Link to="/dashboard">
          <h1>PoliStudio</h1>
        </Link>
      </div>
      
      {isAuthenticated && (
        <div className="account-dropdown-container" ref={dropdownRef}>
          <button 
            className="account-dropdown-button" 
            onClick={toggleDropdown}
          >
            <span className="user-avatar">
              {userEmail ? userEmail.charAt(0).toUpperCase() : '?'}
            </span>
            <span className="user-email">{userEmail || 'Loading...'}</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {isDropdownOpen && (
            <div className="account-dropdown-menu">
              <div className="dropdown-user-info">
                <span className="dropdown-avatar">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : '?'}
                </span>
                <span className="dropdown-email">{userEmail}</span>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/account" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <span className="dropdown-icon">👤</span> My Account
              </Link>
              <Link to="/account?tab=settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <span className="dropdown-icon">⚙️</span> Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <span className="dropdown-icon">🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
