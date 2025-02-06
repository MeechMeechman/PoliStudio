import React, { useState } from 'react';
import { createVoter } from '../services/voterService';

function CreateVoter() {
  const [voterData, setVoterData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    support_level: 0,
    phone: '',
    email: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setVoterData({
      ...voterData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVoter(voterData);
      setMessage('Voter created successfully!');
      setVoterData({
        first_name: '',
        last_name: '',
        address: '',
        support_level: 0,
        phone: '',
        email: ''
      });
    } catch (error) {
      console.error('Error creating voter:', error);
      setMessage('Error creating voter.');
    }
  };

  return (
    <div className="create-voter-form">
      <h2>Create Voter</h2>
      {message && <div className="status-message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="first_name">First Name:</label>
          <input
            id="first_name"
            type="text"
            name="first_name"
            value={voterData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="last_name">Last Name:</label>
          <input
            id="last_name"
            type="text"
            name="last_name"
            value={voterData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <input
            id="address"
            type="text"
            name="address"
            value={voterData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="support_level">Support Level:</label>
          <input
            id="support_level"
            type="number"
            name="support_level"
            value={voterData.support_level}
            onChange={handleChange}
            min="0"
            max="5"
          />
        </div>
        <div>
          <label htmlFor="phone">Phone:</label>
          <input
            id="phone"
            type="text"
            name="phone"
            value={voterData.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={voterData.email}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Create Voter</button>
      </form>
    </div>
  );
}

export default CreateVoter; 