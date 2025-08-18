// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes, Route
import HomePage from './pages/HomePage';
import RegistrationForm from './pages/RegistrationForm';
import AdminLogin from './pages/AdminLogin';
import AdminPage from './pages/AdminPage';
import FormulirJemaat from './pages/formpage';
import ResetPasswordPage from './pages/Reset-password';
import FinanceAdmin from './pages/FinanceDashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import { SocketProvider } from './socket/SocketContext';

function App() {
  return (
    <SocketProvider>
    <Router>
      <Routes> {/* Use Routes instead of Switch */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/reset-password/:type/:resetToken" element={<ResetPasswordPage />} />
        <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['regular_admin']}>
        <AdminPage />
        </ProtectedRoute>}/>
        <Route path="/form" element={<FormulirJemaat/>}/>
        <Route
          path="/finance"
          element={
            <ProtectedRoute allowedRoles={['finance_admin']}>
              <FinanceAdmin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </SocketProvider>
  );
}

export default App;