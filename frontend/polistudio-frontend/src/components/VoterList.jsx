import React, { useEffect, useState } from 'react';
import { getVoters, deleteVoter } from '../services/voterService';
import CSVImportMappingModal from './CSVImportMappingModal.jsx';
import VoterDetailsModal from './VoterDetailsModal';

function VoterList({ onVoterDeleted }) {
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [selectedVoters, setSelectedVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [supportFilter, setSupportFilter] = useState('all');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [selectedVoterId, setSelectedVoterId] = useState(null);

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
    const searchLower = searchTerm.toLowerCase();
    const filtered = voters.filter(voter => {
      const matchesSearch = (
        voter.first_name.toLowerCase().includes(searchLower) ||
        voter.last_name.toLowerCase().includes(searchLower) ||
        (voter.address && voter.address.toLowerCase().includes(searchLower))
      );
      const matchesSupport =
        supportFilter === 'all' ? true : voter.support_level === parseInt(supportFilter);
      return matchesSearch && matchesSupport;
    });
    setFilteredVoters(filtered);
  }, [searchTerm, voters, supportFilter]);

  const handleDelete = async (id) => {
    try {
      await deleteVoter(id);
      const updatedVoters = voters.filter(voter => voter.id !== id);
      setVoters(updatedVoters);
      setFilteredVoters(updatedVoters);
      setSelectedVoters(selectedVoters.filter(selectedId => selectedId !== id));
      if (onVoterDeleted) {
        onVoterDeleted(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVoters.length === 0) {
      alert('No voters selected for deletion.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedVoters.length} voter(s)?`)) {
      return;
    }
    try {
      await Promise.all(selectedVoters.map(id => deleteVoter(id)));
      const updatedVoters = voters.filter(voter => !selectedVoters.includes(voter.id));
      setVoters(updatedVoters);
      setFilteredVoters(updatedVoters);
      setSelectedVoters([]);
      alert('Selected voters have been deleted.');
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting voters.');
    }
  };

  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedVoters(prev => [...prev, id]);
    } else {
      setSelectedVoters(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  // New function: Select all voters that match the current filter.
  const handleSelectAll = () => {
    const allIds = filteredVoters.map((voter) => voter.id);
    setSelectedVoters(allIds);
  };

  // When CSV import is successful, refresh the voter list
  const handleImportSuccess = (data) => {
    alert(`Successfully imported ${data.imported_count} voters!`);
    getVoters().then(fetchedData => {
      setVoters(fetchedData);
      setFilteredVoters(fetchedData);
      setSelectedVoters([]);
    });
  };

  const handleVoterClick = (voterId) => {
    setSelectedVoterId(voterId);
  };

  const closeModal = () => {
    setSelectedVoterId(null);
  };

  if (loading) {
    return <div>Loading voters...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="voter-list">
      <div
        className="voter-list-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h2>Voters</h2>
        <div className="controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <label htmlFor="supportFilter" style={{ marginRight: '0.5rem' }}>
              Support Level:
            </label>
            <select
              id="supportFilter"
              value={supportFilter}
              onChange={(e) => setSupportFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="0">Unknown (0)</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <button onClick={() => setShowCSVModal(true)}>Import CSV</button>
          <button onClick={handleSelectAll} disabled={filteredVoters.length === 0}>
            Select All
          </button>
          <button onClick={() => setSelectedVoters([])} disabled={selectedVoters.length === 0}>
            Clear Selection
          </button>
          <button onClick={handleBulkDelete} disabled={selectedVoters.length === 0}>
            Delete Selected
          </button>
        </div>
      </div>

      {filteredVoters.length === 0 ? (
        <p>{searchTerm ? 'No matching voters found.' : 'No voters found.'}</p>
      ) : (
        <div className="voter-grid">
          {filteredVoters.map((voter) => (
            <div
              key={voter.id}
              className="voter-card"
              style={{ border: '1px solid #ccc', padding: '1rem', margin: '0.5rem', cursor: 'pointer' }}
              onClick={() => handleVoterClick(voter.id)}
            >
              <input
                type="checkbox"
                checked={selectedVoters.includes(voter.id)}
                onChange={(e) => handleCheckboxChange(voter.id, e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <strong>
                {voter.first_name} {voter.last_name}
              </strong>
              <p>Address: {voter.address || 'Not specified'}</p>
              <p>Support Level: {voter.support_level}/5</p>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(voter.id); }} className="delete-button">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showCSVModal && (
        <CSVImportMappingModal
          onClose={() => setShowCSVModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {selectedVoterId && (
        <VoterDetailsModal voterId={selectedVoterId} onClose={closeModal} />
      )}
    </div>
  );
}

export default VoterList; 