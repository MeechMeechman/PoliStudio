import React, { useState, useEffect } from 'react';
import { createCampaign, getCampaigns, getCampaignStats, exportCampaignData, deleteCampaign } from '../services/phoneBankingService';
import PhoneBankingStats from './PhoneBankingStats';
import VoterSelectionModal from './VoterSelectionModal';
import '../styles/PhoneBanking.css';

function PhoneBankingAdmin() {
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    callsPerVolunteer: 10,
    script: '',
    includeVoters: false,
    minSupportLevel: 0,
    voterAddressFilter: ''
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
  const [showVoterModal, setShowVoterModal] = useState(false);
  const [selectedVoterIds, setSelectedVoterIds] = useState([]);
  
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
      
      formDataToSend.append('include_voters', formData.includeVoters.toString());
      
      if (formData.includeVoters && selectedVoterIds.length > 0) {
        formDataToSend.append('selected_voter_ids', JSON.stringify(selectedVoterIds));
      } else if (formData.includeVoters) {
        formDataToSend.append('min_support_level', formData.minSupportLevel.toString());
        if (formData.voterAddressFilter) {
          formDataToSend.append('voter_address_filter', formData.voterAddressFilter);
        }
      }

      const response = await createCampaign(formDataToSend);
      setCampaigns([...campaigns, response]);
      
      // Reset form and selected voters
      setFormData({
        name: '',
        description: '',
        callsPerVolunteer: 10,
        script: '',
        includeVoters: false,
        minSupportLevel: 0,
        voterAddressFilter: ''
      });
      setFile(null);
      setSelectedVoterIds([]);
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
        <div className="campaign-form-wrapper">
          <div className="campaign-form-card">
            <h3>Create New Campaign</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Campaign Name:</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Calls Per Volunteer:</label>
                <input
                  type="number"
                  name="callsPerVolunteer"
                  className="form-control"
                  value={formData.callsPerVolunteer}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Call Script:</label>
                <textarea
                  name="script"
                  className="form-control"
                  value={formData.script}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Enter the script volunteers should follow..."
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Include Voters from Voter List
                  <input
                    type="checkbox"
                    name="includeVoters"
                    checked={formData.includeVoters}
                    onChange={handleInputChange}
                    style={{ margin: 0, padding: '0.1rem', width: '50%' }}
                  />
                </label>
              </div>
              {formData.includeVoters && (
                <>
                  <div className="form-group">
                    <label>Minimum Support Level:</label>
                    <input
                      type="number"
                      name="minSupportLevel"
                      className="form-control"
                      value={formData.minSupportLevel}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Voter Address Filter (optional):</label>
                    <input
                      type="text"
                      name="voterAddressFilter"
                      className="form-control"
                      value={formData.voterAddressFilter}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <button 
                      type="button"
                      className="secondary-button"
                      onClick={() => setShowVoterModal(true)}
                    >
                      Select Voters
                    </button>
                    {selectedVoterIds.length > 0 && (
                      <p>{selectedVoterIds.length} voters selected.</p>
                    )}
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Contact List (CSV):</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    required={!formData.includeVoters}
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
                      onClick={(e) => handleDeleteCampaign(campaign.id, e)}
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

      {showVoterModal && (
        <VoterSelectionModal
          initialSelected={selectedVoterIds}
          onClose={() => setShowVoterModal(false)}
          onConfirm={(selectedIds) => { setSelectedVoterIds(selectedIds); setShowVoterModal(false); }}
        />
      )}
    </div>
  );
}

export default PhoneBankingAdmin; 