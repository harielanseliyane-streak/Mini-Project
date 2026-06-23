import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to={user?.role === 'student' ? '/student/dashboard' : '/college/dashboard'} replace />;
  }
  return children;
};

export default ProtectedRoute;
