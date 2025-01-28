import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AICopywriting from './components/AICopywriting';
import ComingSoon from './components/ComingSoon';
import './App.css';
import './styles/AICopywriting.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai-copywriting" element={<AICopywriting />} />
          <Route path="/phone-banking" element={<ComingSoon feature="Phone Banking" />} />
          <Route path="/volunteer-management" element={<ComingSoon feature="Volunteer Management" />} />
          <Route path="/donor-tracking" element={<ComingSoon feature="Donor Tracking" />} />
          <Route path="/events-calendar" element={<ComingSoon feature="Events & Calendar" />} />
          <Route path="/analytics-reporting" element={<ComingSoon feature="Analytics & Reporting" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 