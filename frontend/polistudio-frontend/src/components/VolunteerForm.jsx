import React, { useState } from 'react';
import { createVolunteer } from '../services/volunteerService';

function VolunteerForm({ onVolunteerCreated }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    availability: '',
    skills: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const newVolunteer = await createVolunteer(formData);
      if (onVolunteerCreated) {
        onVolunteerCreated(newVolunteer);
      }
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        availability: '',
        skills: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="volunteer-form">
      <h2>Add New Volunteer</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first_name">First Name:</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="last_name">Last Name:</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="availability">Availability:</label>
          <textarea
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            placeholder="e.g., Weekday evenings, Weekend mornings"
          />
        </div>

        <div className="form-group">
          <label htmlFor="skills">Skills:</label>
          <textarea
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g., Phone banking, Door knocking, Event planning"
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Volunteer'}
        </button>
      </form>
    </div>
  );
}

export default VolunteerForm; 