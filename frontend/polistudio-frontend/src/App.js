import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import VoterList from './components/VoterList';
import VoterForm from './components/VoterForm';
import ImportVotersCSV from './components/ImportVotersCSV';
import AICopywriting from './components/AICopywriting';
import VolunteerForm from './components/VolunteerForm';
import VolunteerList from './components/VolunteerList';
import './App.css';
import './styles/Dashboard.css';
import PhoneBankingAdmin from './components/PhoneBankingAdmin';
import PhoneBankingVolunteer from './components/PhoneBankingVolunteer';
import DonorTracking from './components/DonorTracking';

const ComingSoon = ({ feature }) => (
  <div className="coming-soon">
    <h1>{feature}</h1>
    <p>We're working hard to bring you the best {feature.toLowerCase()} tools. Stay tuned for updates!</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/voters" element={
            <div className="voter-section">
              <VoterForm onVoterCreated={() => {}} />
              <VoterList />
            </div>
          } />
          <Route path="/import" element={<ImportVotersCSV />} />
          <Route path="/ai-copywriting" element={<AICopywriting />} />
          <Route path="/door-knocking" element={<ComingSoon feature="Door Knocking" />} />
          <Route path="/phone-banking" element={<PhoneBankingAdmin />} />
          <Route path="/phone-banking/volunteer/:campaignId" element={<PhoneBankingVolunteer />} />
          <Route path="/volunteer-management" element={
            <div className="volunteer-section">
              <VolunteerForm onVolunteerCreated={() => {}} />
              <VolunteerList />
            </div>
          } />
          <Route path="/donor-tracking" element={<DonorTracking />} />
          <Route path="/events" element={<ComingSoon feature="Events & Calendar" />} />
          <Route path="/analytics" element={<ComingSoon feature="Analytics & Reporting" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
