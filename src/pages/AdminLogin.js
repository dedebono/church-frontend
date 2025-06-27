// src/pages/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === '123456') {
      navigate('/admin');
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className='page-login-page'>
    <div className="container-login-page">
      <h2>Admin Login</h2>
      <input
        className="form-login"
        type="password"
        placeholder="Masukan Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="button-login"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
    </div>
  );
};

export default AdminLogin;
