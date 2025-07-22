// src/components/SummaryChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SummaryChart = ({ summary, formatIDR }) => {
  // Ensure summary values are numbers and default to 0 if undefined
  const totalIncome = Number(summary?.totalIncome) || 0;
  const totalExpense = Number(summary?.totalExpense) || 0;

  const data = {
    labels: ['Pemasukan', 'Pengeluaran'],
    datasets: [
      {
        label: 'Jumlah (IDR)',
        data: [totalIncome, totalExpense],
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderColor: ['#36A2EB', '#FF6384'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Financial Summary' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${formatIDR(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Jumlah (IDR)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Kategori',
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default SummaryChart;