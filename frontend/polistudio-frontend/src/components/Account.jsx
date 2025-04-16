import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Account.css';

const Account = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Logout function
  const handleLogout = () => {
    // Clear the token
    localStorage.removeItem('token');
    // Update auth state
    setIsAuthenticated(false);
    // Redirect to login
    navigate('/login');
  };

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Call the backend endpoint to change password
      await axios.post(
        'http://localhost:8000/auth/change-password',
        {
          old_password: oldPassword,
          new_password: newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Reset form fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success message
      setMessage({ text: 'Password changed successfully', type: 'success' });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        text: error.response?.data?.detail || 'Failed to change password', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>My Account</h1>
      </div>

      <div className="account-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''} 
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={activeTab === 'password' ? 'active' : ''} 
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''} 
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button 
          className={activeTab === 'plans' ? 'active' : ''} 
          onClick={() => setActiveTab('plans')}
        >
          Plans & Billing
        </button>
      </div>

      <div className="account-content">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>Your Profile</h2>
            <p>Update your personal information and campaign details.</p>
            <div className="profile-info-placeholder">
              <p>Profile details will be implemented in a future update.</p>
              <p>This will include personal information, campaign details, and preferences.</p>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="password-section">
            <h2>Change Password</h2>
            <p>Update your password to keep your account secure.</p>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label htmlFor="oldPassword">Current Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                Change Password
              </button>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>Application Settings</h2>
            <p>Customize your PoliStudio experience.</p>
            <div className="settings-options">
              <div className="setting-option">
                <label>
                  <input type="checkbox" /> Enable email notifications
                </label>
                <p className="setting-description">Receive updates about campaign activities</p>
              </div>
              <div className="setting-option">
                <label>
                  <input type="checkbox" /> Dark Mode
                </label>
                <p className="setting-description">Toggle between light and dark theme</p>
              </div>
              <div className="setting-option">
                <label>
                  <input type="checkbox" /> Analytics Data Collection
                </label>
                <p className="setting-description">Help improve PoliStudio by sharing anonymous usage data</p>
              </div>
            </div>
            <button className="save-settings-button">Save Settings</button>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="plans-section">
            <h2>Plans & Billing</h2>
            <p>Manage your subscription and billing information.</p>
            
            <div className="current-plan">
              <h3>Current Plan</h3>
              <div className="plan-card">
                <h4>Free Trial</h4>
                <p>Access to basic features</p>
                <ul>
                  <li>Dashboard access</li>
                  <li>Limited AI copywriting</li>
                  <li>Basic voter management</li>
                </ul>
                <button className="upgrade-button">Upgrade Plan</button>
              </div>
            </div>
            
            <div className="available-plans">
              <h3>Available Plans</h3>
              <div className="plans-grid">
                <div className="plan-card premium">
                  <div className="plan-header">
                    <h4>Premium</h4>
                    <span className="price">$29/month</span>
                  </div>
                  <ul>
                    <li>Everything in Free Trial</li>
                    <li>Advanced AI copywriting</li>
                    <li>Enhanced voter database</li>
                    <li>Detailed analytics</li>
                  </ul>
                  <button>Select Plan</button>
                </div>
                
                <div className="plan-card professional">
                  <div className="plan-header">
                    <h4>Professional</h4>
                    <span className="price">$79/month</span>
                  </div>
                  <ul>
                    <li>Everything in Premium</li>
                    <li>Unlimited AI copywriting</li>
                    <li>Advanced analytics</li>
                    <li>24/7 priority support</li>
                  </ul>
                  <button>Select Plan</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
