import React from 'react';

function GoalTracker({ goals }) {
  return (
    <div className="goal-tracker">
      <h2>Campaign Goals</h2>
      {goals && goals.length > 0 ? (
        <ul>
          {goals.map(goal => (
            <li key={goal.id}>
              <div className="goal-header">
                <span>{goal.description}</span>
                <span>{goal.deadline}</span>
              </div>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${goal.progress}%` }}></div>
              </div>
              <p>{goal.progress}% completed</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No goals set</p>
      )}
    </div>
  );
}

export default GoalTracker;
