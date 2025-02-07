import React, { useEffect, useState } from 'react';
import { getVoter } from '../services/voterService';

const VoterDetailsModal = ({ voterId, onClose }) => {
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVoter = async () => {
      try {
        const data = await getVoter(voterId);
        setVoter(data);
      } catch (err) {
        setError('Failed to fetch voter details.');
      } finally {
        setLoading(false);
      }
    };

    if (voterId) {
      fetchVoter();
    }
  }, [voterId]);

  if (!voterId) return null;

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <button onClick={onClose} style={closeButtonStyle}>Close</button>
        {loading ? (
          <p>Loading voter details...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div>
            <h2>{voter.first_name} {voter.last_name}</h2>
            <p><strong>Address:</strong> {voter.address}</p>
            <p><strong>Support Level:</strong> {voter.support_level}</p>
            <p><strong>Phone:</strong> {voter.phone}</p>
            <p><strong>Email:</strong> {voter.email}</p>
            {/* Add any additional fields here */}
          </div>
        )}
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '500px',
  width: '100%',
};

const closeButtonStyle = {
  background: 'red',
  color: '#fff',
  border: 'none',
  padding: '5px 10px',
  cursor: 'pointer',
  borderRadius: '4px',
  float: 'right'
};

export default VoterDetailsModal; 