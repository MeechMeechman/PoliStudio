import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getTurfVoters, logCanvassingInteraction } from '../services/doorKnockingService';
import '../styles/DoorKnockingVolunteer.css';

const InteractionForm = ({ voter, turfId, onClose }) => {
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const logData = {
        voter_id: voter.id,
        turf_id: turfId,
        result,
        notes
      };
      await logCanvassingInteraction(logData);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'notification success';
      successMessage.textContent = 'Interaction recorded successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
      
      onClose();
    } catch (error) {
      console.error('Error recording interaction:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'notification error';
      errorMessage.textContent = 'Failed to record interaction. Please try again.';
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="interaction-form">
      <div className="form-header">
        <h3>Record Interaction for {voter.first_name} {voter.last_name}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Result:</label>
          <select 
            className="form-select"
            value={result} 
            onChange={e => setResult(e.target.value)} 
            required
          >
            <option value="">Select a result</option>
            <option value="Support">Support</option>
            <option value="Leaning Support">Leaning Support</option>
            <option value="Undecided">Undecided</option>
            <option value="Leaning Against">Leaning Against</option>
            <option value="Against">Against</option>
            <option value="No Contact">No Contact</option>
            <option value="Refused">Refused</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes:</label>
          <textarea 
            className="form-control form-textarea"
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Enter any additional details or observations..."
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Interaction'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose} 
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const DoorKnockingVolunteer = () => {
  const { volunteerId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const turfId = searchParams.get('turf');

  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interactionVoter, setInteractionVoter] = useState(null);
  const [completionStatus, setCompletionStatus] = useState({
    total: 0,
    completed: 0,
    percentage: 0
  });
  const [turfName, setTurfName] = useState('');

  // Modify the API service call to not require authentication
  const fetchTurfVotersNoAuth = async (id) => {
    try {
      // Special version that doesn't require authentication
      const response = await fetch(`http://127.0.0.1:8000/door-knocking/turf/${id}/voters?public=true`);
      if (!response.ok) throw new Error('Failed to fetch voters');
      return await response.json();
    } catch (error) {
      console.error('Error fetching turf voters:', error);
      return [];
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (turfId) {
        try {
          // Use the non-authenticated fetch function
          const data = await fetchTurfVotersNoAuth(turfId);
          setVoters(data);
          
          // Calculate completion stats
          const total = data.length;
          const completed = data.filter(voter => voter.status === 'completed').length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          setCompletionStatus({
            total,
            completed,
            percentage
          });
          
          // Get turf name if available
          if (data.length > 0 && data[0].turf_name) {
            setTurfName(data[0].turf_name);
          } else {
            setTurfName(`Turf #${turfId}`);
          }
          
        } catch (error) {
          console.error('Error fetching turf data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    fetchData();
  }, [turfId]);

  if (loading) {
    return (
      <div className="volunteer-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <div>Loading your assigned turf information...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="volunteer-app-header">
        <div className="volunteer-app-logo">
          <Link to="/">PoliStudio</Link>
        </div>
      </header>
      <div className="volunteer-container">
        <div className="volunteer-header">
          <h1>Door Knocking Assignment</h1>
          <p>Thank you for volunteering your time to help with our campaign!</p>
        </div>
        
        <div className="volunteer-card">
          <div className="volunteer-card-header">
            <h2>Your Assignment</h2>
            <div className="turf-badge">{turfName}</div>
          </div>
          
          <div className="completion-status">
            <div className="completion-number">{completionStatus.percentage}%</div>
            <p>
              You've completed {completionStatus.completed} out of {completionStatus.total} voter contacts in this turf.
            </p>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>Voters in Your Turf</h3>
            {voters.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No voters assigned</div>
                <p className="empty-state-subtext">There are no voters assigned to this turf yet.</p>
              </div>
            ) : (
              <ul className="voter-list">
                {voters.map((voter) => (
                  <li key={voter.id} className="voter-item">
                    <div className="voter-info">
                      <div className="voter-name">
                        {voter.first_name} {voter.last_name}
                        {voter.status === 'completed' && (
                          <span className="status-badge success">Contacted</span>
                        )}
                      </div>
                      <div className="voter-address">{voter.address}</div>
                      {voter.support_level && (
                        <div className="voter-support">Support Level: {voter.support_level}</div>
                      )}
                    </div>
                    <div className="voter-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setInteractionVoter(voter)}
                      >
                        Record Interaction
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {interactionVoter && (
          <InteractionForm 
            voter={interactionVoter} 
            turfId={turfId} 
            onClose={() => setInteractionVoter(null)} 
          />
        )}
      </div>
    </>
  );
};

export default DoorKnockingVolunteer;