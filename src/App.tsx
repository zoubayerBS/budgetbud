
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import Savings from './pages/SavingsPage';
import AIAdvisor from './pages/AIAdvisor';
import Login from './pages/Login';
import Register from './pages/Register';
import { useSession } from './lib/auth-client';
import SplashScreen from './components/common/SplashScreen';
import AddTransactionModal from './components/modals/AddTransactionModal';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { data: session, isPending } = useSession();

  if (isPending) return <div className="min-h-screen flex items-center justify-center bg-[#eef2f6] dark:bg-[#111827]">Chargement...</div>;

  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { data: session, isPending } = useSession();

  if (isPending) return null;

  if (session) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <SplashScreen />
      <BudgetProvider>
        <AddTransactionModal />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="history" element={<History />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="savings" element={<Savings />} />
              <Route path="advisor" element={<AIAdvisor />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BudgetProvider>
    </>
  );
}

export default App;
