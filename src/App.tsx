import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/auth/AuthPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import './App.css';

// Loading screen
function LoadingScreen() {
  return (
    <div className="h-screen w-full bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-accent/30">
          <span className="text-white font-bold text-xl">EU</span>
        </div>
        <p className="text-secondary text-sm">Loading Grant Manager...</p>
      </div>
    </div>
  );
}

// Import views
import { Dashboard } from '@/components/views/Dashboard';
import { Pipeline } from '@/components/views/Pipeline';
import { GrantDetail } from '@/components/views/GrantDetail';
import { ApplicationBuilder } from '@/components/views/ApplicationBuilder';
import { Reports } from '@/components/views/Reports';
import { Settings } from '@/components/views/Settings';
import { Calendar } from '@/components/views/Calendar';
import { Recommendations } from '@/components/views/Recommendations';
import { GrantComparison } from '@/components/views/GrantComparison';
import { BudgetCalculator } from '@/components/views/BudgetCalculator';
import { TeamManagement } from '@/components/views/TeamManagement';
import { HelpCenter } from '@/components/views/HelpCenter';

// App routes component
function AppRoutes() {
  const { user, loading } = useAuth();
  
  const noop = () => {};

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Auth Route */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/" replace /> : <AuthPage />} 
      />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="grants/:grantId" element={<GrantDetail />} />
        <Route path="builder" element={<ApplicationBuilder onClose={noop} />} />
        <Route path="reports" element={<Reports />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="comparison" element={<GrantComparison />} />
        <Route path="budget" element={<BudgetCalculator />} />
        <Route path="team" element={<TeamManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<HelpCenter onClose={noop} />}/>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
