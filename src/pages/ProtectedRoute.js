import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const adminRole = localStorage.getItem('adminRole');

  if (!isAdmin || !allowedRoles.includes(adminRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
