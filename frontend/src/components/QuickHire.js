import React, { useState } from 'react';
import { Zap, Mail, Loader, CheckCircle, XCircle, Sparkles, Briefcase } from 'lucide-react';
import API_URL from '../config/api';

const QuickHire = () => {
  const [email, setEmail] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState([]);

  const addProgress = (message, type) => {
    setProgress(prev => [...prev, { message, type }]);
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleQuickHire = async () => {
    if (!email || !jobRole) {
      setProgress([{ message: 'Please enter email and job role', type: 'error' }]);
      return;
    }

    setLoading(true);
    setProgress([]);

    try {
      addProgress('AI Creating Template...', 'loading');
      
      const response = await fetch(`${API_URL}/api/auto-hire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jobRole })
      });

      const data = await response.json();

      if (response.ok) {
        addProgress(`Template Created: ${data.templateName}`, 'success');
        await delay(800);
        addProgress('Template Auto-Deployed', 'success');
        await delay(800);
        addProgress(`Emails Sent: ${data.emailsSent}/${data.totalEmails}`, 'success');
        await delay(500);
        addProgress(`Done! ${data.emailsSent} candidates invited.`, 'success');
        
        setTimeout(() => {
          setEmail('');
          setJobRole('');
          setProgress([]);
        }, 5000);
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (error) {
      addProgress('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8 rounded-2xl shadow-2xl border-2 border-purple-200 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 flex items-center space-x-2">
            <span>Quick AI Hire</span>
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          </h2>
          <p className="text-sm text-gray-600">AI creates template → Deploys → Sends email → Huma interviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Candidate Emails (comma-separated)</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <textarea
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={loading}
              rows={2}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter multiple emails separated by commas</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Job Role</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Software Developer"
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleQuickHire}
        disabled={loading || !email || !jobRole}
        className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
          loading || !email || !jobRole
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:shadow-2xl'
        }`}
      >
        {loading ? (
          <>
            <Loader className="w-6 h-6 animate-spin" />
            <span>AI Processing...</span>
          </>
        ) : (
          <>
            <Zap className="w-6 h-6" />
            <span>Start AI Hire</span>
          </>
        )}
      </button>

      {progress.length > 0 && (
        <div className="mt-6 space-y-3">
          {progress.map((item, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                item.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : item.type === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              {item.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {item.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
              {item.type === 'loading' && <Loader className="w-5 h-5 text-blue-600 animate-spin" />}
              <span className={`text-sm font-medium ${
                item.type === 'success' ? 'text-green-700' : item.type === 'error' ? 'text-red-700' : 'text-blue-700'
              }`}>
                {item.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickHire;
