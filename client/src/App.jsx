import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import AuthGuard from './components/AuthGuard';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import HabitationDetail from './pages/HabitationDetail';
import RedZones from './pages/RedZones';
import RelocationPriority from './pages/RelocationPriority';
import RelocationPlanner from './pages/RelocationPlanner';
import SafeSites from './pages/SafeSites';
import CapacityDashboard from './pages/CapacityDashboard';
import Methodology from './pages/Methodology';
import AlertCenter from './pages/AlertCenter';
import CitizenPortal from './pages/CitizenPortal';
import EmergencyAgency from './pages/EmergencyAgency';
import MapPage from './pages/MapPage';

// Layout wrapper for authority/agency views (with sidebar)
function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Inter, sans-serif', fontSize: 13 },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public Marketing Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Authentication Screens */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage initialMode="signup" />} />

          {/* Citizen portal — public & operational */}
          <Route path="/citizen" element={<CitizenPortal />} />

          {/* Protected Command Center / Operational Views */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/map"
            element={
              <AuthGuard>
                <AppLayout>
                  <MapPage />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/red-zones"
            element={
              <AuthGuard>
                <AppLayout>
                  <RedZones />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/relocation-priority"
            element={
              <AuthGuard>
                <AppLayout>
                  <RelocationPriority />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/relocation-planner"
            element={
              <AuthGuard>
                <AppLayout>
                  <RelocationPlanner />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/safe-sites"
            element={
              <AuthGuard>
                <AppLayout>
                  <SafeSites />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/capacity"
            element={
              <AuthGuard>
                <AppLayout>
                  <CapacityDashboard />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/habitation/:id"
            element={
              <AuthGuard>
                <AppLayout>
                  <HabitationDetail />
                </AppLayout>
              </AuthGuard>
            }
          />
          {/* Backward compatibility alias */}
          <Route
            path="/village/:id"
            element={
              <AuthGuard>
                <AppLayout>
                  <HabitationDetail />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/methodology"
            element={
              <AuthGuard>
                <AppLayout>
                  <Methodology />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/alerts"
            element={
              <AuthGuard>
                <AppLayout>
                  <AlertCenter />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/agency"
            element={
              <AuthGuard>
                <AppLayout>
                  <EmergencyAgency />
                </AppLayout>
              </AuthGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

