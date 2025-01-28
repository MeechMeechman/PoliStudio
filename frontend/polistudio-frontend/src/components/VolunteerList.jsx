import React, { useEffect, useState } from 'react';
import { getVolunteers, deleteVolunteer } from '../services/volunteerService';

function VolunteerList({ onVolunteerDeleted }) {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useEffect(() => {
    const filtered = volunteers.filter(volunteer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        volunteer.first_name.toLowerCase().includes(searchLower) ||
        volunteer.last_name.toLowerCase().includes(searchLower) ||
        volunteer.email.toLowerCase().includes(searchLower)
      );
    });
    setFilteredVolunteers(filtered);
  }, [searchTerm, volunteers]);

  async function fetchVolunteers() {
    try {
      const data = await getVolunteers();
      setVolunteers(data);
      setFilteredVolunteers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteVolunteer(id);
      const updatedVolunteers = volunteers.filter(volunteer => volunteer.id !== id);
      setVolunteers(updatedVolunteers);
      if (onVolunteerDeleted) {
        onVolunteerDeleted(id);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div>Loading volunteers...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="volunteer-list">
      <div className="volunteer-list-header">
        <h2>Volunteers</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {filteredVolunteers.length === 0 ? (
        <p>{searchTerm ? 'No matching volunteers found.' : 'No volunteers found.'}</p>
      ) : (
        <div className="volunteer-grid">
          {filteredVolunteers.map((volunteer) => (
            <div key={volunteer.id} className="volunteer-card">
              <h3>{volunteer.first_name} {volunteer.last_name}</h3>
              <p>Email: {volunteer.email}</p>
              {volunteer.phone && <p>Phone: {volunteer.phone}</p>}
              {volunteer.availability && <p>Availability: {volunteer.availability}</p>}
              {volunteer.skills && <p>Skills: {volunteer.skills}</p>}
              <button 
                onClick={() => handleDelete(volunteer.id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VolunteerList; 