import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// User Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/user/DashboardPage';
import MenuPage from './pages/user/MenuPage';
import ReservationPage from './pages/user/ReservationPage';
import HistoryPage from './pages/user/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminReservationPage from './pages/admin/ReservationPage';
import AdminMenuPage from './pages/admin/MenuPage';
import AdminTablePage from './pages/admin/TablePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* User Routes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route 
            path="/reservation" 
            element={
              <ProtectedRoute>
                <ReservationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reservations" 
            element={
              <ProtectedRoute adminOnly>
                <AdminReservationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/menu" 
            element={
              <ProtectedRoute adminOnly>
                <AdminMenuPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/tables" 
            element={
              <ProtectedRoute adminOnly>
                <AdminTablePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Not Found */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;