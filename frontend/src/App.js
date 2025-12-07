import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from './pages/LoadingScreen';
import Dashboard from './pages/Dashboard';
import CandidateAnalysis from './pages/CandidateAnalysis';
import GenomeProfile from './pages/GenomeProfile';
import ProfilePage from './pages/ProfilePage';
import Analytics from './pages/Analytics';
import './styles/App.css';

function AppContent() {
  const [showLoading, setShowLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show loading screen for 4 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
      if (location.pathname === '/') {
        navigate('/dashboard');
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate, location.pathname]);

  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analysis" element={<CandidateAnalysis />} />
      <Route path="/profile/:candidateId" element={<ProfilePage />} />
      <Route path="/genome/:id" element={<GenomeProfile />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;