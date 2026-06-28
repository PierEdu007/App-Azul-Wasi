import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthPage from '@/pages/AuthPage';
import MisionesPage from '@/pages/MisionesPage';
import AprendePage from '@/pages/AprendePage';
import DonarPage from '@/pages/DonarPage';
import DashboardPage from '@/pages/DashboardPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

function VolunteerRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-azul flex items-center justify-center"><div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/misiones" replace />} />
          <Route path="/login" element={<AuthPage />} />
          
          <Route path="/misiones" element={<VolunteerRoute><MisionesPage /></VolunteerRoute>} />
          <Route path="/aprende" element={<VolunteerRoute><AprendePage /></VolunteerRoute>} />
          <Route path="/donar" element={<VolunteerRoute><DonarPage /></VolunteerRoute>} />
          
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
