import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

function Dashboard() {
  const features = [
    {
      title: 'AI Copywriting',
      description: 'Generate compelling campaign content with AI assistance',
      icon: '✍️',
      link: '/ai-copywriting',
      available: true
    },
    {
      title: 'Voter List',
      description: 'Manage and track voter information',
      icon: '📋',
      link: '/voters',
      available: true
    },
    {
      title: 'Door Knocking',
      description: 'Plan and track door-to-door canvassing',
      icon: '🚶',
      link: '/door-knocking',
      available: true
    },
    {
      title: 'Phone Banking',
      description: 'Manage and track phone banking campaigns',
      icon: '📞',
      link: '/phone-banking',
      available: true
    },
    {
      title: 'Volunteer Management',
      description: 'Organize and coordinate volunteer activities',
      icon: '👥',
      link: '/volunteer-management',
      available: true
    },
    {
      title: 'Donor Tracking',
      description: 'Track and manage campaign donations',
      icon: '💰',
      link: '/donor-tracking',
      available: true
    },
    {
      title: 'Events & Calendar',
      description: 'Schedule and manage campaign events',
      icon: '📅',
      link: '/events-calendar',
      available: true
    },
    {
      title: 'Analytics & Reporting',
      description: 'View campaign performance metrics',
      icon: '📊',
      link: '/analytics-reporting',
      available: false
    }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Campaign Dashboard</h1>
        <p>Welcome to PoliStudio - Your Campaign Management Hub</p>
      </header>

      <div className="feature-grid">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className={`feature-card ${!feature.available ? 'coming-soon' : ''}`}
          >
            <span className="feature-icon">{feature.icon}</span>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
            {!feature.available && <span className="coming-soon-badge">Coming Soon</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard; 