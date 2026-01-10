import React, { useState } from 'react';
import { FileText, Download, ExternalLink, AlertCircle } from 'lucide-react';
import API_URL from '../config/api';

const ResumeViewer = ({ candidateId, candidateName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleViewResume = () => {
    setLoading(true);
    setError(null);
    
    const resumeUrl = `${API_URL}/api/candidates/${candidateId}/resume`;
    
    // Try to open in new tab
    const newWindow = window.open(resumeUrl, '_blank');
    
    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      setError('Popup blocked. Please allow popups or try downloading instead.');
      setLoading(false);
      return;
    }
    
    // Check if the page loaded successfully
    setTimeout(() => {
      try {
        if (newWindow.location.href === 'about:blank') {
          setError('Resume could not be loaded. Please try downloading instead.');
          newWindow.close();
        }
      } catch (e) {
        // Cross-origin error means the page loaded successfully
      }
      setLoading(false);
    }, 2000);
  };

  const handleDownloadResume = () => {
    const resumeUrl = `${API_URL}/api/candidates/${candidateId}/resume`;
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = `${candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Primary View Button */}
      <button
        onClick={handleViewResume}
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all font-bold text-lg flex items-center space-x-3 border-2 border-white/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span>Opening Resume...</span>
          </>
        ) : (
          <>
            <FileText className="w-6 h-6" />
            <span>View Resume</span>
            <ExternalLink className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Alternative Download Button */}
      <button
        onClick={handleDownloadResume}
        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2 border border-gray-500/30 hover:scale-105"
      >
        <Download className="w-5 h-5" />
        <span>Download Resume</span>
      </button>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 max-w-md">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Unable to view resume</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <p className="text-red-600 text-sm mt-2">Try using the download button instead.</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 max-w-md">
        <p>Click "View Resume" to open in a new tab, or "Download Resume" to save the file locally.</p>
      </div>
    </div>
  );
};

export default ResumeViewer;