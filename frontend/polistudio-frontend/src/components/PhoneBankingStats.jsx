import React from 'react';

function PhoneBankingStats({ campaign, stats }) {
  const calculateStats = () => {
    
    const total = campaign.contacts?.length || 0;
    const completed = stats?.status_distribution?.completed || 0;
    const noAnswer = stats?.status_distribution?.no_answer || 0;
    const callBack = stats?.status_distribution?.call_back || 0;
    const refused = stats?.status_distribution?.refused || 0;
    const wrongNumber = stats?.status_distribution?.wrong_number || 0;
    
    return {
      total,
      completed,
      noAnswer,
      callBack,
      refused,
      wrongNumber,
      supportLevels: stats?.support_distribution || {},
      completionRate: total ? ((completed / total) * 100).toFixed(1) : 0
    };
  };

  const calculatedStats = calculateStats();
  
  // Calculate the total number of support level responses for percentage calculation
  const totalSupportResponses = Object.values(calculatedStats.supportLevels).reduce((sum, count) => sum + count, 0);

  return (
    <div className="campaign-stats">
      <h3>Campaign Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Completion Rate</h4>
          <div className="stat-value">{calculatedStats.completionRate}%</div>
          <div className="stat-detail">
            {calculatedStats.completed} of {calculatedStats.total} calls completed
          </div>
        </div>

        <div className="stat-card">
          <h4>Call Outcomes</h4>
          <div className="stat-list">
            <div>Completed: {calculatedStats.completed}</div>
            <div>No Answer: {calculatedStats.noAnswer}</div>
            <div>Call Back: {calculatedStats.callBack}</div>
            <div>Refused: {calculatedStats.refused}</div>
            <div>Wrong Number: {calculatedStats.wrongNumber}</div>
          </div>
        </div>

        <div className="stat-card">
          <h4>Support Levels</h4>
          <div className="support-levels">
            {[1, 2, 3, 4, 5].map(level => (
              <div key={level} className="support-level-bar">
                <span>Level {level}:</span>
                <div className="bar">
                  <div 
                    className="bar-fill"
                    style={{
                      width: totalSupportResponses > 0 
                        ? `${(calculatedStats.supportLevels[level] || 0) / totalSupportResponses * 100}%`
                        : '0%'
                    }}
                  />
                </div>
                <span>{calculatedStats.supportLevels[level] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneBankingStats; 