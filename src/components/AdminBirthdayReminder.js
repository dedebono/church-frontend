import React, { useState, useEffect } from 'react';
import './AdminBirthdayReminder.css';

// Use mock function if available, otherwise use real API
const getTodaysBirthdays = window.getTodaysBirthdays ||
  (async () => {
    const module = await import('../pages/admin/api/API');
    return module.getTodaysBirthdays();
  });

/** --- UTC-safe helpers (same approach as in ViewMember) --- */

// If API returns "YYYY-MM-DD", make it UTC midnight ISO; otherwise keep as-is
function normalizeIsoFromApi(iso) {
  if (!iso) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return `${iso}T00:00:00.000Z`;
  return iso;
}

// Extract UTC Y/M/D from any date-like input
function getUtcYmd(input) {
  if (!input) return null;
  let d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime()) && typeof input === 'string') {
    d = new Date(input + 'T00:00:00Z');
  }
  if (isNaN(d.getTime())) return null;
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
}

// For optional display of DOB as dd/mm/yyyy (UTC-safe)
function formatDateDDMMYYYYUTC(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Age using UTC parts (prevents +1 errors in UTC+ timezones)
function formatAgeUTC(birthDate) {
  const parts = getUtcYmd(birthDate);
  if (!parts) return '';
  const now = new Date();
  const ty = now.getUTCFullYear();
  const tm = now.getUTCMonth();
  const td = now.getUTCDate();
  let age = ty - parts.y;
  const hadBirthday =
    tm > parts.m || (tm === parts.m && td >= parts.d);
  if (!hadBirthday) age--;
  return `(${age} tahun)`;
}

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

      // Normalize date fields to UTC midnight ISO so parsing is stable
      const normalized = (response.birthdays || []).map((m) => ({
        ...m,
        birthDate: normalizeIsoFromApi(m.birthDate),
      }));

      setBirthdays(normalized);
    } catch (err) {
      console.error("Error fetching today's birthdays:", err);
      setError('Failed to load birthday data');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem('birthdayReminderSeen', new Date().toDateString());
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="birthday-reminder-overlay">
      <div className="birthday-reminder-modal">
        <div className="birthday-reminder-header">
          <h2>🎉 Ulang Tahun Hari Ini</h2>
          <button className="close-button" onClick={handleClose}>✖</button>
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
              <button onClick={fetchTodaysBirthdays} className="retry-button">Coba Lagi</button>
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
                            {/* Age in UTC; optionally add DOB display if you want */}
                            {formatAgeUTC(member.birthDate)}
                            {/* · {formatDateDDMMYYYYUTC(member.birthDate)} */}
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
