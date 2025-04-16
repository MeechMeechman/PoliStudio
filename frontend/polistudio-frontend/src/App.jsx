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
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/PhoneBanking.css';
import './styles/App.css';
import './styles/Dashboard.css';
import './styles/Auth.css';
import DonorTracking from './components/DonorTracking';
import DoorKnockingDashboard from './components/DoorKnockingDashboard';
import DoorKnockingVolunteer from './components/DoorKnockingVolunteer';
import EventsCalendar from './components/EventsCalendar';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TestRoute from './components/TestRoute';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* TEMPORARY TEST: Render a simple string for /dashboard */}
          {/* <Route path="/dashboard" element={<div>Dashboard Test Route</div>} /> */}
          {/* Original dashboard route: */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* */}

          <Route path="/voters" element={
            <ProtectedRoute>
              <div className="voter-section">
                <VoterForm onVoterCreated={() => {}} />
                <VoterList />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/import" element={
            <ProtectedRoute>
              <ImportVotersCSV />
            </ProtectedRoute>
          } />
          <Route path="/ai-copywriting" element={
            <ProtectedRoute>
              <AICopywriting />
            </ProtectedRoute>
          } />
          <Route path="/door-knocking" element={
            <ProtectedRoute>
              <DoorKnockingDashboard />
            </ProtectedRoute>
          } />
          <Route path="/door-knocking/volunteer/:volunteerId" element={
            <ProtectedRoute>
              <DoorKnockingVolunteer />
            </ProtectedRoute>
          } />
          <Route path="/phone-banking" element={
            <ProtectedRoute>
              <PhoneBankingAdmin />
            </ProtectedRoute>
          } />
          <Route path="/phone-banking/volunteer/:campaignId" element={
            <ProtectedRoute>
              <PhoneBankingVolunteer />
            </ProtectedRoute>
          } />
          <Route path="/volunteer-management" element={
            <ProtectedRoute>
              <div className="volunteer-section">
                <VolunteerForm onVolunteerCreated={() => {}} />
                <VolunteerList />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/donor-tracking" element={
            <ProtectedRoute>
              <DonorTracking />
            </ProtectedRoute>
          } />
          <Route path="/events-calendar" element={
            <ProtectedRoute>
              <EventsCalendar />
            </ProtectedRoute>
          } />
          <Route path="/analytics-reporting" element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/test" element={
            <ProtectedRoute>
              <TestRoute />
            </ProtectedRoute>
          } />
          {/* Direct test route without protection */}
          <Route path="/test-direct" element={<TestRoute />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;