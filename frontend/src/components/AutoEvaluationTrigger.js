import React, { useState } from 'react';
import { Zap, Clock } from 'lucide-react';

const AutoEvaluationTrigger = () => {
  const [loading, setLoading] = useState(false);

  const triggerBatchEvaluation = async () => {
    setLoading(true);
    try {
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? 'https://hrgen-dev.onrender.com' 
        : 'http://localhost:5001';
        
      const response = await fetch(`${API_BASE}/api/auto-eval/batch`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ All pending candidates have been automatically evaluated and letters sent!');
      } else {
        alert('❌ Failed to process batch evaluation');
      }
    } catch (error) {
      console.error('Batch evaluation error:', error);
      alert('❌ Error processing batch evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center">
            <Zap className="mr-2" size={20} />
            Auto-Evaluation System
          </h3>
          <p className="text-purple-100 text-sm">
            Automatically evaluates completed interviews and sends offer/rejection letters
          </p>
        </div>
        <button
          onClick={triggerBatchEvaluation}
          disabled={loading}
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <Clock size={16} />
          <span>{loading ? 'Processing...' : 'Process All Pending'}</span>
        </button>
      </div>
    </div>
  );
};

export default AutoEvaluationTrigger;