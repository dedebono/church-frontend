// src/components/AdminSidebar.jsx
import React from 'react';

const tabs = [
  { key: 'viewFamily', label: 'View Family' },
  { key: 'viewMember', label: 'View Member' },
  { key: 'uploadCSV', label: 'Upload CSV' },
  { key: 'adminMembers', label: 'Admin Members' },
  { key: 'manageGroups', label: 'Manage Groups' },
];

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-[#131318] border-r border-white/10 shadow-lg p-4 space-y-2 min-h-screen text-slate-100">
      <h2 className="text-xl font-bold mb-6 text-slate-100 px-2 tracking-tight">Admin Panel</h2>
      <div className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#d4a24e] text-[#171204] font-semibold shadow-sm'
                : 'text-slate-300 hover:bg-[#1c1c24] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
