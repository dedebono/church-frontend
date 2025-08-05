import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './admin/api/API';
import Swal from 'sweetalert2';


const ResetPasswordPage = () => {
  const { resetToken, type } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    setErrorMessage('Passwords do not match');
    return;
  }

  try {
    setIsLoading(true);

    if (!['family', 'member'].includes(type)) {
      setErrorMessage('Invalid reset link');
      return;
    }

    const response = await api.post(
      `/api/${type === 'family' ? 'families' : 'members'}/reset-password/${resetToken}`,
      { newPassword }
    );

    if (response.status === 200) {
      await Swal.fire({
        icon: 'success',
        title: 'Password berhasil direset',
        text: 'Silakan login dengan password baru.',
        confirmButtonText: 'OK'
      });

      navigate('/login'); // ✅ Redirect to login
    }
  } catch (err) {
    setErrorMessage('Reset failed. Try again.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: '5rem' }}>
      <h2>Reset {type === 'family' ? 'Family' : 'Member'} Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit" disabled={isLoading} style={{ padding: '0.75rem 1.5rem' }}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
