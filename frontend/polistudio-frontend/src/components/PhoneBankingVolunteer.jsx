import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getVolunteerCalls, updateCallStatus, getCampaignInfo } from '../services/phoneBankingService';
import VolunteerForm from './VolunteerForm';

function PhoneBankingVolunteer() {
  const { campaignId } = useParams();
  const [calls, setCalls] = useState([]);
  const [currentCallIndex, setCurrentCallIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [campaignInfo, setCampaignInfo] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [supportLevel, setSupportLevel] = useState(0);
  const [showVolunteerForm, setShowVolunteerForm] = useState(true);

  const currentCall = calls[currentCallIndex];

  const handleVolunteerSubmit = async (id) => {
    setLoading(true);
    try {
      const data = await getVolunteerCalls(campaignId, id);
      setCalls(data.calls);
      setCampaignInfo(data.campaign);
      setShowVolunteerForm(false);
    } catch (err) {
      setError('Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  const handleCallUpdate = async () => {
    if (!currentCall || !status) return;

    try {
      console.log('Updating call:', {
        id: currentCall.id,
        status,
        notes,
        supportLevel
      });

      await updateCallStatus(
        currentCall.id,
        status,
        notes,
        supportLevel
      );
      
      // Update local state
      const updatedCalls = [...calls];
      updatedCalls[currentCallIndex] = {
        ...updatedCalls[currentCallIndex],
        status: status,
        notes: notes,
        support_level: supportLevel,
        completed: true
      };
      setCalls(updatedCalls);
      
      // Move to next call if available
      if (currentCallIndex < calls.length - 1) {
        setCurrentCallIndex(currentCallIndex + 1);
        // Reset form for next call
        setStatus('');
        setNotes('');
        setSupportLevel(0);
      }
    } catch (err) {
      console.error('Error updating call:', err);
      setError('Failed to update call status');
    }
  };

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const data = await getCampaignInfo(campaignId);
        console.log('Campaign Info:', data);
        setCampaignInfo(data);
      } catch (err) {
        setError('Failed to load campaign information');
      }
    };
    
    fetchCampaignData();
  }, [campaignId]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (showVolunteerForm) {
    return (
      <div className="volunteer-login">
        <h2>Enter Volunteer Information</h2>
        <VolunteerForm onSubmit={handleVolunteerSubmit} />
      </div>
    );
  }

  return (
    <div className="phone-banking-volunteer">
      <h2>{campaignInfo?.name}</h2>
      <p>{currentCallIndex} of {calls.length} calls completed</p>

      <div className="current-contact">
        <h3>Current Contact</h3>
        {currentCall && (
          <>
            <p><strong>Name:</strong> {currentCall.first_name} {currentCall.last_name}</p>
            <p><strong>Phone:</strong> {currentCall.phone_number}</p>
            {currentCall.additional_info && (
              <p><strong>Additional Info:</strong> {currentCall.additional_info}</p>
            )}
          </>
        )}
      </div>

      <div className="script">
        <h3>Script</h3>
        <div className="script-content">
          {campaignInfo?.script}
        </div>
      </div>

      <div className="call-form">
        <h3>Call Result</h3>
        <div className="form-group">
          <label>Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Select status...</option>
            <option value="completed">Completed</option>
            <option value="no_answer">No Answer</option>
            <option value="wrong_number">Wrong Number</option>
            <option value="call_back">Call Back Later</option>
            <option value="refused">Refused</option>
          </select>
        </div>

        <div className="form-group">
          <label>Support Level (1-5):</label>
          <input
            type="number"
            min="1"
            max="5"
            value={supportLevel || ''}
            onChange={(e) => setSupportLevel(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label>Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any relevant notes about the call..."
          />
        </div>

        <div className="navigation-buttons">
          <button
            onClick={() => setCurrentCallIndex(Math.max(0, currentCallIndex - 1))}
            disabled={currentCallIndex === 0}
          >
            Previous Call
          </button>
          <button
            onClick={handleCallUpdate}
            disabled={!status}
          >
            Next Call
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhoneBankingVolunteer; 