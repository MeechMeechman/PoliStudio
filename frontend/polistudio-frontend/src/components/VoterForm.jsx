import React, { useState } from 'react';
import { createVoter } from '../services/voterService';

function VoterForm({ onVoterCreated }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    district: '',
    support_level: 0
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'support_level' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const newVoter = await createVoter(formData);
      if (onVoterCreated) {
        onVoterCreated(newVoter);
      }
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        district: '',
        support_level: 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="voter-form">
      <h2>Add New Voter</h2>
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
          <label htmlFor="district">District:</label>
          <input
            type="text"
            id="district"
            name="district"
            value={formData.district}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="support_level">Support Level (0-5):</label>
          <input
            type="number"
            id="support_level"
            name="support_level"
            min="0"
            max="5"
            value={formData.support_level}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Voter'}
        </button>
      </form>
    </div>
  );
}

export default VoterForm; 