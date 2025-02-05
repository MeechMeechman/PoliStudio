import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import '../styles/DonorTracking.css';
import Chart from 'chart.js/auto';

function DonorTracking() {
  const [donors, setDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchDonors();
    fetchAnalytics();
  }, []);

  const fetchDonors = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/donors');
      setDonors(response.data);
    } catch (error) {
      console.error('Error fetching donors', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/donations/report');
      console.log('Analytics data:', response.data);
      let analyticsData = response.data;
      // If the trends object is missing or empty, use fallback dummy data.
      if (
        !analyticsData.trends ||
        !analyticsData.trends.labels ||
        analyticsData.trends.labels.length === 0
      ) {
        analyticsData = {
          ...analyticsData,
          trends: {
            labels: ['Jan', 'Feb', 'Mar'],
            data: [100, 200, 150]
          }
        };
      }
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics', error);
    }
  };

  const handleDonorAdded = () => {
    fetchDonors();
    setShowDonorForm(false);
    setEditingDonor(null);
  };

  const handleEditDonor = (donor) => {
    setEditingDonor(donor);
    setShowDonorForm(true);
  };

  const handleDeleteDonor = async (donorId) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/donors/${donorId}`);
        fetchDonors();
      } catch (err) {
        console.error(err);
        alert('Failed to delete donor');
      }
    }
  };

  const handleSearch = (donor) => {
    const term = searchTerm.toLowerCase();
    return (
      donor.name.toLowerCase().includes(term) ||
      donor.email.toLowerCase().includes(term) ||
      (donor.phone && donor.phone.toLowerCase().includes(term))
    );
  };

  const handleExportReport = () => {
    axios
      .get('http://127.0.0.1:8000/donations/report', { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'donations_report.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to export report');
      });
  };

  return (
    <div className="donor-tracking">
      <header className="donor-header">
        <h1>Donor Tracking</h1>
        <div className="header-actions">
          <button onClick={() => { setEditingDonor(null); setShowDonorForm(true) }}>Add Donor</button>
          <button onClick={() => setShowCSVImport(true)}>Import CSV</button>
          <button onClick={handleExportReport}>Export Report</button>
        </div>
      </header>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search donors..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="content">
        <div className="donor-table-container">
          <table className="donor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Contributions</th>
                <th>Last Donation Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor) => (
                <tr key={donor.id}>
                  <td>{donor.name}</td>
                  <td>{donor.email}</td>
                  <td>{donor.phone || 'N/A'}</td>
                  <td>{donor.amount_donated || 0}</td>
                  <td>{donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEditDonor(donor)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteDonor(donor.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AnalyticsCard analytics={analytics} />
      </div>
      {showDonorForm && (
        <DonorForm onClose={() => setShowDonorForm(false)} onDonorAdded={handleDonorAdded} donor={editingDonor} />
      )}
      {showCSVImport && (
        <CSVImportModal onClose={() => setShowCSVImport(false)} onImportSuccess={fetchDonors} />
      )}
    </div>
  );
}

function AnalyticsCard({ analytics }) {
  if (!analytics) return null;
  return (
    <section className="analytics">
      <h2>Analytics</h2>
      <p>Total Donations: {analytics.total_donations}</p>
      <p>
        Top Donors:{' '}
        {analytics.top_donors &&
          analytics.top_donors.map(d => `${d.name} ($${d.total})`).join(', ')}
      </p>
      <div className="trends-chart">
        <h4>Donation Trends</h4>
        {analytics.trends ? (
          <DonationTrendsChart trends={analytics.trends} />
        ) : (
          <p>No donation trends data available</p>
        )}
      </div>
    </section>
  );
}

function DonationTrendsChart({ trends }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && trends) {
      const ctx = chartRef.current.getContext('2d');

      // Destroy previous chart instance if it exists
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      chartRef.current.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trends.labels, // e.g., ["January", "February", "March"]
          datasets: [{
            label: 'Donations Over Time',
            data: trends.data,  // e.g., [500, 800, 1200]
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }, [trends]);

  return <canvas ref={chartRef} width="400" height="200"></canvas>;
}

function DonorForm({ onClose, onDonorAdded, donor }) {
  const [formData, setFormData] = useState({
    name: donor ? donor.name : '',
    email: donor ? donor.email : '',
    phone: donor ? donor.phone : '',
    address: donor ? donor.address : '',
    campaign_id: donor ? donor.campaign_id : '',
    amount_donated: donor ? donor.amount_donated : '',
    last_donation_date: donor && donor.last_donation_date
      ? new Date(donor.last_donation_date).toISOString().split('T')[0]
      : '',
    is_recurring: donor ? donor.is_recurring : false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      campaign_id: formData.campaign_id === '' ? null : parseInt(formData.campaign_id, 10),
      amount_donated: formData.amount_donated === '' ? null : parseFloat(formData.amount_donated),
      last_donation_date:
        formData.last_donation_date === ''
          ? null
          : new Date(formData.last_donation_date).toISOString(),
    };

    try {
      if (donor) {
        await axios.put(`http://127.0.0.1:8000/donors/${donor.id}`, payload);
      } else {
        await axios.post(`http://127.0.0.1:8000/donors`, payload);
      }
      onDonorAdded();
    } catch (err) {
      console.error(err);
      alert('Error saving donor');
    }
  };

  return (
    <div className="modal donor-form-modal">
      <div className="modal-content">
        <h2>{donor ? 'Edit Donor' : 'Add Donor'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input name="phone" type="text" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address:</label>
            <input name="address" type="text" value={formData.address} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Campaign (ID):</label>
            <input name="campaign_id" type="text" value={formData.campaign_id} onChange={handleChange} placeholder="Campaign ID" />
          </div>
          <div className="form-group">
            <label>Donation Amount:</label>
            <input name="amount_donated" type="number" value={formData.amount_donated} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Donation Date:</label>
            <input name="last_donation_date" type="date" value={formData.last_donation_date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>
              <input name="is_recurring" type="checkbox" checked={formData.is_recurring} onChange={handleChange} />
              Recurring Donation
            </label>
          </div>
          <div className="modal-actions">
            <button type="submit">{donor ? 'Update' : 'Add'}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CSVImportModal({ onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
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
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('http://127.0.0.1:8000/donors/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onImportSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to import CSV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal csv-import-modal">
      <div className="modal-content">
        <h2>Import Donors CSV</h2>
        <form onSubmit={handleSubmit}>
          <input type="file" accept=".csv" onChange={handleFileChange} required />
          {error && <div className="error">{error}</div>}
          <div className="modal-actions">
            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Import'}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DonorTracking; 