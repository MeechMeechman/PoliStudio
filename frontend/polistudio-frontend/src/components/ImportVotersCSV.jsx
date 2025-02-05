import React, { useState } from 'react';

function ImportVotersCSV() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const exampleCSV = `first_name,last_name,district,support_level,phone,email
John,Doe,District 1,3,555-0123,john@example.com
Jane,Smith,District 2,4,555-0124,jane@example.com`;

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
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const copyExample = () => {
    navigator.clipboard.writeText(exampleCSV);
    setStatus('Example CSV copied to clipboard!');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="import-csv">
      <h2>Import Voters CSV</h2>
      
      <div className="import-guidelines">
        <h3>CSV Format Guidelines</h3>
        <div className="guidelines-content">
          <div className="required-fields">
            <h4>Required Fields:</h4>
            <ul>
              <li><code>first_name</code> - Voter's first name</li>
              <li><code>last_name</code> - Voter's last name</li>
            </ul>
          </div>
          
          <div className="optional-fields">
            <h4>Optional Fields:</h4>
            <ul>
              <li><code>district</code> - Voter's district</li>
              <li><code>support_level</code> - Number from 0-5 (0 = unknown, 5 = strong support)</li>
              <li><code>phone</code> - Phone number (used for phone banking)</li>
              <li><code>email</code> - Email address</li>
            </ul>
          </div>

          <div className="example-section">
            <h4>Example CSV Format:</h4>
            <button 
              className="toggle-example" 
              onClick={() => setShowExample(!showExample)}
            >
              {showExample ? 'Hide Example' : 'Show Example'}
            </button>
            
            {showExample && (
              <div className="csv-example">
                <pre>{exampleCSV}</pre>
                <button className="copy-example" onClick={copyExample}>
                  Copy Example
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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