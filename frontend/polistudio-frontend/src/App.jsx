import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AICopywriting from './components/AICopywriting';
import VoterList from './components/VoterList';
import VoterForm from './components/VoterForm';
import ImportVotersCSV from './components/ImportVotersCSV';
import VolunteerForm from './components/VolunteerForm';
import VolunteerList from './components/VolunteerList';
import PhoneBankingAdmin from './components/PhoneBankingAdmin';
import PhoneBankingVolunteer from './components/PhoneBankingVolunteer';
import ComingSoon from './components/ComingSoon';
import './styles/PhoneBanking.css';
import './styles/App.css';
import './styles/Dashboard.css';
import DonorTracking from './components/DonorTracking';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<PhoneBankingAdmin />} />
          <Route path="/dashboard" element={<Dashboard />} />
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
          <Route path="/events-calendar" element={<ComingSoon feature="Events & Calendar" />} />
          <Route path="/analytics-reporting" element={<ComingSoon feature="Analytics & Reporting" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 