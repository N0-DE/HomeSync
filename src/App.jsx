// src/App.jsx
//
// Top-level route table. Shared by both devs but should rarely need
// edits — new pages get one line here, everything else lives in
// src/pages/**.

import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FamilyProvider } from './context/FamilyContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CreateFamilyPage from './pages/Dashboard/CreateFamilyPage';
import JoinFamilyPage from './pages/Dashboard/JoinFamilyPage';
import ShoppingPage from './pages/Shopping/ShoppingPage';
import ActivityPage from './pages/Activity/ActivityPage';
import ProfilePage from './pages/Profile/ProfilePage';
import MapPage from './pages/Map/MapPage';

import { ROUTES } from './utils/constants';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Family onboarding — needs auth but not yet a family */}
      <Route
        path={ROUTES.CREATE_FAMILY}
        element={
          <ProtectedRoute>
            <CreateFamilyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.JOIN_FAMILY}
        element={
          <ProtectedRoute>
            <JoinFamilyPage />
          </ProtectedRoute>
        }
      />

      {/* Main app, wrapped in nav shell */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SHOPPING}
        element={
          <ProtectedRoute>
            <AppLayout>
              <ShoppingPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ACTIVITY}
        element={
          <ProtectedRoute>
            <AppLayout>
              <ActivityPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MapPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={isAuthenticated ? <DashboardPage /> : <LoginPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </FamilyProvider>
    </AuthProvider>
  );
}
