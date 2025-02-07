import React, { useState } from 'react';

const voterFields = [
  { value: 'ignore', label: 'Ignore' },
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'address', label: 'Address' },
  { value: 'support_level', label: 'Support Level' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' }
];

function CSVImportMappingModal({ onClose, onImportSuccess }) {
  const [csvData, setCsvData] = useState([]); // Array of rows (each row is an array of cells)
  const [mapping, setMapping] = useState([]);   // Mapping for each column of the header row
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const text = event.target.result;
        parseCSV(text);
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid CSV file.');
    }
  };

  const parseCSV = (text) => {
    // A simple CSV parser (assumes no commas in values)
    const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
    const rows = lines.map(line => line.split(','));
    if (rows.length > 0) {
      setCsvData(rows);
      // Initialize mapping using the first row values: if a header matches a known field then use that field; otherwise use "ignore"
      const header = rows[0];
      const defaultMapping = header.map(h => {
        const lower = h.trim().toLowerCase();
        if (['first_name', 'last_name', 'address', 'support_level', 'phone', 'email'].includes(lower)) {
          return lower;
        }
        return 'ignore';
      });
      setMapping(defaultMapping);
    } else {
      setError('CSV file is empty.');
    }
  };

  const handleMappingChange = (index, value) => {
    const newMapping = [...mapping];
    newMapping[index] = value;
    setMapping(newMapping);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (csvData.length === 0) {
      setError('No CSV data loaded.');
      return;
    }

    // Ensure that both first_name and last_name are mapped
    if (!mapping.includes('first_name') || !mapping.includes('last_name')) {
      setError('Mapping must include columns for First Name and Last Name.');
      return;
    }

    // Rebuild CSV data based on the mapping:
    // - Use only columns where mapping is not set to "ignore"
    const mappedFields = mapping.filter(field => field !== 'ignore');
    const newRows = [];
    // Create a new header row from the mapping selections
    newRows.push(mappedFields);

    // Loop over each remaining row and build a new row based on the mapping
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const newRow = [];
      for (let j = 0; j < mapping.length; j++) {
        if (mapping[j] !== 'ignore') {
          newRow.push(row[j] ? row[j].trim() : '');
        }
      }
      newRows.push(newRow);
    }

    // Convert the new array of rows to CSV text
    const csvContent = newRows.map(row => row.join(',')).join('\n');

    // Now send the CSV to the backend
    setUploading(true);
    try {
      const formData = new FormData();
      // Create a Blob from the CSV content and append it as a file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      formData.append('file', blob, 'voters.csv');

      const response = await fetch('http://localhost:8000/import/voters', {
        method: 'POST',
        body: formData,
      });

      // Check the content type of the response before parsing it.
      const contentType = response.headers.get('Content-Type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to import CSV');
      }

      onImportSuccess(data);
      onClose();
    } catch (err) {
      setError(`Error submitting CSV: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal csv-import-mapping-modal" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <h2>Import Voters CSV – Map Columns</h2>
        {error && <div className="error" style={{ color: 'red' }}>{error}</div>}
        <div style={{ marginBottom: '1rem' }}>
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </div>
        {csvData.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table border="1" cellPadding="5" style={{ width: '100%', marginBottom: '1rem' }}>
              <thead>
                <tr>
                  {csvData[0].map((header, index) => (
                    <th key={index}>
                      <select
                        value={mapping[index]}
                        onChange={(e) => handleMappingChange(index, e.target.value)}
                      >
                        {voterFields.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(1, 6).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Showing preview of first 5 rows.</p>
          </div>
        )}
        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose} style={{ marginRight: '0.5rem' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
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
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: '#fff',
  padding: '1.5rem',
  borderRadius: '8px',
  width: '80%',
  maxWidth: '600px'
};

export default CSVImportMappingModal;
