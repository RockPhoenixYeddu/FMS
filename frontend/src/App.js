import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import PrivateRoute from './components/PrivateRoute';

// Pages & Layout
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes Wrapper */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/transactions" element={<Transactions />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
