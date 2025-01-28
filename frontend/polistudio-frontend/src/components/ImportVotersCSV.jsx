import React, { useState } from 'react';

function ImportVotersCSV() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file.');
      setFile(null);
    } else {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');

    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/import/voters', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload CSV');
      }
      
      const data = await response.json();
      setStatus(`Successfully imported ${data.imported_count} voters!`);
      setFile(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="import-csv">
      <h2>Import Voters CSV</h2>
      <p className="instructions">
        Upload a CSV file with the following columns:<br />
        <code>first_name, last_name, district, support_level</code>
      </p>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-container">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            disabled={uploading}
          />
          {file && <p className="file-name">Selected: {file.name}</p>}
        </div>
        
        <button 
          type="submit" 
          disabled={!file || uploading}
          className={uploading ? 'uploading' : ''}
        >
          {uploading ? 'Importing...' : 'Import CSV'}
        </button>
      </form>

      {status && <p className="success-message">{status}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ImportVotersCSV; 