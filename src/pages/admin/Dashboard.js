import React, { useEffect, useState } from "react";
import "./Dashboard.css"
import {
  fetchTotalMembers,
  fetchTotalGroups,
  fetchTotalFamilies,
  fetchTotalAttendance,
  fetchAttendanceTrends
} from "./api/API";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    members: 0,
    groups: 0,
    families: 0,
    attendance: 0,
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [members, groups, families, attendance, trends] = await Promise.all([
          fetchTotalMembers(),
          fetchTotalGroups(),
          fetchTotalFamilies(),
          fetchTotalAttendance(),
          fetchAttendanceTrends()
        ]);
        setStats({ members, groups, families, attendance });
        setAttendanceData(trends);
      } catch (err) {
        console.error("Error loading stats:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter',
            size: 12
          },
          color: '#cbd5e1'
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1c1c24',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
          drawBorder: false,
        },
        ticks: {
          font: { family: 'Inter' },
          color: '#94a3b8'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { family: 'Inter' },
          color: '#94a3b8'
        }
      }
    }
  };

  const chartData = {
    labels: attendanceData.map(d => d.name), // ["Jan 2024", "Feb 2024", ...]
    datasets: [
      {
        label: 'Monthly Attendance (Total Visits)',
        data: attendanceData.map(d => d.count),
        backgroundColor: 'rgba(212, 162, 78, 0.85)',
        hoverBackgroundColor: '#e3b661',
        borderRadius: 6,
      },
    ],
  };

  if (loading) return <div className="text-center p-8 text-slate-400 font-medium">Memuat Dashboard...</div>;
  if (error) return <div className="text-red-400 p-8 font-medium">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1 className="h2-dashboard">Dashboard Overview</h1>

      <div className="dashboard-stats-grid">
        <StatCard
          label="Anggota Jemaat"
          count={stats.members}
          colorClass="border-blue"
        />
        <StatCard
          label="Grup Komunitas"
          count={stats.groups}
          colorClass="border-green"
        />
        <StatCard
          label="Keluarga"
          count={stats.families}
          colorClass="border-yellow"
        />
        <StatCard
          label="Kehadiran Ibadah"
          count={stats.attendance}
          colorClass="border-purple"
        />
      </div>

      <div className="dashboard-charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Attendance Trends (Last 6 Months)</h3>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bar options={chartOptions} data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, count, colorClass }) => (
  <div className={`stat-card ${colorClass}`}>
    <h2 className="stat-label">{label}</h2>
    <p className="stat-count">{count}</p>
  </div>
);

export default Dashboard;
