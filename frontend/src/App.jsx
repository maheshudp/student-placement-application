import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import { LogOut } from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentForm from './pages/StudentForm';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/profile" replace />;
  return children;
};

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center text-xl font-bold text-indigo-600 tracking-tight cursor-pointer" onClick={() => navigate('/')}>
            StudentManager.
          </div>
          <div className="flex items-center gap-4">
            {user.role === 'ADMIN' && (
              <button onClick={() => navigate('/reports')} className="text-gray-600 hover:text-indigo-600 font-medium">
                Reports
              </button>
            )}
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {user.role}
            </span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 flex items-center transition-colors">
              <LogOut className="h-5 w-5 mr-1" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <NavBar />
      <main>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> : <Navigate to="/profile" replace />}
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute requireAdmin={true}>
              <Reports />
            </ProtectedRoute>
          } />

          {/* Both Admin (editing someone) and Students (editing themselves) can use the form */}
          <Route path="/form" element={
            <ProtectedRoute>
              <StudentForm />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              {/* Simply rendering the StudentForm for the user's own profile editing view */}
              <StudentForm isProfile={true} />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
