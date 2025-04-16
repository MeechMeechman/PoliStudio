import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, FeatureGroup, useMap } from 'react-leaflet';
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
import '../styles/DoorKnockingDashboard.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// MapEvents component to handle map events
function MapEvents({ onCreated }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    map.invalidateSize();
  }, [map]);
  
  return null;
}

function TurfMap({ setTurfBoundary, turfBoundary, voters }) {
  const mapRef = useRef(null);
  
  const handleCreated = (e) => {
    const layer = e.layer;
    if (layer instanceof L.Polygon) {
      const latlngs = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
      setTurfBoundary(latlngs);
    }
  };
  
  return (
    <div className="map-container">
      <MapContainer
        center={[44.9778, -93.2650]}
        zoom={13}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
      >
        <MapEvents />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            draw={{
              polygon: true,
              rectangle: false,
              circle: false,
              marker: false,
              polyline: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>
        
        {turfBoundary && turfBoundary.length > 0 && (
          <Polygon positions={turfBoundary} />
        )}
        
        {voters.filter(v => v.lat && v.lng).map(voter => (
          <Marker 
            key={voter.id} 
            position={[voter.lat, voter.lng]}
          >
            <Popup>
              <div>
                <strong>{voter.first_name} {voter.last_name}</strong><br />
                {voter.address}<br />
                Support: {voter.support_level || 'Unknown'}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="map-instructions">
        <strong>Draw a turf boundary:</strong>
        <p>Use the polygon tool (▲) on the right side of the map to draw the boundary for your canvassing turf.</p>
      </div>
    </div>
  );
}

function TurfTable({ voters, onVoterClick }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Voters in Selected Turf</h3>
        <span>{voters.length} voters</span>
      </div>
      {voters.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Party</th>
              <th>Voting History</th>
            </tr>
          </thead>
          <tbody>
            {voters.map(voter => (
              <tr key={voter.id} onClick={() => onVoterClick(voter)}>
                <td>{voter.first_name} {voter.last_name}</td>
                <td>{voter.age || 'N/A'}</td>
                <td>{voter.party || 'N/A'}</td>
                <td>{voter.voting_history ? voter.voting_history.join(', ') : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No voters found in this turf.</div>
          <p>Draw a turf boundary on the map to see voters in that area.</p>
        </div>
      )}
    </div>
  );
}

function TurfSelection({ turfs, onTurfSelect, selectedTurfId }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Available Turfs</h3>
      </div>
      {turfs.length > 0 ? (
        <div className="turf-selection-list">
          {turfs.map(turf => (
            <div 
              key={turf.id} 
              className={`turf-selection-item ${selectedTurfId === turf.id ? 'selected' : ''}`}
              onClick={() => onTurfSelect(turf.id)}
            >
              <div className="turf-selection-name">{turf.name}</div>
              <div className="turf-selection-detail">
                <span>Created: {new Date(turf.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🗺️</div>
          <div className="empty-state-text">No turfs available</div>
          <p>Create turfs in the "Create Turf" tab before assigning them to volunteers.</p>
        </div>
      )}
    </div>
  );
}

function VolunteerAssignment({ volunteers, onAssign, selectedTurfId, turfName }) {
  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3>Assign Volunteers</h3>
        {selectedTurfId && <div className="selected-turf-badge">Selected Turf: {turfName}</div>}
      </div>
      {!selectedTurfId ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-text">Select a turf first</div>
          <p>Click on a turf from the list on the left to assign it to a volunteer.</p>
        </div>
      ) : volunteers.length > 0 ? (
        <ul className="volunteer-list">
          {volunteers.map(vol => (
            <li key={vol.id} className="volunteer-item">
              <span className="volunteer-name">{vol.first_name} {vol.last_name}</span>
              <button 
                className="btn btn-primary" 
                onClick={() => onAssign(vol.id, selectedTurfId)}
              >
                Assign
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-text">No volunteers available</div>
        </div>
      )}
    </div>
  );
}

function ProgressTracker({ progress }) {
  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3>Canvassing Progress</h3>
      </div>
      {progress.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">No interactions logged yet.</div>
        </div>
      ) : (
        <div>
          {progress.map(item => {
            const percentage = item.total_interactions > 0 && item.total_voters > 0 
              ? Math.round((item.total_interactions / item.total_voters) * 100) 
              : 0;
            
            return (
              <div key={item.turf_id} className="progress-item">
                <div className="progress-title">{item.turf_name || 'Current Turf'}</div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="progress-stats">
                  <span>{item.total_interactions} interactions</span>
                  <span>{percentage}% complete</span>
                </div>
              </div>
            );
          })}
        </div>
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
  const [turfName, setTurfName] = useState('');
  const [selectedTurfId, setSelectedTurfId] = useState(null);
  const [selectedTurfName, setSelectedTurfName] = useState('');

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

  useEffect(() => {
    if (activeSidebarTab === 'volunteers' || activeSidebarTab === 'turfs') {
      fetchTurfs();
    } else if (activeSidebarTab === 'analytics' && currentTurf) {
      refreshAnalytics();
    }
  }, [activeSidebarTab, currentTurf]);

  // Reset selected turf when changing tabs
  useEffect(() => {
    setSelectedTurfId(null);
    setSelectedTurfName('');
  }, [activeSidebarTab]);

  const handleCreateTurf = async () => {
    if (turfBoundary.length === 0) {
      alert("Please draw a turf boundary on the map.");
      return;
    }
    
    if (!turfName.trim()) {
      alert("Please enter a name for this turf.");
      return;
    }
    
    const turfData = {
      name: turfName,
      boundary: JSON.stringify(turfBoundary)
    };
    
    try {
      const newTurf = await createTurf(turfData);
      setCurrentTurf(newTurf);
      
      // Show success notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'notification success';
      notification.textContent = 'Turf created successfully';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
      const votersData = await getTurfVoters(newTurf.id);
      setVoters(votersData);
      setTurfName('');
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
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = 'Turf deleted successfully';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        
        fetchTurfs();
      } catch (error) {
        console.error("Error deleting turf:", error);
        alert("Failed to delete turf.");
      }
    }
  };

  const handleAssignTurf = async (volunteerId, turfId) => {
    if (!turfId) {
      alert('Please select a turf to assign');
      return;
    }
    
    try {
      await assignTurfToVolunteer(volunteerId, turfId);
      const volunteerLink = `${window.location.origin}/door-knocking/volunteer/${volunteerId}?turf=${turfId}`;
      setAssignmentLink(volunteerLink);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'notification success';
      notification.textContent = 'Turf assigned successfully';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
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
    <div className="door-knocking-dashboard">
      <header className="dashboard-header">
        <h1>Door Knocking Dashboard</h1>
        <nav className="dashboard-nav">
          <button 
            className={`btn ${activeSidebarTab === 'create' ? 'btn-active' : 'btn-primary'}`}
            onClick={() => setActiveSidebarTab('create')}
          >
            <i className="fas fa-draw-polygon"></i> Create Turf
          </button>
          <button 
            className={`btn ${activeSidebarTab === 'volunteers' ? 'btn-active' : 'btn-primary'}`}
            onClick={() => setActiveSidebarTab('volunteers')}
          >
            <i className="fas fa-users"></i> Volunteers
          </button>
          <button 
            className={`btn ${activeSidebarTab === 'analytics' ? 'btn-active' : 'btn-primary'}`}
            onClick={() => setActiveSidebarTab('analytics')}
          >
            <i className="fas fa-chart-bar"></i> Analytics
          </button>
          <button 
            className={`btn ${activeSidebarTab === 'turfs' ? 'btn-active' : 'btn-primary'}`}
            onClick={() => setActiveSidebarTab('turfs')}
          >
            <i className="fas fa-map-marked-alt"></i> Manage Turfs
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleResetBoundary}
          >
            <i className="fas fa-undo"></i> Reset Map
          </button>
        </nav>
      </header>
      
      <main className="dashboard-main">
        {activeSidebarTab === 'create' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <TurfMap 
              setTurfBoundary={setTurfBoundary} 
              turfBoundary={turfBoundary} 
              voters={voters} 
            />
            <TurfTable voters={voters} onVoterClick={setSelectedVoter} />
          </div>
        ) : activeSidebarTab === 'volunteers' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <TurfSelection 
              turfs={turfs} 
              onTurfSelect={(turfId) => {
                const selectedTurf = turfs.find(t => t.id === turfId);
                setSelectedTurfId(turfId);
                setSelectedTurfName(selectedTurf ? selectedTurf.name : '');
              }}
              selectedTurfId={selectedTurfId}
            />
          </div>
        ) : (
          <div className="map-container empty-state" style={{justifyContent:'center',alignItems:'center',display:'flex',height:'100%'}}>
            <div style={{textAlign:'center',color:'#86868B'}}>
              <div style={{fontSize:'2.5rem'}}>🗺️</div>
              <div style={{fontSize:'1rem'}}>Switch to <b>Create Turf</b> to draw or view a turf boundary on the map.</div>
            </div>
          </div>
        )}
        
        <aside className="dashboard-sidebar">
          {activeSidebarTab === 'create' && (
            <div className="fade-in">
              <div className="sidebar-header">
                <h2>Create New Turf</h2>
              </div>
              <div className="card">
                <p>Draw a boundary on the map to define your canvassing turf.</p>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="turf-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Turf Name:
                  </label>
                  <input
                    id="turf-name"
                    type="text"
                    className="link-input"
                    value={turfName}
                    onChange={(e) => setTurfName(e.target.value)}
                    placeholder="Enter a name for this turf"
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={handleCreateTurf}
                  disabled={turfBoundary.length === 0}
                >
                  <i className="fas fa-save"></i> Save Turf
                </button>
              </div>
              
              <div className="card" style={{ marginTop: '1rem' }}>
                <div className="card-header">
                  <h3>Instructions</h3>
                </div>
                <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                  <li>Use the polygon tool on the map to draw your turf boundary</li>
                  <li>Enter a name for your turf</li>
                  <li>Click "Save Turf" to create it</li>
                  <li>Assign the turf to volunteers in the Volunteers tab</li>
                </ol>
              </div>
            </div>
          )}
          
          {activeSidebarTab === 'volunteers' && (
            <div className="fade-in">
              <div className="sidebar-header">
                <h2>Volunteer Assignment</h2>
              </div>
              <VolunteerAssignment 
                volunteers={volunteers} 
                onAssign={handleAssignTurf} 
                selectedTurfId={selectedTurfId}
                turfName={selectedTurfName}
              />
              
              {assignmentLink && (
                <div className="assignment-link">
                  <p>Turf Assignment Link:</p>
                  <div className="link-input-group">
                    <input
                      type="text"
                      className="link-input"
                      value={assignmentLink}
                      readOnly
                    />
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(assignmentLink);
                        
                        // Show success notification
                        const notification = document.createElement('div');
                        notification.className = 'notification success';
                        notification.textContent = 'Link copied to clipboard!';
                        document.body.appendChild(notification);
                        setTimeout(() => notification.remove(), 3000);
                      }}
                    >
                      <i className="fas fa-copy"></i> Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeSidebarTab === 'analytics' && (
            <div className="fade-in">
              <div className="sidebar-header">
                <h2>Analytics</h2>
                {currentTurf && (
                  <button 
                    className="btn btn-secondary"
                    onClick={refreshAnalytics}
                  >
                    <i className="fas fa-sync-alt"></i> Refresh
                  </button>
                )}
              </div>
              
              {currentTurf ? (
                <ProgressTracker progress={progress} />
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <div className="empty-state-text">No turf selected</div>
                  <p>Please create and assign a turf to view analytics.</p>
                </div>
              )}
              
              {currentTurf && progress.length > 0 && (
                <div className="card" style={{ marginTop: '1rem' }}>
                  <div className="card-header">
                    <h3>Performance Metrics</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="metric-card">
                      <div className="metric-value">{progress[0].total_interactions || 0}</div>
                      <div className="metric-label">Total Interactions</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">
                        {progress[0].total_voters ? 
                          Math.round((progress[0].total_interactions / progress[0].total_voters) * 100) : 0}%
                      </div>
                      <div className="metric-label">Completion</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeSidebarTab === 'turfs' && (
            <div className="fade-in">
              <div className="sidebar-header">
                <h2>Manage Turfs</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={fetchTurfs}
                >
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
              </div>
              
              {turfs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🗺️</div>
                  <div className="empty-state-text">No turfs found</div>
                  <p>Create a turf to get started with door knocking.</p>
                </div>
              ) : (
                <ul className="turf-list">
                  {turfs.map(turf => (
                    <li key={turf.id} className="turf-item">
                      <span className="turf-name">{turf.name}</span>
                      <div>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteTurf(turf.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>
      </main>
      
      {selectedVoter && (
        <VoterDetailsModal 
          voter={selectedVoter} 
          onClose={() => setSelectedVoter(null)} 
        />
      )}
    </div>
  );
}

export default DoorKnockingDashboard;