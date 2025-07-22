// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes, Route
import HomePage from './pages/HomePage';
import RegistrationForm from './pages/RegistrationForm';
import AdminLogin from './pages/AdminLogin';
import AdminPage from './pages/AdminPage';
import FormulirJemaat from './pages/formpage';
import ResetPasswordPage from './pages/Reset-password'; // Import the ResetPasswordPage
import FinanceAdmin from './pages/FinanceDashboard';
import ProtectedRoute from './pages/ProtectedRoute'; // import the wrapper


function App() {
  return (
    <Router>
      <Routes> {/* Use Routes instead of Switch */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
        <Route path="/login" element={<AdminLogin />} />
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
  );
}

export default App;