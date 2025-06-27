import React from 'react';

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'));  // Get logged-in user info

  return (
    <div className="dashboard-container">
      <h2>Welcome, Family Head ({user.email})</h2>
      <p>This is the admin dashboard where you can manage your family and members.</p>
      {/* Display family management controls */}
    </div>
  );
};

export default AdminDashboard;
