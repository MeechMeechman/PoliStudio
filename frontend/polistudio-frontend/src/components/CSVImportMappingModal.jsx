import React, { useState } from 'react';
import './CSVImportMappingModal.css';

const voterFields = [
  { value: 'ignore', label: 'Ignore' },
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'address', label: 'Address' },
  { value: 'support_level', label: 'Support Level' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'registered', label: 'Registered Voter' },
  { value: 'tags', label: 'Tags (comma separated)' },
  { value: 'notes', label: 'Notes' },
  { value: 'last_contacted', label: 'Last Contacted Date' }
];

function CSVImportMappingModal({ onClose, onImportSuccess }) {
  const [csvData, setCsvData] = useState([]); // Array of rows (each row is an array of cells)
  const [mapping, setMapping] = useState([]);   // Mapping for each column of the header row
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [importOptions, setImportOptions] = useState({
    handleDuplicates: 'merge', // 'merge', 'skip', 'replace'
    identifyBy: ['email', 'phone'], // ['email', 'phone', 'name_address']
    updateExisting: true,
    importMatchThreshold: 80 // percentage match required for duplicate detection
  });
  const [showHelp, setShowHelp] = useState(false);

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
    
    // Using a more robust parsing approach that handles quoted values
    const rows = lines.map(line => {
      const row = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Don't forget to add the last value
      row.push(currentValue.trim());
      return row;
    });
    
    if (rows.length > 0) {
      setCsvData(rows);
      // Initialize mapping using the first row values: if a header matches a known field then use that field; otherwise use "ignore"
      const header = rows[0];
      const defaultMapping = header.map(h => {
        const lower = h.trim().toLowerCase();
        
        // Map common variations of field names
        const fieldMap = {
          'first': 'first_name',
          'firstname': 'first_name',
          'first name': 'first_name',
          'fname': 'first_name',
          
          'last': 'last_name',
          'lastname': 'last_name',
          'last name': 'last_name',
          'lname': 'last_name',
          
          'addr': 'address',
          'street': 'address',
          'street address': 'address',
          
          'support': 'support_level',
          'support level': 'support_level',
          'rating': 'support_level',
          
          'tel': 'phone',
          'telephone': 'phone',
          'cell': 'phone',
          'mobile': 'phone',
          
          'mail': 'email',
          'e-mail': 'email',
          
          'registered voter': 'registered',
          'voter': 'registered',
          'is registered': 'registered',
          
          'tag': 'tags',
          'categories': 'tags',
          'labels': 'tags',
          
          'comment': 'notes',
          'comments': 'notes',
          'note': 'notes',
          
          'contacted': 'last_contacted',
          'last contact': 'last_contacted',
          'contact date': 'last_contacted'
        };
        
        // Check if the header matches one of our known fields or their variations
        if (voterFields.some(field => field.value === lower)) {
          return lower;
        } else if (fieldMap[lower]) {
          return fieldMap[lower];
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

  const handleImportOptionChange = (option, value) => {
    setImportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleIdentifierChange = (identifier, checked) => {
    setImportOptions(prev => {
      let newIdentifiers = [...prev.identifyBy];
      
      if (checked && !newIdentifiers.includes(identifier)) {
        newIdentifiers.push(identifier);
      } else if (!checked && newIdentifiers.includes(identifier)) {
        newIdentifiers = newIdentifiers.filter(id => id !== identifier);
      }
      
      return {
        ...prev,
        identifyBy: newIdentifiers
      };
    });
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

    // Ensure at least one identifier is selected if handling duplicates
    if (importOptions.handleDuplicates !== 'replace' && importOptions.identifyBy.length === 0) {
      setError('Please select at least one field to identify duplicates.');
      return;
    }

    // Rebuild CSV data based on the mapping:
    // - Use only columns where mapping is not set to "ignore"
    const mappedFields = mapping.filter(field => field !== 'ignore');
    const newRows = [];
    // Create a new header row from the mapping selections
    newRows.push(mappedFields);

    // Loop over each remaining row and build a new row based on the mapping
    for (let i = 1; i < csvData.length; i++) {
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

    // Now send the CSV to the backend with import options
    setUploading(true);
    try {
      const formData = new FormData();
      // Create a Blob from the CSV content and append it as a file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      formData.append('file', blob, 'voters.csv');
      
      // Add import options to the request
      formData.append('handle_duplicates', importOptions.handleDuplicates);
      formData.append('identify_by', JSON.stringify(importOptions.identifyBy));
      formData.append('update_existing', importOptions.updateExisting.toString());
      formData.append('match_threshold', importOptions.importMatchThreshold.toString());

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
    <div className="csv-import-mapping-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Import Voters CSV</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        {error && <div className="error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        
        <div className="import-section">
          <h3>Step 1: Select CSV File</h3>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="file-input"
          />
          <p className="help-text">Select a CSV file containing voter information.</p>
        </div>
        
        {csvData.length > 0 && (
          <>
            <div className="import-section">
              <h3>Step 2: Map Columns</h3>
              <p className="help-text">Match each column in your CSV to the appropriate voter field.</p>
              <div className="csv-preview" style={{ overflowX: 'auto' }}>
                <table className="mapping-table">
                  <thead>
                    <tr>
                      {csvData[0].map((header, index) => (
                        <th key={index}>
                          <div className="column-header">{header}</div>
                          <select
                            value={mapping[index]}
                            onChange={(e) => handleMappingChange(index, e.target.value)}
                            className="field-selector"
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
                          <td key={cellIndex} className="data-cell">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="preview-note">Showing preview of first 5 rows.</p>
              </div>
            </div>
            
            <div className="import-section">
              <div className="section-header">
                <h3>Step 3: Duplicate Handling</h3>
                <button 
                  onClick={() => setShowHelp(!showHelp)}
                  className="help-button"
                  title="Show help"
                >
                  ❓
                </button>
              </div>
              
              {showHelp && (
                <div className="help-box">
                  <h4>ℹ️ Duplicate Handling Options</h4>
                  <ul>
                    <li><strong>Merge:</strong> Combine data from both records, keeping the most complete information.</li>
                    <li><strong>Skip:</strong> Keep existing records, only import new ones.</li>
                    <li><strong>Replace:</strong> Overwrite existing records with imported data.</li>
                  </ul>
                  <h4>ℹ️ Identify Duplicates By</h4>
                  <ul>
                    <li><strong>Email:</strong> Match based on email address.</li>
                    <li><strong>Phone:</strong> Match based on phone number.</li>
                    <li><strong>Name & Address:</strong> Match based on name and address similarity.</li>
                  </ul>
                  <button onClick={() => setShowHelp(false)}>Close Help</button>
                </div>
              )}
              
              <div className="duplicate-options">
                <div className="option-group">
                  <label>How to handle duplicates:</label>
                  <select
                    value={importOptions.handleDuplicates}
                    onChange={(e) => handleImportOptionChange('handleDuplicates', e.target.value)}
                    className="option-select"
                  >
                    <option value="merge">Merge Records (Recommended)</option>
                    <option value="skip">Skip Duplicates</option>
                    <option value="replace">Replace Existing Records</option>
                  </select>
                </div>
                
                <div className="option-group">
                  <label>Identify duplicates by:</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={importOptions.identifyBy.includes('email')}
                        onChange={(e) => handleIdentifierChange('email', e.target.checked)}
                        disabled={importOptions.handleDuplicates === 'replace'}
                      />
                      Email
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={importOptions.identifyBy.includes('phone')}
                        onChange={(e) => handleIdentifierChange('phone', e.target.checked)}
                        disabled={importOptions.handleDuplicates === 'replace'}
                      />
                      Phone
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={importOptions.identifyBy.includes('name_address')}
                        onChange={(e) => handleIdentifierChange('name_address', e.target.checked)}
                        disabled={importOptions.handleDuplicates === 'replace'}
                      />
                      Name & Address
                    </label>
                  </div>
                </div>
                
                {importOptions.handleDuplicates === 'merge' && (
                  <div className="option-group">
                    <label>Match threshold:</label>
                    <div className="range-container">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={importOptions.importMatchThreshold}
                        onChange={(e) => handleImportOptionChange('importMatchThreshold', parseInt(e.target.value))}
                        className="range-slider"
                      />
                      <span className="range-value">{importOptions.importMatchThreshold}%</span>
                    </div>
                    <p className="range-description">
                      Higher values require closer matches. Recommended: 80%.
                    </p>
                  </div>
                )}
                
                {importOptions.handleDuplicates !== 'replace' && (
                  <div className="option-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={importOptions.updateExisting}
                        onChange={(e) => handleImportOptionChange('updateExisting', e.target.checked)}
                        disabled={importOptions.handleDuplicates === 'replace'}
                      />
                      Update existing records with new information
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="import-actions">
              <button onClick={onClose} className="cancel-button">
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={uploading} 
                className="import-button"
              >
                {uploading ? 'Importing...' : 'Import Voters'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CSVImportMappingModal;
