import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../pages/admin/api/API'; // adjust path if needed
import Swal from 'sweetalert2';
import './AdminLogin.css';

// 🔑 import useSocket
import { useSocket } from '../../src/socket/SocketContext';

const AdminLogin = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // use socket helpers
  const { setToken, reconnect } = useSocket();

  const handleEmailSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/api/admin/request-login', { email });
      Swal.fire({
        icon: 'success',
        title: 'OTP Terkirim',
        text: 'Kode OTP telah dikirim ke email Anda.',
        timer: 2500,
        showConfirmButton: false,
      });
      setStep('code');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Email tidak dikenali atau terjadi kesalahan server.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/admin/verify-login', { email, code });
      const { token } = res.data;

      if (!token) {
        throw new Error('No token returned from server');
      }

      // 🔑 Save token for socket + API
      setToken(token);   // updates axios headers + localStorage
      reconnect();       // force socket to reconnect with new token

      if (res.data.success) {
        const role = res.data.role;
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Login',
          text: `Login sebagai ${role.replace('_', ' ')}`,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          localStorage.setItem('isAdmin', 'true');
          localStorage.setItem('adminRole', role);

          if (role === 'regular_admin') {
            navigate('/admin');
          } else if (role === 'finance_admin') {
            navigate('/finance');
          } else {
            navigate('/admin'); // fallback
          }
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Kode OTP Salah',
        text: 'Kode OTP tidak valid atau sudah kedaluwarsa.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-login-page">
      <div className="container-login-page">
        <h2>Admin Login</h2>

        {step === 'email' ? (
          <>
            <input
              className="form-login"
              type="email"
              placeholder="Masukkan email admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <div className="divider">
              <button
                className="button-login"
                onClick={handleEmailSubmit}
                disabled={loading}
              >
                {loading ? 'Mengirim...' : 'Kirim Kode'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p>Kode telah dikirim ke: <strong>{email}</strong></p>
            <input
              className="form-login"
              type="text"
              placeholder="Masukkan OTP dari email"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />
            <div className="divider">
              <button
                className="button-login"
                onClick={handleCodeSubmit}
                disabled={loading}
              >
                {loading ? 'Memverifikasi...' : 'Login'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
