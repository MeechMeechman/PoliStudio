import React, { useEffect } from 'react';

const TestRoute = () => {
  useEffect(() => {
    console.log('[TestRoute] Component mounted');
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px', borderRadius: '5px' }}>
      <h1>Test Route</h1>
      <p>This is a test component to verify routing behavior.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default TestRoute;
