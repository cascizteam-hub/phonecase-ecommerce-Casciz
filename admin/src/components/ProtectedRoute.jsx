import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader label="Checking session…" />;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;

  return children;
}
