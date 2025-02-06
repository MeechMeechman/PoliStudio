import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getTurfVoters, logCanvassingInteraction } from '../services/doorKnockingService';

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
      alert('Interaction recorded successfully.');
      onClose();
    } catch (error) {
      console.error('Error recording interaction:', error);
      alert('Error recording interaction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem' }}>
      <h3>Record Interaction for {voter.first_name} {voter.last_name}</h3>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>
          Result:
          <select 
            value={result} 
            onChange={e => setResult(e.target.value)} 
            required 
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="">Select</option>
            <option value="Support">Support</option>
            <option value="No Contact">No Contact</option>
            <option value="Refused">Refused</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>
          Notes:
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Additional details..."
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          />
        </label>
      </div>
      <div>
        <button type="submit" disabled={submitting}>Submit</button>
        <button type="button" onClick={onClose} disabled={submitting} style={{ marginLeft: '0.5rem' }}>Cancel</button>
      </div>
    </form>
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

  useEffect(() => {
    async function fetchVoters() {
      if (turfId) {
        try {
          const data = await getTurfVoters(turfId);
          setVoters(data);
        } catch (error) {
          console.error('Error fetching turf voters:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    fetchVoters();
  }, [turfId]);

  if (loading) {
    return <div>Loading your assigned turf information...</div>;
  }

  return (
    <div>
      <h2>Door Knocking Assignment</h2>
      <p>Volunteer ID: {volunteerId}</p>
      <p>Assigned Turf ID: {turfId}</p>
      <div>
        <h3>Voters in Your Turf</h3>
        {voters.length === 0 ? (
          <p>No voters found in your turf.</p>
        ) : (
          <ul>
            {voters.map((voter) => (
              <li key={voter.id} style={{ marginBottom: '0.5rem' }}>
                {voter.first_name} {voter.last_name} - {voter.address}
                <button onClick={() => setInteractionVoter(voter)} style={{ marginLeft: '1rem' }}>
                  Record Interaction
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {interactionVoter && (
        <InteractionForm 
          voter={interactionVoter} 
          turfId={turfId} 
          onClose={() => setInteractionVoter(null)} 
        />
      )}
    </div>
  );
};

export default DoorKnockingVolunteer;