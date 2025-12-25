import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const ProtectedRoute = ({ children, requireRole }) => {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#08090D] to-[#1A1C20] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#CAC5FE] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#CAC5FE] text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  if (requireRole && userRole !== requireRole) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user.emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#08090D] to-[#1A1C20] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] rounded-2xl p-8 border border-[#4B4D4F]">
            <h2 className="text-2xl font-bold text-white mb-4">Email Verification Required</h2>
            <p className="text-[#CAC5FE] mb-6">
              Please verify your email address to access the interview platform.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#CAC5FE] text-[#08090D] font-bold rounded-xl hover:bg-white transition-colors"
            >
              I've Verified My Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;