import React, { useEffect, useState } from "react";
import "./Dashboard.css"
import {
  fetchTotalMembers,
  fetchTotalGroups,
  fetchTotalFamilies,
  fetchTotalAttendance,
} from "./api/API";

const Dashboard = () => {
  const [stats, setStats] = useState({
    members: 0,
    groups: 0,
    families: 0,
    attendance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [members, groups, families, attendance] = await Promise.all([
          fetchTotalMembers(),
          fetchTotalGroups(),
          fetchTotalFamilies(),
          fetchTotalAttendance(),
        ]);
        setStats({ members, groups, families, attendance });
      } catch (err) {
        console.error("Error loading stats:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div>
      <h1 className="h2-dashboard">Dashboard</h1>
      <div  className="dashboard-group">
      <div>
        <StatCard label="Anggota Jemaat" count={stats.members} color="bg-blue-500" />
        <StatCard label="Grup" count={stats.groups} color="bg-green-500" />
        <StatCard label="Keluarga" count={stats.families} color="bg-yellow-500" />
        <StatCard label="Kehadiran ibadah" count={stats.attendance} color="bg-purple-500" />
      </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, count}) => (
  <div className="name-item">
    <h2 className="text-xl font-semibold">{label}</h2>
    <p className="text-3xl font-bold">{count}</p>
  </div>
);

export default Dashboard;
