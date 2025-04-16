import React, { useEffect, useState } from 'react';
import axios from 'axios';
import KPIcards from './KPICards';
import DonationTrendsChart from './DonationTrendsChart';
import OutreachCharts from './OutreachCharts';
import AIRecommendations from './AIRecommendations';
import GoalTracker from './GoalTracker';

function AnalyticsDashboard() {
  const [donationData, setDonationData] = useState(null);
  const [outreachData, setOutreachData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    // Fetch donation report data
    axios.get('http://127.0.0.1:8000/donations/report')
      .then(res => setDonationData(res.data))
      .catch(err => console.error(err));

    // Fetch outreach data (e.g., aggregated phone banking and door knocking stats)
    axios.get('http://127.0.0.1:8000/analytics/outreach')
      .then(res => setOutreachData(res.data))
      .catch(err => console.error(err));

    // Fetch AI recommendations (could be a rule-based or AI-powered endpoint)
    axios.get('http://127.0.0.1:8000/analytics/recommendations')
      .then(res => setRecommendations(res.data))
      .catch(err => console.error(err));

    // Fetch campaign goal data
    axios.get('http://127.0.0.1:8000/campaign/goals')
      .then(res => setGoals(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="analytics-dashboard">
      <h1>Analytics and Reporting</h1>
      <KPIcards donationData={donationData} outreachData={outreachData} />
      <div className="charts-container">
        {donationData && <DonationTrendsChart trends={donationData.trends} />}
        {outreachData && <OutreachCharts data={outreachData} />}
      </div>
      <AIRecommendations recommendations={recommendations} />
      <GoalTracker goals={goals} />
    </div>
  );
}

export default AnalyticsDashboard;
