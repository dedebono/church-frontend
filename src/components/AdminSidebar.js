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
    <div className="w-64 bg-white shadow-md p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`block w-full text-left px-4 py-2 rounded-md ${
            activeTab === tab.key
              ? 'bg-blue-600 text-white'
              : 'hover:bg-blue-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdminSidebar;
