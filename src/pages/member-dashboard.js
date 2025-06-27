import React from 'react';

const MemberDashboard = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'));  // Get logged-in user info

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user.email}</h2>
      <p>This is your member dashboard.</p>
      {/* Display member-related info */}
    </div>
  );
};

export default MemberDashboard;