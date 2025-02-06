import React, { useEffect, useState } from 'react';
import { getVoters, deleteVoter } from '../services/voterService';

function VoterList({ onVoterDeleted }) {
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVoters() {
      setLoading(true);
      try {
        const data = await getVoters();
        setVoters(data);
        setFilteredVoters(data);
      } catch (err) {
        setError('Failed to fetch voters.');
      } finally {
        setLoading(false);
      }
    }
    fetchVoters();
  }, []);

  useEffect(() => {
    const filtered = voters.filter(voter => {
      const searchLower = searchTerm.toLowerCase();
      return (
        voter.first_name.toLowerCase().includes(searchLower) ||
        voter.last_name.toLowerCase().includes(searchLower) ||
        (voter.address && voter.address.toLowerCase().includes(searchLower))
      );
    });
    setFilteredVoters(filtered);
  }, [searchTerm, voters]);

  const handleDelete = async (id) => {
    try {
      await deleteVoter(id);
      setVoters(voters.filter(voter => voter.id !== id));
      if (onVoterDeleted) {
        onVoterDeleted(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading voters...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="voter-list">
      <div className="voter-list-header">
        <h2>Voters</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {filteredVoters.length === 0 ? (
        <p>{searchTerm ? 'No matching voters found.' : 'No voters found.'}</p>
      ) : (
        <div className="voter-grid">
          {filteredVoters.map((voter) => (
            <div key={voter.id} className="voter-card">
              <h3>{voter.first_name} {voter.last_name}</h3>
              <p>Address: {voter.address || 'Not specified'}</p>
              <p>Support Level: {voter.support_level}/5</p>
              <button 
                onClick={() => handleDelete(voter.id)}
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

export default VoterList; 