import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VoterSelectionModal({ initialSelected, onClose, onConfirm }) {
  const [voters, setVoters] = useState([]);
  const [filterTerm, setFilterTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(initialSelected || []);

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/voters');
        setVoters(response.data);
      } catch (error) {
        console.error('Error fetching voters:', error);
      }
    };
    fetchVoters();
  }, []);

  const filteredVoters = voters.filter(voter => {
    const term = filterTerm.toLowerCase();
    return (
      voter.first_name.toLowerCase().includes(term) ||
      voter.last_name.toLowerCase().includes(term) ||
      (voter.address && voter.address.toLowerCase().includes(term))
    );
  });

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selected => selected !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredVoters.map(voter => voter.id);
    setSelectedIds(allIds);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <h2>Select Voters</h2>
        <div className="filter-container" style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by name or address..."
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div
          className="table-container"
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            marginBottom: '1rem'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Select</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>First Name</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Last Name</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Address</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Support Level</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoters.map(voter => (
                <tr key={voter.id}>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(voter.id)}
                      onChange={() => toggleSelect(voter.id)}
                    />
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{voter.first_name}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{voter.last_name}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{voter.address}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{voter.support_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <button onClick={handleSelectAll} style={{ marginRight: '0.5rem' }}>Select All</button>
            <button onClick={handleClearSelection}>Clear Selection</button>
          </div>
          <div>
            <button onClick={() => onConfirm(selectedIds)} style={{ marginRight: '0.5rem' }}>Confirm</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: '#fff',
  padding: '1.5rem',
  borderRadius: '8px',
  width: '80%',
  maxWidth: '600px'
};

export default VoterSelectionModal;
