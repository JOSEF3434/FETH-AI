import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const usersResponse = await fetch('http://localhost:4000/api/legal/count-by-type');
        const usersData = await usersResponse.json();
        
        // Fetch lawyer data
        const lawyersResponse = await fetch('http://localhost:4000/api/lawyers/count-approved');
        const lawyersData = await lawyersResponse.json();

        // Combine data
        const labels = ['Users', 'Managers', 'Admins', 'Lawyers'];
        const userCounts = [
          usersData.userCount || 0,
          usersData.managerCount || 0,
          usersData.adminCount || 0,
          lawyersData.count || 0
        ];

        // Calculate percentages
        const total = userCounts.reduce((sum, count) => sum + count, 0);
        const percentages = userCounts.map(count => 
          total > 0 ? Math.round((count / total) * 100) : 0
        );

        // Prepare chart data
        setChartData({
          labels: labels.map((label, i) => `${label} (${percentages[i]}%)`),
          datasets: [{
            data: userCounts,
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',  // Blue for Users
              'rgba(255, 206, 86, 0.7)',   // Yellow for Managers
              'rgba(255, 99, 132, 0.7)',    // Red for Admins
              'rgba(75, 192, 192, 0.7)'     // Teal for Lawyers
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1,
          }]
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading chart data...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">User Distribution</h2>
      <div className="h-96 w-xl">
        <Pie 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {chartData.labels.map((label, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-4 h-4 mr-2 rounded-full" 
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
            ></div>
            <span className="text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
