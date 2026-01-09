import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authContext';
import LoadingPage from './pages/LoadingPage';
import DashboardPage from './pages/DashboardPage';
import GenomeProfilePage from './pages/GenomeProfilePage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import SettingsPage from './pages/SettingsPage';
import UserProfilePage from './pages/UserProfilePage';
import InterviewPage from './pages/InterviewPage';
import HRDashboardPage from './pages/HRDashboardPage';
import CandidateInterviewPage from './pages/CandidateInterviewPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleSelection from './components/RoleSelection';
import TemplateSelection from './components/TemplateSelection';
import TemplateBasedInterview from './components/TemplateBasedInterview';
import TemplateNotification from './components/TemplateNotification';
import useTemplateNotifications from './hooks/useTemplateNotifications';
import './styles/main.css';

function AppContent() {
  const [showLoading, setShowLoading] = useState(true);
  const { user, loading, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notification, closeNotification } = useTemplateNotifications();

  useEffect(() => {
    // Show loading screen for 4 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
      if (location.pathname === '/' && user && !userRole) {
        // User is logged in but no role selected
        return; // Stay on role selection
      } else if (location.pathname === '/' && user && userRole) {
        navigate('/dashboard');
      } else if (location.pathname === '/' && !user) {
        navigate('/signin');
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate, location.pathname, user]);

  if (showLoading || loading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={
          user ? (userRole ? <Navigate to="/dashboard" replace /> : <RoleSelection />) : <Navigate to="/signin" replace />
        } />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/template-selection/:candidateId" element={<ProtectedRoute><TemplateSelection /></ProtectedRoute>} />
        <Route path="/template-selection" element={<ProtectedRoute><TemplateSelection /></ProtectedRoute>} />
        <Route path="/profile/:candidateId" element={<ProtectedRoute><CandidateProfilePage /></ProtectedRoute>} />
        <Route path="/genome/:id" element={<ProtectedRoute><GenomeProfilePage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute requireRole="hr"><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/interview/:candidateId" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        <Route path="/hr-dashboard" element={<ProtectedRoute requireRole="hr"><HRDashboardPage /></ProtectedRoute>} />
        <Route path="/candidate-interview/:interviewId/:candidateId" element={<CandidateInterviewPage />} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />} />
      </Routes>
      
      {notification && (
        <TemplateNotification
          notification={notification}
          onConfirm={notification.onConfirm || (() => {})}
          onCancel={() => {}}
          onClose={closeNotification}
        />
      )}
    </>
  );
}

// Global notification context
window.showTemplateNotification = null;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;