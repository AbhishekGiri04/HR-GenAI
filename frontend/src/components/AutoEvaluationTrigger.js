import React, { useState } from 'react';
import { Zap, Clock } from 'lucide-react';

const AutoEvaluationTrigger = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState([]);

  const addProgress = (message) => {
    setProgress(prev => [...prev, message]);
  };

  const triggerBatchEvaluation = async () => {
    setLoading(true);
    setProgress([]);
    
    try {
      addProgress('🔍 Finding candidates with completed interviews...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? 'https://hrgen-dev.onrender.com' 
        : 'http://localhost:5001';
        
      const response = await fetch(`${API_BASE}/api/auto-eval/batch`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        addProgress('✅ All candidates evaluated successfully!');
        await new Promise(resolve => setTimeout(resolve, 800));
        addProgress('📧 Sending offer and rejection letters...');
        await new Promise(resolve => setTimeout(resolve, 1200));
        addProgress('🎉 Process completed! All letters sent via email.');
        
        setTimeout(() => {
          setProgress([]);
        }, 5000);
      } else {
        addProgress('❌ Failed to process batch evaluation');
      }
    } catch (error) {
      console.error('Batch evaluation error:', error);
      addProgress('❌ Error processing batch evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-8 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center">
            <Zap className="mr-3" size={24} />
            Auto-Evaluation System
          </h3>
          <p className="text-purple-100 text-sm mt-1">
            Automatically evaluates completed interviews and sends offer/rejection letters
          </p>
        </div>
        <button
          onClick={triggerBatchEvaluation}
          disabled={loading}
          className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-lg"
        >
          <Clock size={18} />
          <span>{loading ? 'Processing...' : 'Process All Pending'}</span>
        </button>
      </div>
      
      {/* Progress Display */}
      {progress.length > 0 && (
        <div className="mt-6 space-y-3">
          {progress.map((item, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm font-medium">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoEvaluationTrigger;