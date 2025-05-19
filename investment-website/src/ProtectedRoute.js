import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, children }) {
  if (!user) {
    // Redirect to home if not logged in
    return <Navigate to="/" replace />;
  }

  return children;
} 