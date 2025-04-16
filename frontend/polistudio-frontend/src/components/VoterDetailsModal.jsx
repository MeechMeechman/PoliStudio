import React, { useEffect, useState } from 'react';
import { getVoter, updateVoter } from '../services/voterService';
import './VoterDetailsModal.css';

const VoterDetailsModal = ({ voterId, onClose, editMode = false, onVoterUpdated }) => {
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(editMode);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const fetchVoter = async () => {
      try {
        const data = await getVoter(voterId);
        setVoter(data);
        setFormData(data);
        // Initialize tags if they exist
        setTags(data.tags || []);
      } catch (err) {
        setError('Failed to fetch voter details.');
      } finally {
        setLoading(false);
      }
    };

    if (voterId) {
      fetchVoter();
    }
  }, [voterId]);

  // Update isEditing when prop changes
  useEffect(() => {
    setIsEditing(editMode);
  }, [editMode]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name?.trim()) {
      errors.first_name = "First name is required";
    }
    
    if (!formData.last_name?.trim()) {
      errors.last_name = "Last name is required";
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    
    if (formData.phone && !/^[0-9()\-\+\s]*$/.test(formData.phone)) {
      errors.phone = "Phone number can only contain digits, spaces, and () - +";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Process support_level as a number
    if (name === 'support_level') {
      processedValue = parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSaveClick = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      // Add tags to the formData
      const dataToSave = { ...formData, tags };
      
      const updatedVoter = await updateVoter(voterId, dataToSave);
      setVoter(updatedVoter);
      setFormData(updatedVoter);
      setIsEditing(false);
      setSaving(false);
      
      if (onVoterUpdated) {
        onVoterUpdated(updatedVoter);
      }
    } catch (err) {
      setError('Failed to update voter information.');
      setSaving(false);
    }
  };

  const handleTagDelete = (tagToDelete) => {
    setTags(prev => prev.filter(tag => tag !== tagToDelete));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!voterId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Voter' : 'Voter Details'}</h2>
          <div className="modal-actions">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="edit-button"
              >
                ✏️ Edit
              </button>
            )}
            <button onClick={onClose} className="close-button">
              ✖️
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading voter details...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="voter-details">
            {isEditing ? (
              <form className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name*</label>
                    <input 
                      type="text" 
                      name="first_name" 
                      value={formData.first_name || ''} 
                      onChange={handleInputChange}
                      className={validationErrors.first_name ? 'error' : ''}
                    />
                    {validationErrors.first_name && (
                      <div className="error-message">{validationErrors.first_name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Last Name*</label>
                    <input 
                      type="text" 
                      name="last_name" 
                      value={formData.last_name || ''} 
                      onChange={handleInputChange}
                      className={validationErrors.last_name ? 'error' : ''}
                    />
                    {validationErrors.last_name && (
                      <div className="error-message">{validationErrors.last_name}</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address || ''} 
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={formData.phone || ''} 
                      onChange={handleInputChange}
                      className={validationErrors.phone ? 'error' : ''}
                    />
                    {validationErrors.phone && (
                      <div className="error-message">{validationErrors.phone}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email || ''} 
                      onChange={handleInputChange}
                      className={validationErrors.email ? 'error' : ''}
                    />
                    {validationErrors.email && (
                      <div className="error-message">{validationErrors.email}</div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Support Level</label>
                    <select 
                      name="support_level" 
                      value={formData.support_level ?? 0} 
                      onChange={handleInputChange}
                    >
                      <option value={0}>Unknown (0)</option>
                      <option value={1}>1 - Not Supportive</option>
                      <option value={2}>2 - Somewhat Unsupportive</option>
                      <option value={3}>3 - Neutral</option>
                      <option value={4}>4 - Somewhat Supportive</option>
                      <option value={5}>5 - Very Supportive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Registered Voter</label>
                    <select 
                      name="registered" 
                      value={formData.registered ?? false} 
                      onChange={(e) => handleInputChange({
                        target: {
                          name: 'registered',
                          value: e.target.value === 'true'
                        }
                      })}
                    >
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-container">
                    {tags.map(tag => (
                      <div key={tag} className="tag">
                        {tag}
                        <button type="button" onClick={() => handleTagDelete(tag)}>×</button>
                      </div>
                    ))}
                  </div>
                  <div className="add-tag">
                    <input 
                      type="text" 
                      value={newTag} 
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag"
                    />
                    <button type="button" onClick={handleAddTag}>Add</button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea 
                    name="notes" 
                    value={formData.notes || ''} 
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Last Contacted</label>
                  <input 
                    type="date" 
                    name="last_contacted" 
                    value={formData.last_contacted || ''} 
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-buttons">
                  <button 
                    type="button" 
                    className="cancel-button" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(voter);
                      setTags(voter.tags || []);
                      setValidationErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="save-button" 
                    onClick={handleSaveClick}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : '💾 Save'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="view-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <div className="detail-icon">👤</div>
                    <div className="detail-content">
                      <strong>Name</strong>
                      <div>{voter.first_name} {voter.last_name}</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">📍</div>
                    <div className="detail-content">
                      <strong>Address</strong>
                      <div>{voter.address || 'Not specified'}</div>
                    </div>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <div className="detail-icon">📞</div>
                    <div className="detail-content">
                      <strong>Phone</strong>
                      <div>{voter.phone || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">✉️</div>
                    <div className="detail-content">
                      <strong>Email</strong>
                      <div>{voter.email || 'Not specified'}</div>
                    </div>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <div className="detail-content">
                      <strong>Support Level</strong>
                      <div className={`support-level support-level-${voter.support_level}`}>
                        {voter.support_level}/5
                      </div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-content">
                      <strong>Registered Voter</strong>
                      <div>{voter.registered ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>

                {tags.length > 0 && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <div className="detail-icon">🏷️</div>
                      <div className="detail-content">
                        <strong>Tags</strong>
                        <div className="tags-display">
                          {tags.map(tag => (
                            <span key={tag} className="tag-pill">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {voter.notes && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <div className="detail-content">
                        <strong>Notes</strong>
                        <div className="notes-display">{voter.notes}</div>
                      </div>
                    </div>
                  </div>
                )}

                {voter.last_contacted && (
                  <div className="detail-row">
                    <div className="detail-item">
                      <div className="detail-icon">📅</div>
                      <div className="detail-content">
                        <strong>Last Contacted</strong>
                        <div>{new Date(voter.last_contacted).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoterDetailsModal;