import React from 'react';

function AIRecommendations({ recommendations }) {
  return (
    <div className="ai-recommendations">
      <h2>AI Recommendations</h2>
      {recommendations.length > 0 ? (
        <ul>
          {recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      ) : (
        <p>No recommendations available</p>
      )}
    </div>
  );
}

export default AIRecommendations;
