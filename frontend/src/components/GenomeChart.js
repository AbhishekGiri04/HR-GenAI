import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const GenomeChart = ({ skillDNA, behaviorDNA }) => {
  const data = {
    labels: ['Technical Skills', 'Soft Skills', 'Problem Solving', 'Communication', 'Leadership', 'Adaptability'],
    datasets: [
      {
        label: 'Candidate DNA Profile',
        data: [
          skillDNA?.overall_skill_score || 0,
          behaviorDNA?.team_collaboration || 0,
          behaviorDNA?.problem_solving || 0,
          behaviorDNA?.communication_clarity || 0,
          behaviorDNA?.leadership_potential || 0,
          skillDNA?.adaptability_score || 0
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2 }
      }
    },
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🧬 Digital DNA Profile</h3>
      <Radar data={data} options={options} />
    </div>
  );
};

export default GenomeChart;