import React, { useState } from 'react';
import { Calculator, Mail, FileText, Award, TrendingUp, Users } from 'lucide-react';

const CandidateEvaluation = ({ candidate, onEvaluate }) => {
  const [loading, setLoading] = useState(false);
  const [evaluated, setEvaluated] = useState(false);

  const handleEvaluate = async () => {
    if (!candidate._id) {
      alert('Candidate ID not found');
      return;
    }

    setLoading(true);
    try {
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? 'https://hrgen-dev.onrender.com' 
        : 'http://localhost:5001';
        
      const response = await fetch(`${API_BASE}/api/evaluation/evaluate/${candidate._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setEvaluated(true);
        if (onEvaluate) onEvaluate(data.data.evaluation);
        alert(`✅ Candidate evaluated! ${data.data.status === 'offered' ? 'Offer' : 'Rejection'} letter sent via email.`);
        
        // Refresh page to show updated scores
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error(data.error || 'Evaluation failed');
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      alert(`❌ Failed to evaluate candidate: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!candidate._id) {
      alert('Candidate ID not found');
      return;
    }

    setLoading(true);
    try {
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? 'https://hrgen-dev.onrender.com' 
        : 'http://localhost:5001';
        
      const response = await fetch(`${API_BASE}/api/evaluation/recalculate/${candidate._id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        if (onEvaluate) onEvaluate(data.data);
        alert('✅ Scores recalculated successfully!');
        
        // Refresh page to show updated scores
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error(data.error || 'Recalculation failed');
      }
    } catch (error) {
      console.error('Recalculation error:', error);
      alert(`❌ Failed to recalculate scores: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadLetter = async (type) => {
    if (!candidate._id) {
      alert('Candidate ID not found');
      return;
    }
    
    try {
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? 'https://hrgen-dev.onrender.com' 
        : 'http://localhost:5001';
        
      const response = await fetch(`${API_BASE}/api/evaluation/letter/${candidate._id}/${type}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_letter_${candidate.name?.replace(/\s+/g, '_') || 'candidate'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} letter downloaded successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      alert(`❌ Failed to download ${type} letter: ${error.message}`);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-purple-600 bg-purple-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getVerdict = (score) => {
    if (score >= 90) return 'Strong Hire';
    if (score >= 80) return 'Hire';
    if (score >= 70) return 'Maybe';
    return 'Reject';
  };

  const isPassed = (score) => {
    const passingScore = candidate.assignedTemplate?.passingScore || 70;
    return score >= passingScore;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <Award className="mr-2 text-blue-600" size={24} />
          Interview Evaluation
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleRecalculate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2"
          >
            <Calculator size={16} />
            <span>Recalculate</span>
          </button>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2"
          >
            <Mail size={16} />
            <span>{loading ? 'Processing...' : 'Evaluate & Send Letter'}</span>
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${getScoreColor(candidate.interviewScore || 0)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">Interview Score</p>
              <p className="text-2xl font-bold">
                {candidate.interviewScore || 'N/A'}
                {candidate.interviewScore && '/100'}
              </p>
            </div>
            <Award size={24} />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${getScoreColor(candidate.growthPotential || 0)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">Growth Potential</p>
              <p className="text-2xl font-bold">
                {candidate.growthPotential || 'N/A'}
                {candidate.growthPotential && '%'}
              </p>
            </div>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${getScoreColor(candidate.retentionScore || 0)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">Retention Score</p>
              <p className="text-2xl font-bold">
                {candidate.retentionScore || 'N/A'}
                {candidate.retentionScore && '%'}
              </p>
            </div>
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Verdict */}
      {candidate.interviewScore && (
        <div className="mb-6">
          <div className={`p-4 rounded-lg text-center ${
            isPassed(candidate.interviewScore) 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-sm font-medium text-gray-600 mb-1">Final Verdict</p>
            <p className={`text-xl font-bold ${
              isPassed(candidate.interviewScore) ? 'text-green-700' : 'text-red-700'
            }`}>
              {getVerdict(candidate.interviewScore)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isPassed(candidate.interviewScore) ? '✅ Passed' : '❌ Did not meet requirements'}
            </p>
          </div>
        </div>
      )}

      {/* Letter Download Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => downloadLetter('offer')}
          className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg hover:bg-green-200 transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <FileText size={16} />
          <span>Download Offer Letter</span>
        </button>
        <button
          onClick={() => downloadLetter('rejection')}
          className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <FileText size={16} />
          <span>Download Rejection Letter</span>
        </button>
      </div>

      {evaluated && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm font-medium">
            ✅ Candidate evaluated and letter sent via email successfully!
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateEvaluation;