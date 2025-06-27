// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes, Route
import HomePage from './pages/HomePage';
import RegistrationForm from './pages/RegistrationForm';
import AdminLogin from './pages/AdminLogin';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/Reset-password'; // Import the ResetPasswordPage

function App() {
  return (
    <Router>
      <Routes> {/* Use Routes instead of Switch */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
