import React, { useState } from 'react';
import { createVolunteer } from '../services/volunteerService';

function VolunteerForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await createVolunteer(formData);
      setSuccessMessage(response.message);
      
      // If this is a returning volunteer, pre-fill the form with their data
      if (!response.is_new_volunteer) {
        setFormData({
          first_name: response.first_name,
          last_name: response.last_name,
          email: response.email,
          phone: response.phone || ''
        });
      }
      
      // Call the onSubmit callback with the volunteer data
      onSubmit(response);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="volunteer-form">
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <div className="form-group">
        <label>First Name</label>
        <input
          type="text"
          value={formData.first_name}
          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Last Name</label>
        <input
          type="text"
          value={formData.last_name}
          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit">Start Phone Banking</button>
    </form>
  );
}

export default VolunteerForm; 