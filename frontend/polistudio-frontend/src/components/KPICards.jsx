import React from 'react';

function KPIcards({ donationData, outreachData }) {
  return (
    <div className="kpi-cards">
      <div className="card">
        <h2>Total Donations</h2>
        <p>{donationData ? `$${donationData.total_donations}` : 'Loading...'}</p>
      </div>
      <div className="card">
        <h2>Top Donor</h2>
        {donationData && donationData.top_donors?.length > 0 ? (
          <p>{donationData.top_donors[0].name}: ${donationData.top_donors[0].total}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="card">
        <h2>Voter Engagement</h2>
        <p>{outreachData ? outreachData.voters_reached : 'Loading...'} Voters</p>
      </div>
    </div>
  );
}

export default KPIcards;
