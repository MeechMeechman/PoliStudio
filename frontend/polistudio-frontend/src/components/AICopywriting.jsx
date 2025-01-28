import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AICopywriting.css';


const CONTENT_TYPES = {
  flyer: {
    name: 'Campaign Flyer',
    sizes: ['letter', 'a4', 'postcard'],
    icon: '📄'
  },
  social: {
    name: 'Social Media Post',
    platforms: ['twitter', 'facebook', 'instagram', 'linkedin'],
    icon: '📱'
  }
};

const TONES = [
  'professional',
  'casual',
  'energetic',
  'empathetic',
  'authoritative',
  'friendly'
];

function AICopywriting() {
  const [formData, setFormData] = useState({
    content_type: 'flyer',
    campaign_name: '',
    target_audience: '',
    key_points: [''],
    tone: 'professional',
    size: 'letter',
    platform: 'twitter',
    word_limit: null
  });

  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleKeyPointChange = (index, value) => {
    const newKeyPoints = [...formData.key_points];
    newKeyPoints[index] = value;
    setFormData({ ...formData, key_points: newKeyPoints });
  };

  const addKeyPoint = () => {
    setFormData({
      ...formData,
      key_points: [...formData.key_points, '']
    });
  };

  const removeKeyPoint = (index) => {
    const newKeyPoints = formData.key_points.filter((_, i) => i !== index);
    setFormData({ ...formData, key_points: newKeyPoints });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const endpoint = formData.content_type === 'flyer' ? '/ai/flyer' : '/ai/social';
      const response = await axios.post(`http://localhost:8000${endpoint}`, {
        campaign_name: formData.campaign_name,
        target_audience: formData.target_audience,
        key_points: formData.key_points.filter(point => point.trim()),
        tone: formData.tone,
        ...(formData.content_type === 'flyer' ? { size: formData.size } : {
          platform: formData.platform,
          word_limit: formData.word_limit
        })
      });

      setGeneratedContent(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error generating content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-copywriting">
      <header className="ai-header">
        <h1>AI Copywriting Studio</h1>
        <p>Generate compelling campaign content with AI assistance</p>
      </header>

      <div className="content-container">
        <form onSubmit={handleSubmit} className="generation-form">
          <div className="form-group">
            <label>Content Type</label>
            <div className="content-type-selector">
              {Object.entries(CONTENT_TYPES).map(([type, info]) => (
                <button
                  key={type}
                  type="button"
                  className={`content-type-button ${formData.content_type === type ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, content_type: type })}
                >
                  <span className="icon">{info.icon}</span>
                  {info.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Campaign Name</label>
            <input
              type="text"
              value={formData.campaign_name}
              onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
              required
              placeholder="e.g., Vote for Jane Smith 2024"
            />
          </div>

          <div className="form-group">
            <label>Target Audience</label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              required
              placeholder="e.g., Young professionals aged 25-35"
            />
          </div>

          <div className="form-group">
            <label>Key Points</label>
            <div className="key-points-container">
              {formData.key_points.map((point, index) => (
                <div key={index} className="key-point-input">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleKeyPointChange(index, e.target.value)}
                    placeholder={`Key point ${index + 1}`}
                  />
                  {formData.key_points.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKeyPoint(index)}
                      className="remove-point"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addKeyPoint}
                className="add-point"
              >
                + Add Key Point
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Tone</label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            >
              {TONES.map(tone => (
                <option key={tone} value={tone}>
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {formData.content_type === 'flyer' ? (
            <div className="form-group">
              <label>Size</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              >
                {CONTENT_TYPES.flyer.sizes.map(size => (
                  <option key={size} value={size}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  {CONTENT_TYPES.social.platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Word Limit (Optional)</label>
                <input
                  type="number"
                  value={formData.word_limit || ''}
                  onChange={(e) => setFormData({ ...formData, word_limit: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Leave blank for platform default"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className={`generate-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {generatedContent && (
          <div className="generated-content">
            <h2>Generated Content</h2>
            <div className="content-preview">
              {typeof generatedContent.content === 'string' 
                ? generatedContent.content.replace(/^["']|["']$/g, '').trim()
                : generatedContent.content}
            </div>
            {generatedContent.suggestions?.length > 0 && (
              <div className="suggestions">
                <h3>Alternatives</h3>
                <ul>
                  {generatedContent.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion.replace(/^["']|["']$/g, '').trim()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AICopywriting; 