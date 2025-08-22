import React, { useState } from 'react';
import AdminBirthdayReminder from './AdminBirthdayReminder';
import './BirthdayReminderTest.css';

const BirthdayReminderTest = () => {
  const [showReminder, setShowReminder] = useState(false);

  const handleShowReminder = () => {
    setShowReminder(true);
  };

  const handleCloseReminder = () => {
    setShowReminder(false);
  };

  // Mock the API function for testing
  const originalGetTodaysBirthdays = window.getTodaysBirthdays;
  
  // Override the API function with mock data
  window.getTodaysBirthdays = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      birthdays: [
        {
          name: "John Doe",
          family: "Keluarga Doe",
          birthDate: "1990-01-15",
          phone: "081234567890"
        },
        {
          name: "Jane Smith",
          family: "Keluarga Smith",
          birthDate: "1985-03-22",
          phone: "081987654321"
        },
        {
          name: "Michael Johnson",
          family: "Keluarga Johnson",
          birthDate: "1992-07-10",
          phone: "081122334455"
        }
      ]
    };
  };

  return (
    <div className="birthday-test-container">
      <div className="test-header">
        <h1>🎂 Birthday Reminder Popup Test</h1>
        <p>Test the birthday reminder popup functionality</p>
      </div>

      <div className="test-content">
        <div className="test-card">
          <h2>Test Birthday Reminder</h2>
          <p>Click the button below to test the birthday reminder popup with sample data:</p>
          
          <div className="test-buttons">
            <button 
              className="test-btn primary"
              onClick={handleShowReminder}
            >
              🎉 Show Birthday Reminder
            </button>
          </div>

          <div className="test-info">
            <h3>Features Tested:</h3>
            <ul>
              <li>✅ Popup modal display</li>
              <li>✅ Loading state animation</li>
              <li>✅ Birthday member list</li>
              <li>✅ Age calculation</li>
              <li>✅ Contact information</li>
              <li>✅ Responsive design</li>
              <li>✅ Close functionality</li>
            </ul>
          </div>
        </div>

        <div className="test-card">
          <h2>Sample Birthday Data</h2>
          <p>The test will show these sample members with today's birthday:</p>
          <div className="sample-data">
            <div className="sample-member">
              <strong>John Doe</strong> - Keluarga Doe (34 tahun)
              <br />📞 081234567890
            </div>
            <div className="sample-member">
              <strong>Jane Smith</strong> - Keluarga Smith (39 tahun)
              <br />📞 081987654321
            </div>
            <div className="sample-member">
              <strong>Michael Johnson</strong> - Keluarga Johnson (32 tahun)
              <br />📞 081122334455
            </div>
          </div>
        </div>
      </div>

      {/* Birthday Reminder Popup */}
      <AdminBirthdayReminder 
        isVisible={showReminder}
        onClose={handleCloseReminder}
      />
    </div>
  );
};

export default BirthdayReminderTest;
