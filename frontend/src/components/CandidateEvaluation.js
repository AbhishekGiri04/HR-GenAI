import React, { useState, useEffect } from 'react';
import { Calculator, Mail, FileText, Award, TrendingUp, Users } from 'lucide-react';

const CandidateEvaluation = ({ candidate, onEvaluate }) => {
  const [loading, setLoading] = useState(false);
  const [evaluated, setEvaluated] = useState(false);
  const [scores, setScores] = useState({
    interviewScore: candidate.interviewScore || null,
    growthPotential: candidate.growthPotential || null,
    retentionScore: candidate.retentionScore || null
  });

  // Auto-calculate scores when component mounts if interview is completed
  useEffect(() => {
    if (candidate.interviewCompleted && !candidate.interviewScore) {
      handleRecalculate();
    }
  }, [candidate]);

  // Update scores when candidate prop changes
  useEffect(() => {
    setScores({
      interviewScore: candidate.interviewScore || null,
      growthPotential: candidate.growthPotential || null,
      retentionScore: candidate.retentionScore || null
    });
  }, [candidate.interviewScore, candidate.growthPotential, candidate.retentionScore]);

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
        
        // Show professional success message
        const letterType = data.data.status === 'offered' ? 'Offer' : 'Rejection';
        const message = `Evaluation Complete\n\nCandidate has been successfully evaluated.\n${letterType} letter has been sent to ${candidate.email}.`;
        alert(message);
        
        // Refresh page to show updated scores
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error(data.error || 'Evaluation failed');
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      alert(`Evaluation Error\n\nUnable to evaluate candidate.\nReason: ${error.message}`);
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
        // Update local scores
        setScores({
          interviewScore: data.data.interviewScore,
          growthPotential: data.data.growthPotential,
          retentionScore: data.data.retentionScore
        });
        
        if (onEvaluate) onEvaluate(data.data);
        alert('Score Recalculation Complete\n\nAll scores have been successfully recalculated based on interview performance.');
      } else {
        throw new Error(data.error || 'Recalculation failed');
      }
    } catch (error) {
      console.error('Recalculation error:', error);
      alert(`Recalculation Error\n\nUnable to recalculate scores.\nReason: ${error.message}`);
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
      
      alert(`Letter Download Complete\n\n${type.charAt(0).toUpperCase() + type.slice(1)} letter has been downloaded successfully.`);
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download Error\n\nUnable to download ${type} letter.\nReason: ${error.message}`);
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
    <div className="bg-transparent">
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-3">
          <button
            onClick={handleRecalculate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl disabled:opacity-50 flex items-center space-x-2 transition-all"
          >
            <Calculator size={16} />
            <span>Recalculate</span>
          </button>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl disabled:opacity-50 flex items-center space-x-2 transition-all"
          >
            <Mail size={16} />
            <span>{loading ? 'Processing...' : 'Evaluate & Send'}</span>
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className={`p-4 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-white/80">Interview Score</p>
              <p className="text-2xl font-bold text-white">
                {scores.interviewScore || 'N/A'}
                {scores.interviewScore && '/100'}
              </p>
            </div>
            <Award size={24} className="text-white/60" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-white/80">Growth Potential</p>
              <p className="text-2xl font-bold text-white">
                {scores.growthPotential || 'N/A'}
                {scores.growthPotential && '%'}
              </p>
            </div>
            <TrendingUp size={24} className="text-white/60" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-white/80">Retention Score</p>
              <p className="text-2xl font-bold text-white">
                {scores.retentionScore || 'N/A'}
                {scores.retentionScore && '%'}
              </p>
            </div>
            <Users size={24} className="text-white/60" />
          </div>
        </div>
      </div>

      {/* Verdict */}
      {scores.interviewScore && (
        <div className="mb-6">
          <div className={`p-4 rounded-xl text-center border-2 ${
            isPassed(scores.interviewScore) 
              ? 'bg-green-500/20 border-green-400/50 backdrop-blur-sm' 
              : 'bg-red-500/20 border-red-400/50 backdrop-blur-sm'
          }`}>
            <p className="text-sm font-medium text-white/80 mb-1">Final Verdict</p>
            <p className={`text-xl font-bold mb-1 ${
              isPassed(scores.interviewScore) ? 'text-green-300' : 'text-red-300'
            }`}>
              {getVerdict(scores.interviewScore)}
            </p>
            <p className={`text-sm font-medium ${
              isPassed(scores.interviewScore) ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPassed(scores.interviewScore) ? 'Passed' : 'Did not meet requirements'}
            </p>
          </div>
        </div>
      )}

      {/* Letter Download Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={() => downloadLetter('offer')}
          className="flex-1 bg-green-600/80 hover:bg-green-600 text-white py-3 rounded-xl transition-all font-medium flex items-center justify-center space-x-2 backdrop-blur-sm border border-green-500/30"
        >
          <FileText size={16} />
          <span>Offer Letter</span>
        </button>
        <button
          onClick={() => downloadLetter('rejection')}
          className="flex-1 bg-red-600/80 hover:bg-red-600 text-white py-3 rounded-xl transition-all font-medium flex items-center justify-center space-x-2 backdrop-blur-sm border border-red-500/30"
        >
          <FileText size={16} />
          <span>Rejection Letter</span>
        </button>
      </div>

      {evaluated && (
        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/50 rounded-xl backdrop-blur-sm">
          <p className="text-blue-300 text-sm font-medium">
            Evaluation completed successfully. Letter has been sent via email.
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateEvaluation;