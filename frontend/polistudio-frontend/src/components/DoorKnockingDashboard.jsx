import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import VoterDetailsModal from './VoterDetailsModal';
import { 
  getTurfs, 
  createTurf, 
  getTurfVoters, 
  assignTurfToVolunteer, 
  getVolunteerProgress,
  getVolunteers,
  getTurfProgress,
  deleteTurf
} from '../services/doorKnockingService';
import { getVoters } from '../services/voterService';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

function DrawingMap({ setTurfBoundary, turfBoundary, voters }) {
  const onCreated = (e) => {
    const layer = e.layer;
    if (layer instanceof L.Polygon) {
      const latlngs = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
      setTurfBoundary(latlngs);
    }
  };

  return (
    <MapContainer center={[44.9778, -93.2650]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FeatureGroup>
        <EditControl 
          position="topright"
          onCreated={onCreated}
          draw={{
            polygon: true,
            rectangle: false,
            circle: false,
            marker: false,
            polyline: false,
            circlemarker: false,
          }}
          edit={{
            edit: false,
            remove: false,
          }}
        />
      </FeatureGroup>
      {turfBoundary && turfBoundary.length > 0 && <Polygon positions={turfBoundary} />}
      {voters.map((voter) => (
        voter.lat && voter.lng && (
          <Marker key={voter.id} position={[voter.lat, voter.lng]}>
            <Popup>
              <strong>{voter.first_name} {voter.last_name}</strong>
              <br />
              {voter.address}
              <br />
              Support Level: {voter.support_level}
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}

function TurfTable({ voters, onVoterClick }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f2f2f2' }}>
          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Age</th>
          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Party</th>
          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Voting History</th>
        </tr>
      </thead>
      <tbody>
        {voters.map(voter => (
          <tr 
            key={voter.id} 
            style={{ cursor: 'pointer', border: '1px solid #ddd' }} 
            onClick={() => onVoterClick(voter)}>
            <td style={{ padding: '8px' }}>{voter.first_name} {voter.last_name}</td>
            <td style={{ padding: '8px' }}>{voter.age || 'N/A'}</td>
            <td style={{ padding: '8px' }}>{voter.party || 'N/A'}</td>
            <td style={{ padding: '8px' }}>{voter.voting_history ? voter.voting_history.join(', ') : 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function VolunteerAssignment({ volunteers, onAssign }) {
  return (
    <div>
      <h3>Assign Turf to Volunteer</h3>
      <ul>
        {volunteers.map(vol => (
          <li key={vol.id}>
            {vol.first_name} {vol.last_name} <button onClick={() => onAssign(vol.id)}>Assign Turf</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProgressTracker({ progress }) {
  return (
    <div>
      <h3>Canvassing Progress</h3>
      {progress.length === 0 ? (
        <p>No interactions logged yet.</p>
      ) : (
        progress.map(item => (
          <div key={item.turf_id}>
            <strong>{item.turf_name}</strong>: {item.total_interactions} interactions logged
          </div>
        ))
      )}
    </div>
  );
}

function DoorKnockingDashboard() {
  const [turfBoundary, setTurfBoundary] = useState([]);
  const [voters, setVoters] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [currentTurf, setCurrentTurf] = useState(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState('volunteers');
  const [loading, setLoading] = useState(true);
  const [assignmentLink, setAssignmentLink] = useState('');
  const [turfs, setTurfs] = useState([]);

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        const volunteerData = await getVolunteers();
        setVolunteers(volunteerData);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      }
    }
    fetchVolunteers();
  }, []);

  useEffect(() => {
    async function fetchVoters() {
      try {
        const data = await getVoters();
        setVoters(data);
      } catch (error) {
        console.error('Error fetching voters:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVoters();
  }, []);

  const handleCreateTurf = async () => {
    if (turfBoundary.length === 0) {
      alert("Please draw a turf boundary on the map.");
      return;
    }
    const turfData = {
      name: 'Sample District',
      boundary: JSON.stringify(turfBoundary)
    };
    try {
      const newTurf = await createTurf(turfData);
      setCurrentTurf(newTurf);
      alert('Turf created successfully');
      const votersData = await getTurfVoters(newTurf.id);
      setVoters(votersData);
    } catch (error) {
      console.error(error);
      alert('Error creating turf');
    }
  };

  const refreshAnalytics = async () => {
    if (currentTurf) {
      try {
        const progressData = await getTurfProgress(currentTurf.id);
        setProgress([progressData]);
      } catch (error) {
        console.error('Error fetching turf progress:', error);
      }
    }
  };

  useEffect(() => {
    if (activeSidebarTab === 'analytics' && currentTurf) {
      refreshAnalytics();
    } else if (activeSidebarTab === 'turfs') {
      fetchTurfs();
    }
  }, [activeSidebarTab, currentTurf]);

  const fetchTurfs = async () => {
    try {
      const turfsData = await getTurfs();
      setTurfs(turfsData);
    } catch (error) {
      console.error('Error fetching turfs:', error);
    }
  };

  const handleDeleteTurf = async (turfId) => {
    if (window.confirm("Are you sure you want to delete this turf?")) {
      try {
        await deleteTurf(turfId);
        alert("Turf deleted successfully.");
        fetchTurfs();
      } catch (error) {
        console.error("Error deleting turf:", error);
        alert("Failed to delete turf.");
      }
    }
  };

  const handleAssignTurf = async (volunteerId) => {
    if (!currentTurf) {
      alert('No turf created to assign');
      return;
    }
    try {
      await assignTurfToVolunteer(volunteerId, currentTurf.id);
      const volunteerLink = `${window.location.origin}/door-knocking/volunteer/${volunteerId}?turf=${currentTurf.id}`;
      setAssignmentLink(volunteerLink);
      alert(`Assigned turf to volunteer ${volunteerId}`);
      const progressData = await getVolunteerProgress(volunteerId);
      setProgress(progressData.progress || []);
    } catch (error) {
      console.error(error);
      alert('Error assigning turf');
    }
  };

  const handleResetBoundary = () => {
    setTurfBoundary([]);
  };

  return (
    <div>
      <header>
        <h1>Door Knocking Dashboard</h1>
        <nav>
          <button onClick={handleCreateTurf}>Create/Save Turf</button>
          <button onClick={() => setActiveSidebarTab('volunteers')}>Assign Volunteers</button>
          <button onClick={() => setActiveSidebarTab('analytics')}>Analytics</button>
          <button onClick={() => setActiveSidebarTab('turfs')}>Turfs In Progress</button>
          <button onClick={handleResetBoundary}>Reset Turf Boundary</button>
        </nav>
      </header>
      <main style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 2 }}>
          <DrawingMap setTurfBoundary={setTurfBoundary} turfBoundary={turfBoundary} voters={voters} />
          <div style={{ marginTop: '10px' }}>
            <TurfTable voters={voters} onVoterClick={setSelectedVoter} />
          </div>
        </div>
        <aside style={{ flex: 1 }}>
          {activeSidebarTab === 'volunteers' && (
            <>
              <VolunteerAssignment volunteers={volunteers} onAssign={handleAssignTurf} />
              {assignmentLink && (
                <div style={{ marginTop: '1rem', border: '1px solid #ddd', padding: '0.5rem' }}>
                  <p>Turf Assignment Link:</p>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={assignmentLink}
                      readOnly
                      style={{ flex: 1, marginRight: '0.5rem' }}
                    />
                    <button onClick={() => {
                      navigator.clipboard.writeText(assignmentLink);
                      alert('Link copied to clipboard!');
                    }}>
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {activeSidebarTab === 'analytics' && (
            <>
              {currentTurf ? (
                <>
                  <ProgressTracker progress={progress} />
                  <button onClick={refreshAnalytics} style={{ marginTop: '1rem' }}>
                    Refresh Analytics
                  </button>
                </>
              ) : (
                <p>Please create and assign a turf to view analytics.</p>
              )}
            </>
          )}
          {activeSidebarTab === 'turfs' && (
            <>
              <h3>Turfs In Progress</h3>
              {turfs.length === 0 ? (
                <p>No turfs found.</p>
              ) : (
                <ul>
                  {turfs.map(turf => (
                    <li key={turf.id} style={{ marginBottom: '0.5rem' }}>
                      <strong>{turf.name}</strong>
                      <button onClick={() => handleDeleteTurf(turf.id)} style={{ marginLeft: '1rem' }}>
                        Delete Turf
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </aside>
      </main>
    </div>
  );
}

export default DoorKnockingDashboard;