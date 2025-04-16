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
import './styles/Auth.css';
import './styles/Header.css';
import './styles/Layout.css';
import PhoneBankingAdmin from './components/PhoneBankingAdmin';
import PhoneBankingVolunteer from './components/PhoneBankingVolunteer';
import DonorTracking from './components/DonorTracking';
import DoorKnockingDashboard from './components/DoorKnockingDashboard';
import DoorKnockingVolunteer from './components/DoorKnockingVolunteer';
import EventsCalendar from './components/EventsCalendar';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import TestRoute from './components/TestRoute';
import Account from './components/Account';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';

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
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/voters" element={
            <ProtectedRoute>
              <Layout>
                <div className="voter-section">
                  <VoterForm onVoterCreated={() => {}} />
                  <VoterList />
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/import" element={
            <ProtectedRoute>
              <Layout>
                <ImportVotersCSV />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/ai-copywriting" element={
            <ProtectedRoute>
              <Layout>
                <AICopywriting />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/door-knocking" element={
            <ProtectedRoute>
              <Layout>
                <DoorKnockingDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          {/* Public route for volunteers - no authentication required */}
          <Route path="/door-knocking/volunteer/:volunteerId" element={
            <DoorKnockingVolunteer />
          } />
          <Route path="/phone-banking" element={
            <ProtectedRoute>
              <Layout>
                <PhoneBankingAdmin />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/phone-banking/volunteer/:campaignId" element={
            <ProtectedRoute>
              <Layout>
                <PhoneBankingVolunteer />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/volunteer-management" element={
            <ProtectedRoute>
              <Layout>
                <div className="volunteer-section">
                  <VolunteerForm onVolunteerCreated={() => {}} />
                  <VolunteerList />
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/donor-tracking" element={
            <ProtectedRoute>
              <Layout>
                <DonorTracking />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/events-calendar" element={
            <ProtectedRoute>
              <Layout>
                <EventsCalendar />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics-reporting" element={
            <ProtectedRoute>
              <Layout>
                <AnalyticsDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute>
              <Layout>
                <Account />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/test-direct" element={<TestRoute />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
