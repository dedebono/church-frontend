import React, { useState, useEffect } from 'react';
import './AdminBirthdayReminder.css';

// Use mock function if available, otherwise use real API
const getTodaysBirthdays = window.getTodaysBirthdays || 
  (async () => {
    const module = await import('../pages/admin/api/API');
    return module.getTodaysBirthdays();
  });

const AdminBirthdayReminder = ({ isVisible, onClose }) => {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isVisible) {
      fetchTodaysBirthdays();
    }
  }, [isVisible]);

  const fetchTodaysBirthdays = async () => {
    try {
      setLoading(true);
      const response = await getTodaysBirthdays();
      setBirthdays(response.birthdays || []);
    } catch (err) {
      console.error('Error fetching today\'s birthdays:', err);
      setError('Failed to load birthday data');
    } finally {
      setLoading(false);
    }
  };

  const formatAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return `(${age} tahun)`;
  };

  const handleClose = () => {
    // Mark as seen for today to prevent showing again
    localStorage.setItem('birthdayReminderSeen', new Date().toDateString());
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="birthday-reminder-overlay">
      <div className="birthday-reminder-modal">
        <div className="birthday-reminder-header">
          <h2>🎉 Ulang Tahun Hari Ini</h2>
          <button className="close-button" onClick={handleClose}>
            ✖
          </button>
        </div>

        <div className="birthday-reminder-content">
          {loading ? (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Memuat data ulang tahun...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>❌ {error}</p>
              <button onClick={fetchTodaysBirthdays} className="retry-button">
                Coba Lagi
              </button>
            </div>
          ) : birthdays.length > 0 ? (
            <div className="birthday-list">
              <p className="birthday-intro">
                Ada <strong>{birthdays.length}</strong> anggota jemaat yang berulang tahun hari ini:
              </p>
              <div className="birthday-members">
                {birthdays.map((member, index) => (
                  <div key={index} className="birthday-member">
                    <div className="member-info">
                      <h3>{member.name}</h3>
                      <p className="member-details">
                        {member.family && <span>Keluarga: {member.family}</span>}
                        {member.birthDate && (
                          <span className="age-info">
                            {formatAge(member.birthDate)}
                          </span>
                        )}
                      </p>
                      {member.phone && (
                        <p className="contact-info">📞 {member.phone}</p>
                      )}
                    </div>
                    <div className="birthday-icon">🎂</div>
                  </div>
                ))}
              </div>
              <div className="birthday-actions">
                <p className="reminder-text">
                  💡 Jangan lupa untuk mengucapkan selamat ulang tahun!
                </p>
              </div>
            </div>
          ) : (
            <div className="no-birthdays">
              <div className="no-birthday-icon">📅</div>
              <h3>Tidak Ada Ulang Tahun Hari Ini</h3>
              <p>Tidak ada anggota jemaat yang berulang tahun hari ini.</p>
            </div>
          )}
        </div>

        <div className="birthday-reminder-footer">
          <button className="dismiss-button" onClick={handleClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBirthdayReminder;
