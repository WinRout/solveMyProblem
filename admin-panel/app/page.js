'use client'
import React, { useState, useEffect } from 'react';
import {
  Bar,
  Scatter
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
);

export default function Statistics() {
  const [statsData, setStatsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:4012/submissions-statistics-get/f'); // Replace with your API endpoint
      const data = await response.json();
      setStatsData(data);
    };

    fetchData();
  }, []);

  // Prepare data for the Bar chart
  const users = {}; // Object to store user emails and total execution times

  statsData.forEach(datapoint => {
    const email = datapoint.email;
    const executionTime = datapoint.execution_secs;
    if (!users[email]) {
      users[email] = 0;
    }
    users[email] += executionTime;
  });

  const userEmails = Object.keys(users);
  const totalExecutionTimes = Object.values(users);

  const barData = {
    labels: userEmails,
    datasets: [
      {
        label: 'Total Execution Time',
        data: totalExecutionTimes,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Total Execution Time per User'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'User Email'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Total Execution Time (Seconds)'
        }
      }
    }
  };

  // Calculate mean execution times per user
  const userMeans = {};

  statsData.forEach(datapoint => {
    const email = datapoint.email;
    const executionTime = datapoint.execution_secs;
    if (!userMeans[email]) {
      userMeans[email] = { totalTime: 0, count: 0 };
    }

    userMeans[email].totalTime += executionTime;
    userMeans[email].count++;
  });

  for (const email in userMeans) {
    userMeans[email].meanTime = userMeans[email].totalTime / userMeans[email].count;
  }

  // Prepare table data
  const tableData = Object.entries(userMeans).map(([email, { meanTime, count }]) => ({ email, meanTime, count }));

  // Define table headers
  const tableHeaders = [
    { title: 'Email', key: 'email' },
    { title: 'Mean Execution Time (Seconds)', key: 'meanTime' },
    { title: 'Total Executions', key: 'count' }
  ];

  // Group data points by user email to create separate traces for each user.
  const userTraces = {};

  statsData.forEach(datapoint => {
    const email = datapoint.email;
    const executionDate = new Date(datapoint.execution_date);
    const executionTime = datapoint.execution_secs;

    if (!userTraces[email]) {
      userTraces[email] = { x: [], y: [], label: email };
    }

    userTraces[email].x.push(executionDate);
    userTraces[email].y.push(executionTime);
  });

  // Convert traces object to an array for easier rendering
  const scatterData = {
    datasets: Object.values(userTraces).map(trace => ({
      label: trace.label,
      data: trace.x.map((date, index) => ({ x: date, y: trace.y[index] })),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      pointRadius: 3
    }))
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Execution Time by Date (Scatter Plot)'
      }
    },
    scales: {
      x: {
        type: 'time',
        title: {
          display: true,
          text: 'Execution Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Execution Time (Seconds)'
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2">Mean Execution Times</h2>
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left border-b border-gray-200">
                {tableHeaders.map(header => (
                  <th key={header.key} className="px-4 py-2">
                    {header.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => (
                <tr key={row.email} className="border-b border-gray-200">
                  <td className="px-4 py-2">{row.email}</td>
                  <td className="px-4 py-2">{row.meanTime.toFixed(2)}</td>
                  <td className="px-4 py-2">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-gray-100 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2">Total Execution Time per User</h2>
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="bg-gray-100 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2">Execution Time by Date</h2>
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
      </div>
    </div>
  );
}
