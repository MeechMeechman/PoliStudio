import React, { useEffect, useState, useRef } from 'react';
import { getVoters, deleteVoter, exportVoters } from '../services/voterService';
import CSVImportMappingModal from './CSVImportMappingModal.jsx';
import VoterDetailsModal from './VoterDetailsModal';
import './VoterList.css';

const COLUMN_CONFIG = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'address', label: 'Address' },
  { key: 'support_level', label: 'Support' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'last_contacted', label: 'Last Contacted' }
];

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
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [votersPerPage, setVotersPerPage] = useState(10);
  const [sortField, setSortField] = useState('last_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [advancedFilters, setAdvancedFilters] = useState({
    phoneStatus: 'all',
    emailStatus: 'all',
    supportLevelRange: [0, 5],
    lastContactedRange: { start: null, end: null },
    tags: [],
    showAdvanced: false
  });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFields, setExportFields] = useState([
    { field: 'first_name', include: true },
    { field: 'last_name', include: true },
    { field: 'address', include: true },
    { field: 'support_level', include: true },
    { field: 'phone', include: true },
    { field: 'email', include: true },
    { field: 'notes', include: false },
    { field: 'tags', include: false },
    { field: 'registered', include: false },
    { field: 'last_contacted', include: false }
  ]);

  const defaultVisibleCols = {};
  COLUMN_CONFIG.forEach(col => { defaultVisibleCols[col.key] = true; });
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleCols);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const columnsDropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target)) {
        setShowColumnsDropdown(false);
      }
    }
    if (showColumnsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnsDropdown]);

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
    applyFilters();
  }, [searchTerm, voters, supportFilter, advancedFilters, sortField, sortDirection]);

  const applyFilters = () => {
    const searchLower = searchTerm.toLowerCase();
    let filtered = voters.filter(voter => {
      const matchesSearch = (
        voter.first_name?.toLowerCase().includes(searchLower) ||
        voter.last_name?.toLowerCase().includes(searchLower) ||
        (voter.address && voter.address.toLowerCase().includes(searchLower)) ||
        (voter.email && voter.email.toLowerCase().includes(searchLower)) ||
        (voter.phone && voter.phone.includes(searchLower))
      );
      
      const matchesSupport =
        supportFilter === 'all' ? true : voter.support_level === parseInt(supportFilter);
      
      const matchesPhone = 
        advancedFilters.phoneStatus === 'all' ? true :
        advancedFilters.phoneStatus === 'has' ? !!voter.phone :
        !voter.phone;
        
      const matchesEmail = 
        advancedFilters.emailStatus === 'all' ? true :
        advancedFilters.emailStatus === 'has' ? !!voter.email :
        !voter.email;
        
      const matchesSupportRange = 
        voter.support_level >= advancedFilters.supportLevelRange[0] && 
        voter.support_level <= advancedFilters.supportLevelRange[1];
        
      const matchesDateRange = 
        (!advancedFilters.lastContactedRange.start || 
          (voter.last_contacted && new Date(voter.last_contacted) >= new Date(advancedFilters.lastContactedRange.start))) &&
        (!advancedFilters.lastContactedRange.end || 
          (voter.last_contacted && new Date(voter.last_contacted) <= new Date(advancedFilters.lastContactedRange.end)));
          
      const matchesTags = 
        advancedFilters.tags.length === 0 ? true :
        (voter.tags && advancedFilters.tags.some(tag => voter.tags.includes(tag)));
      
      return matchesSearch && matchesSupport && matchesPhone && matchesEmail && 
             matchesSupportRange && matchesDateRange && matchesTags;
    });
    
    filtered = [...filtered].sort((a, b) => {
      let fieldA = a[sortField] || '';
      let fieldB = b[sortField] || '';
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      }
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredVoters(filtered);
    setCurrentPage(1);
  };

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

  const handleSelectAll = () => {
    const allIds = displayedVoters.map((voter) => voter.id);
    setSelectedVoters(allIds);
  };

  const handleImportSuccess = (data) => {
    alert(`Successfully imported ${data.imported_count} voters! ${data.duplicates_merged || 0} duplicates were merged.`);
    getVoters().then(fetchedData => {
      setVoters(fetchedData);
      setFilteredVoters(fetchedData);
      setSelectedVoters([]);
    });
  };

  const handleVoterClick = (voterId) => {
    setSelectedVoterId(voterId);
    setEditMode(false);
  };

  const handleEditClick = (voterId, e) => {
    e.stopPropagation();
    setSelectedVoterId(voterId);
    setEditMode(true);
  };

  const closeModal = () => {
    setSelectedVoterId(null);
    setEditMode(false);
  };

  const handleVoterUpdated = (updatedVoter) => {
    const updatedVoters = voters.map(voter => 
      voter.id === updatedVoter.id ? updatedVoter : voter
    );
    setVoters(updatedVoters);
    setFilteredVoters(updatedVoters);
  };

  const handleSortClick = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = async () => {
    const fieldsToExport = exportFields
      .filter(f => f.include)
      .map(f => f.field);
    
    if (fieldsToExport.length === 0) {
      alert('Please select at least one field to export.');
      return;
    }
    
    try {
      const exportData = await exportVoters(filteredVoters, fieldsToExport, exportFormat);
      
      const blob = new Blob([exportData], { type: exportFormat === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voters_export.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportOptions(false);
    } catch (err) {
      console.error(err);
      alert('An error occurred during export.');
    }
  };

  const toggleAdvancedFilters = () => {
    setAdvancedFilters(prev => ({
      ...prev,
      showAdvanced: !prev.showAdvanced
    }));
  };

  const handleAdvancedFilterChange = (key, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredVoters.length / votersPerPage);
  
  const indexOfLastVoter = currentPage * votersPerPage;
  const indexOfFirstVoter = indexOfLastVoter - votersPerPage;
  const displayedVoters = filteredVoters.slice(indexOfFirstVoter, indexOfLastVoter);

  const renderSortIcon = (field) => {
    if (sortField !== field) return <span className="sort-icon">⇅</span>;
    return sortDirection === 'asc' ? <span className="sort-icon">↑</span> : <span className="sort-icon">↓</span>;
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div>Loading voters...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="voter-list">
      <div className="voter-list-header">
        <h2>Voters Management</h2>
        <div className="controls">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, address, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="filter-toggle-btn"
              onClick={toggleAdvancedFilters}
            >
              <span>🔍</span> {advancedFilters.showAdvanced ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <div className="action-buttons">
            <button className="btn-import" onClick={() => setShowCSVModal(true)}>
              <span>📥</span> Import
            </button>
            <button className="btn-export" onClick={() => setShowExportOptions(!showExportOptions)}>
              <span>📤</span> Export
            </button>
            <button 
              className="btn-select-all"
              onClick={handleSelectAll}
              disabled={displayedVoters.length === 0}
            >
              Select All
            </button>
            <button 
              className="btn-clear"
              onClick={() => setSelectedVoters([])}
              disabled={selectedVoters.length === 0}
            >
              Clear Selection
            </button>
            <button 
              className="btn-delete"
              onClick={handleBulkDelete} 
              disabled={selectedVoters.length === 0}
            >
              <span>🗑️</span> Delete Selected ({selectedVoters.length})
            </button>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className="btn-select-all"
                onClick={() => setShowColumnsDropdown(v => !v)}
                title="Show/Hide Columns"
              >
                ⚙️ Columns
              </button>
              {showColumnsDropdown && (
                <div
                  ref={columnsDropdownRef}
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 6,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    zIndex: 10,
                    padding: '10px 18px',
                    minWidth: 170
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Show Columns</div>
                  {COLUMN_CONFIG.map(col => (
                    <label key={col.key} style={{ display: 'block', marginBottom: 4, cursor: 'pointer', fontSize: 15 }}>
                      <input
                        type="checkbox"
                        checked={visibleColumns[col.key]}
                        onChange={e => setVisibleColumns(v => ({ ...v, [col.key]: e.target.checked }))}
                        style={{ marginRight: 8 }}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {advancedFilters.showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Support Level:</label>
              <select
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

            <div className="filter-group">
              <label>Phone Status:</label>
              <select
                value={advancedFilters.phoneStatus}
                onChange={(e) => handleAdvancedFilterChange('phoneStatus', e.target.value)}
              >
                <option value="all">All</option>
                <option value="has">Has Phone</option>
                <option value="missing">No Phone</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Email Status:</label>
              <select
                value={advancedFilters.emailStatus}
                onChange={(e) => handleAdvancedFilterChange('emailStatus', e.target.value)}
              >
                <option value="all">All</option>
                <option value="has">Has Email</option>
                <option value="missing">No Email</option>
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Last Contacted:</label>
              <div className="date-range">
                <input 
                  type="date" 
                  value={advancedFilters.lastContactedRange.start || ''} 
                  onChange={(e) => handleAdvancedFilterChange('lastContactedRange', {
                    ...advancedFilters.lastContactedRange,
                    start: e.target.value || null
                  })}
                />
                <span>to</span>
                <input 
                  type="date" 
                  value={advancedFilters.lastContactedRange.end || ''} 
                  onChange={(e) => handleAdvancedFilterChange('lastContactedRange', {
                    ...advancedFilters.lastContactedRange,
                    end: e.target.value || null
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showExportOptions && (
        <div className="export-options">
          <h3>Export Options</h3>
          <div className="export-format">
            <label>Format:</label>
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div className="export-fields">
            <label>Fields to Export:</label>
            <div className="fields-grid">
              {exportFields.map((field, index) => (
                <div key={field.field} className="field-checkbox">
                  <input
                    type="checkbox"
                    id={`field-${field.field}`}
                    checked={field.include}
                    onChange={() => {
                      const updatedFields = [...exportFields];
                      updatedFields[index] = {
                        ...field,
                        include: !field.include
                      };
                      setExportFields(updatedFields);
                    }}
                  />
                  <label htmlFor={`field-${field.field}`}>
                    {field.field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="export-actions">
            <button onClick={() => setShowExportOptions(false)}>Cancel</button>
            <button onClick={handleExport}>Export {filteredVoters.length} Voters</button>
          </div>
        </div>
      )}

      {filteredVoters.length === 0 ? (
        <div className="no-results">
          <p>{searchTerm || Object.values(advancedFilters).some(v => v !== 'all' && v.length !== 0) ? 
            'No matching voters found.' : 
            'No voters found. Import some voters to get started.'}</p>
        </div>
      ) : (
        <>
          <div className="voter-table-container">
            <table className="voter-table">
              <colgroup>
                <col width="32" /> {/* Checkbox */}
                {visibleColumns.first_name && <col width="15%" />}
                {visibleColumns.last_name && <col width="15%" />}
                {visibleColumns.address && <col width="20%" />}
                {visibleColumns.support_level && <col width="10%" />}
                {visibleColumns.phone && <col width="15%" />}
                {visibleColumns.email && <col width="15%" />}
                {visibleColumns.last_contacted && <col width="10%" />}
                <col width="50" /> {/* Actions */}
              </colgroup>
              <thead>
                <tr>
                  <th style={{width: '32px'}}>
                    <input
                      type="checkbox"
                      checked={displayedVoters.length > 0 && displayedVoters.every(voter => selectedVoters.includes(voter.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSelectAll();
                        } else {
                          setSelectedVoters([]);
                        }
                      }}
                    />
                  </th>
                  {visibleColumns.first_name && (
                    <th className="sortable" onClick={() => handleSortClick('first_name')}>
                      First Name {renderSortIcon('first_name')}
                    </th>
                  )}
                  {visibleColumns.last_name && (
                    <th className="sortable" onClick={() => handleSortClick('last_name')}>
                      Last Name {renderSortIcon('last_name')}
                    </th>
                  )}
                  {visibleColumns.address && (
                    <th className="sortable" onClick={() => handleSortClick('address')}>
                      Address {renderSortIcon('address')}
                    </th>
                  )}
                  {visibleColumns.support_level && (
                    <th className="sortable" onClick={() => handleSortClick('support_level')}>
                      Support {renderSortIcon('support_level')}
                    </th>
                  )}
                  {visibleColumns.phone && (
                    <th className="sortable" onClick={() => handleSortClick('phone')}>
                      Phone {renderSortIcon('phone')}
                    </th>
                  )}
                  {visibleColumns.email && (
                    <th className="sortable" onClick={() => handleSortClick('email')}>
                      Email {renderSortIcon('email')}
                    </th>
                  )}
                  {visibleColumns.last_contacted && (
                    <th className="sortable" onClick={() => handleSortClick('last_contacted')}>
                      Last Contacted {renderSortIcon('last_contacted')}
                    </th>
                  )}
                  <th style={{width: '50px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedVoters.map((voter) => (
                  <tr
                    key={voter.id}
                    onClick={() => handleVoterClick(voter.id)}
                    className={selectedVoters.includes(voter.id) ? 'selected' : ''}
                  >
                    <td style={{width: '32px'}}>
                      <input
                        type="checkbox"
                        checked={selectedVoters.includes(voter.id)}
                        onChange={(e) => handleCheckboxChange(voter.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    {visibleColumns.first_name && <td>{voter.first_name}</td>}
                    {visibleColumns.last_name && <td>{voter.last_name}</td>}
                    {visibleColumns.address && <td>{voter.address || 'N/A'}</td>}
                    {visibleColumns.support_level && (
                      <td>
                        <span className={`support-level support-level-${voter.support_level}`}>
                          {voter.support_level}/5
                        </span>
                      </td>
                    )}
                    {visibleColumns.phone && <td>{voter.phone || 'N/A'}</td>}
                    {visibleColumns.email && <td>{voter.email || 'N/A'}</td>}
                    {visibleColumns.last_contacted && (
                      <td>{voter.last_contacted ? new Date(voter.last_contacted).toLocaleDateString() : 'Never'}</td>
                    )}
                    <td style={{width: '50px'}}>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={(e) => handleEditClick(voter.id, e)}
                          title="Edit voter"
                          aria-label="Edit voter"
                        >✏️</button>
                        <button
                          className="action-btn delete-btn"
                          onClick={(e) => { e.stopPropagation(); handleDelete(voter.id); }}
                          title="Delete voter"
                          aria-label="Delete voter"
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="page-info">
              Showing {indexOfFirstVoter + 1}-{Math.min(indexOfLastVoter, filteredVoters.length)} of {filteredVoters.length} voters
            </div>
            <div className="page-controls">
              <button 
                onClick={() => paginate(1)} 
                disabled={currentPage === 1}
                className="page-btn"
              >
                &laquo;
              </button>
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="page-btn"
              >
                &lsaquo;
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNum => 
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  Math.abs(pageNum - currentPage) <= 1
                )
                .map((pageNum, i, arr) => {
                  if (i > 0 && pageNum - arr[i - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${pageNum}`}>
                        <span className="ellipsis">...</span>
                        <button 
                          onClick={() => paginate(pageNum)}
                          className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })
              }
              
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                &rsaquo;
              </button>
              <button 
                onClick={() => paginate(totalPages)} 
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                &raquo;
              </button>
            </div>
            <div className="page-size">
              <label>
                Items per page:
                <select 
                  value={votersPerPage} 
                  onChange={(e) => setVotersPerPage(Number(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </label>
            </div>
          </div>
        </>
      )}

      {showCSVModal && (
        <CSVImportMappingModal
          onClose={() => setShowCSVModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {selectedVoterId && (
        <VoterDetailsModal 
          voterId={selectedVoterId} 
          onClose={closeModal} 
          editMode={editMode} 
          onVoterUpdated={handleVoterUpdated}
        />
      )}
    </div>
  );
}

export default VoterList;