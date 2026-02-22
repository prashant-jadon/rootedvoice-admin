import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Therapists from './pages/Therapists';
import TherapistEarnings from './pages/TherapistEarnings';
import Clients from './pages/Clients';
import Payments from './pages/Payments';
import Pricing from './pages/Pricing';
import PaymentSplit from './pages/PaymentSplit';
import RateCaps from './pages/RateCaps';
import Sessions from './pages/Sessions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SupportChat from './pages/SupportChat';
import PlatformStats from './pages/PlatformStats';
import EvaluationFeedback from './pages/EvaluationFeedback';
import Calendar from './pages/Calendar';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapists"
        element={
          <ProtectedRoute>
            <Layout>
              <Therapists />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapists/earnings"
        element={
          <ProtectedRoute>
            <Layout>
              <TherapistEarnings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapists/:id/earnings"
        element={
          <ProtectedRoute>
            <Layout>
              <TherapistEarnings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Layout>
              <Clients />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Layout>
              <Payments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <Layout>
              <Pricing />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-split"
        element={
          <ProtectedRoute>
            <Layout>
              <PaymentSplit />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rate-caps"
        element={
          <ProtectedRoute>
            <Layout>
              <RateCaps />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <Layout>
              <Sessions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Layout>
              <Calendar />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/support-chat"
        element={
          <ProtectedRoute>
            <Layout>
              <SupportChat />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/platform-stats"
        element={
          <ProtectedRoute>
            <Layout>
              <PlatformStats />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/evaluation-feedback"
        element={
          <ProtectedRoute>
            <Layout>
              <EvaluationFeedback />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

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
