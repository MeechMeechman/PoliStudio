import React from 'react';

function OutreachCharts({ data }) {
  const chartData = {
    labels: data ? data.labels : [],
    datasets: [
      {
        label: 'Phone Calls Completed',
        data: data ? data.phoneCalls : [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Door Knocks Completed',
        data: data ? data.doorKnocks : [],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      },
    ],
  };

/*  return (
    <div>
      <Bar data={chartData} />
    </div>
  );*/
}

export default OutreachCharts;
