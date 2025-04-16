import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function DonationTrendsChart({ trends }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && trends) {
      const ctx = chartRef.current.getContext('2d');
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
      chartRef.current.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trends.labels,
          datasets: [{
            label: 'Donations Over Time',
            data: trends.data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }
  }, [trends]);

  return <canvas ref={chartRef} width="400" height="200"></canvas>;
}

export default DonationTrendsChart;
