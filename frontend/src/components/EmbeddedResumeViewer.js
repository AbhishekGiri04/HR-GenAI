import React, { useState } from 'react';
import { FileText, Download, ExternalLink, AlertCircle, Eye, Maximize2 } from 'lucide-react';
import API_URL from '../config/api';

const EmbeddedResumeViewer = ({ candidateId, candidateName }) => {
  const [viewMode, setViewMode] = useState('buttons'); // 'buttons', 'embedded', 'error'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resumeUrl = `${API_URL}/api/candidates/${candidateId}/resume`;

  const handleViewInline = () => {
    setLoading(true);
    setError(null);
    setViewMode('embedded');
    setLoading(false);
  };

  const handleViewExternal = () => {
    const newWindow = window.open(resumeUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      setError('Popup blocked. Please allow popups or try the inline viewer.');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = `${candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmbedError = () => {
    setViewMode('error');
    setError('Unable to display PDF inline. This may be due to browser restrictions or file format.');
  };

  if (viewMode === 'embedded') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200">
          <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">{candidateName} - Resume</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleViewExternal}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('buttons')}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Close viewer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative" style={{ height: '600px' }}>
            <iframe
              src={`${resumeUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full"
              title={`${candidateName} Resume`}
              onError={handleEmbedError}
              onLoad={() => setLoading(false)}
            >
              <p className="p-4 text-center text-gray-600">
                Your browser does not support PDF viewing.
                <button onClick={handleDownload} className="text-blue-600 hover:underline ml-1">
                  Download the resume instead
                </button>
              </p>
            </iframe>
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading resume...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => setViewMode('buttons')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to options
          </button>
        </div>
      </div>
    );
  }\n\n  if (viewMode === 'error') {\n    return (\n      <div className=\"space-y-4\">\n        <div className=\"bg-red-50 border border-red-200 rounded-xl p-6 text-center\">\n          <AlertCircle className=\"w-12 h-12 text-red-500 mx-auto mb-4\" />\n          <h3 className=\"text-lg font-semibold text-red-800 mb-2\">Unable to Display Resume</h3>\n          <p className=\"text-red-600 mb-4\">{error}</p>\n          <div className=\"flex justify-center space-x-4\">\n            <button\n              onClick={handleViewExternal}\n              className=\"bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2\"\n            >\n              <ExternalLink className=\"w-4 h-4\" />\n              <span>Open in New Tab</span>\n            </button>\n            <button\n              onClick={handleDownload}\n              className=\"bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2\"\n            >\n              <Download className=\"w-4 h-4\" />\n              <span>Download</span>\n            </button>\n          </div>\n        </div>\n        <div className=\"text-center\">\n          <button\n            onClick={() => setViewMode('buttons')}\n            className=\"text-blue-600 hover:text-blue-800 font-medium\"\n          >\n            ← Back to options\n          </button>\n        </div>\n      </div>\n    );\n  }\n\n  // Default button view\n  return (\n    <div className=\"space-y-4\">\n      {/* Primary Action Buttons */}\n      <div className=\"flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4\">\n        <button\n          onClick={handleViewInline}\n          className=\"bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all font-bold text-lg flex items-center space-x-3 border-2 border-white/20 hover:scale-105\"\n        >\n          <Eye className=\"w-6 h-6\" />\n          <span>View Inline</span>\n        </button>\n        \n        <button\n          onClick={handleViewExternal}\n          className=\"bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all font-bold text-lg flex items-center space-x-3 border-2 border-white/20 hover:scale-105\"\n        >\n          <ExternalLink className=\"w-6 h-6\" />\n          <span>Open in New Tab</span>\n        </button>\n      </div>\n\n      {/* Secondary Download Button */}\n      <div className=\"text-center\">\n        <button\n          onClick={handleDownload}\n          className=\"bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2 border border-gray-500/30 hover:scale-105 mx-auto\"\n        >\n          <Download className=\"w-5 h-5\" />\n          <span>Download Resume</span>\n        </button>\n      </div>\n\n      {/* Error Message */}\n      {error && (\n        <div className=\"bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 max-w-md mx-auto\">\n          <AlertCircle className=\"w-5 h-5 text-red-500 mt-0.5 flex-shrink-0\" />\n          <div>\n            <p className=\"text-red-800 font-medium\">Notice</p>\n            <p className=\"text-red-600 text-sm mt-1\">{error}</p>\n          </div>\n        </div>\n      )}\n\n      {/* Instructions */}\n      <div className=\"text-center text-sm text-gray-400 max-w-md mx-auto\">\n        <p>Choose \"View Inline\" for embedded viewing or \"Open in New Tab\" for full browser experience.</p>\n      </div>\n    </div>\n  );\n};\n\nexport default EmbeddedResumeViewer;