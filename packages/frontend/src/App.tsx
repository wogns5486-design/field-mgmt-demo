import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SiteCreatePage } from './pages/SiteCreatePage';
import { SiteDetailPage } from './pages/SiteDetailPage';
import { WorkerFormPage } from './pages/WorkerFormPage';
import { Layout } from './components/Layout';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/s/:shortUrl" element={<WorkerFormPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sites/new" element={<SiteCreatePage />} />
          <Route path="sites/:id" element={<SiteDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
