import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ViewComplaints from './pages/ViewComplaints';
import FileComplaint from './pages/FileComplaint';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function Layout({ children, showNav = true }) {
  return (
    <>
      {showNav && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/signup" element={<Layout><Signup /></Layout>} />
          <Route path="/complaints" element={<Layout><ViewComplaints /></Layout>} />

          {/* Admin routes (no regular navbar) */}
          <Route path="/admin/login" element={<Layout showNav={false}><AdminLogin /></Layout>} />
          <Route path="/admin" element={
            <AdminRoute>
              <Layout showNav={false}><AdminDashboard /></Layout>
            </AdminRoute>
          } />

          {/* Protected user routes */}
          <Route path="/file-complaint" element={
            <ProtectedRoute>
              <Layout><FileComplaint /></Layout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
