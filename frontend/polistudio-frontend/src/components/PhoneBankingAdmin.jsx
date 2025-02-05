import React, { useState, useEffect } from 'react';
import { createCampaign, getCampaigns, getCampaignStats, exportCampaignData, deleteCampaign } from '../services/phoneBankingService';
import PhoneBankingStats from './PhoneBankingStats';
import '../styles/PhoneBanking.css';

function PhoneBankingAdmin() {
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    callsPerVolunteer: 10,
    script: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [showCSVExample, setShowCSVExample] = useState(false);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [statsFilter, setStatsFilter] = useState("all");
  
  const exampleCSV = `first_name,last_name,phone_number,additional_info
John,Doe,555-0123,Preferred time: evenings
Jane,Smith,555-0124,Spanish speaker
Bob,Johnson,555-0125,Do not call after 8pm`;

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignStats(selectedCampaign.id);
    }
  }, [selectedCampaign, statsFilter]);

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError('Failed to fetch campaigns');
    }
  };

  const fetchCampaignStats = async (campaignId) => {
    try {
      const stats = await getCampaignStats(campaignId, statsFilter);
      setCampaignStats(stats);
    } catch (err) {
      setError('Failed to fetch campaign statistics');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('script', formData.script);
      formDataToSend.append('calls_per_volunteer', formData.callsPerVolunteer.toString());
      
      if (file) {
        formDataToSend.append('contacts_file', file);
      }

      formDataToSend.append('include_voters', 'false');
      formDataToSend.append('min_support_level', '0');

      const response = await createCampaign(formDataToSend);
      setCampaigns([...campaigns, response]); // Remove .campaign since backend returns the campaign directly
      
      setFormData({
        name: '',
        description: '',
        callsPerVolunteer: 10,
        script: '',
      });
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (campaignId) => {
    setExportLoading(true);
    try {
      await exportCampaignData(campaignId);
    } catch (err) {
      setError('Failed to export campaign data');
    } finally {
      setExportLoading(false);
    }
  };

  const copyExample = () => {
    navigator.clipboard.writeText(exampleCSV);
    setError('Example CSV copied to clipboard!');
    setTimeout(() => setError(''), 3000);
  };

  const handleDeleteCampaign = async (campaignId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        await deleteCampaign(campaignId);
        setCampaigns(campaigns.filter(c => c.id !== campaignId));
        if (selectedCampaign?.id === campaignId) {
          setSelectedCampaign(null);
        }
      } catch (err) {
        setError('Failed to delete campaign');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleExport = (campaignId) => {
    handleExportData(campaignId);
  };

  const handleDelete = (campaignId, e) => {
    handleDeleteCampaign(campaignId, e);
  };

  const handleStatsFilterChange = (e) => {
    setStatsFilter(e.target.value);
  };

  return (
    <div className="phone-banking-admin">
      <header className="admin-header">
        <h2>Phone Banking Campaigns</h2>
        <button 
          className="primary-button"
          onClick={() => setShowNewCampaignForm(!showNewCampaignForm)}
        >
          {showNewCampaignForm ? '← Back to Campaigns' : '+ New Campaign'}
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {showNewCampaignForm ? (
        <div className="campaign-form">
          <h3>Create New Campaign</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Campaign Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Calls per Volunteer:</label>
              <input
                type="number"
                name="callsPerVolunteer"
                value={formData.callsPerVolunteer}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Call Script:</label>
              <textarea
                name="script"
                value={formData.script}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Enter the script volunteers should follow..."
              />
            </div>

            <div className="form-group">
              <label>Contact List (CSV):</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
                <button 
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCSVExample(!showCSVExample)}
                >
                  View CSV Format
                </button>
              </div>
              {showCSVExample && (
                <div className="csv-example">
                  <h4>Example CSV Format:</h4>
                  <pre>{exampleCSV}</pre>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="primary-button"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="campaigns-container">
          <div className="campaigns-list">
            {campaigns.map(campaign => (
              <div 
                key={campaign.id} 
                className={`campaign-card ${selectedCampaign?.id === campaign.id ? 'selected' : ''}`}
                onClick={() => handleCampaignSelect(campaign)}
              >
                <div className="campaign-header">
                  <h3>{campaign.name}</h3>
                  <div className="campaign-actions">
                    <button
                      className="icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(campaign.id);
                      }}
                      title="Export data"
                    >
                      📊
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={(e) => handleDelete(campaign.id, e)}
                      title="Delete campaign"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <p className="campaign-description">{campaign.description}</p>
                
                <div className="campaign-meta">
                  <div className="volunteer-link">
                    <label>Volunteer Link:</label>
                    <div className="link-container">
                      <input
                        type="text"
                        value={`${window.location.origin}/phone-banking/volunteer/${campaign.id}`}
                        readOnly
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        className="copy-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(`${window.location.origin}/phone-banking/volunteer/${campaign.id}`);
                        }}
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  <div className="campaign-info">
                    <span>Calls per volunteer: {campaign.calls_per_volunteer}</span>
                    <br></br>
                    <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedCampaign && campaignStats && (
            <div className="selected-campaign-details">
              <div className="campaign-stats-dropdown">
                <select value={statsFilter} onChange={handleStatsFilterChange}>
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <PhoneBankingStats 
                campaign={selectedCampaign} 
                stats={campaignStats}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PhoneBankingAdmin; 