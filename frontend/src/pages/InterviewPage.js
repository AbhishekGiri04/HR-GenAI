import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Modal, notification } from 'antd';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import InterviewManager from '../components/InterviewManager';
import AICopilot from '../components/AICopilot';
import TemplateBasedInterview from '../components/TemplateBasedInterview';
import Header from '../components/Header';

const ComprehensiveInterview = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { template, questions, aiGenerated } = location.state || {};
  
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interviewResults, setInterviewResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [copilotStealthMode, setCopilotStealthMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // If template is provided, use template-based interview directly
  if (template && questions) {
    return <TemplateBasedInterview />;
  }

  // Only show InterviewManager if no template is provided
  if (!template && !questions) {
    // Load candidate data for regular interview flow
  }
  useEffect(() => {
    const loadCandidateData = async () => {
      try {
        if (candidateId) {
          const response = await fetch(`/api/candidates/${candidateId}`);
          if (response.ok) {
            const data = await response.json();
            setCandidateData(data);
          }
        }
      } catch (error) {
        console.error('Failed to load candidate data:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to load candidate information'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCandidateData();
  }, [candidateId]);

  // Handle interview completion
  const handleInterviewComplete = (results) => {
    setInterviewResults(results);
    setShowResults(true);
    
    notification.success({
      message: 'Interview Completed',
      description: 'Interview has been completed and results have been generated.'
    });
  };

  // Handle copilot suggestions
  const handleCopilotSuggestion = (suggestion) => {
    // Could be used to show notifications or update UI
    console.log('AI Copilot suggestion:', suggestion);
  };

  // Navigate back
  const handleBack = () => {
    navigate('/dashboard');
  };

  // View results
  const viewResults = () => {
    if (interviewResults?.analysisId) {
      navigate(`/analysis/${interviewResults.analysisId}`);
    } else {
      navigate('/analytics');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={handleBack}
            >
              Back to Dashboard
            </Button>
            
            <Button
              onClick={() => navigate('/hr-dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              HR Dashboard
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                AI-Powered Interview
              </h1>
              {candidateData && (
                <p className="text-gray-600">
                  Candidate: {candidateData.name} | Position: {candidateData.position}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Interview Manager - Main Content */}
          <div className="xl:col-span-3">
            <InterviewManager
              candidateData={candidateData}
              onInterviewComplete={handleInterviewComplete}
              onQuestionChange={setCurrentQuestion}
            />
          </div>

          {/* AI Copilot - Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <AICopilot
                candidateData={candidateData}
                currentQuestion={currentQuestion}
                onSuggestionGenerated={handleCopilotSuggestion}
                stealthMode={copilotStealthMode}
                onStealthToggle={() => setCopilotStealthMode(!copilotStealthMode)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      <Modal
        title="Interview Completed"
        open={showResults}
        onCancel={() => setShowResults(false)}
        footer={[
          <Button key="close" onClick={() => setShowResults(false)}>
            Close
          </Button>,
          <Button key="results" type="primary" onClick={viewResults}>
            View Detailed Results
          </Button>
        ]}
        width={600}
      >
        {interviewResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {interviewResults.answers?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((interviewResults.totalTime || 0) / 60)}m
                </div>
                <div className="text-sm text-gray-600">Total Duration</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Interview Summary</h4>
              <ul className="text-sm space-y-1">
                <li>• Interview type: {interviewResults.interviewType}</li>
                <li>• Completion rate: {Math.round(((interviewResults.answers?.length || 0) / (interviewResults.questions?.length || 1)) * 100)}%</li>
                <li>• Auto-submitted answers: {interviewResults.answers?.filter(a => a.autoSubmitted).length || 0}</li>
                <li>• Voice transcription: {interviewResults.answers?.some(a => a.transcription) ? 'Yes' : 'No'}</li>
              </ul>
            </div>

            <div className="text-center text-sm text-gray-600">
              Detailed analysis and scoring will be available in the results page.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComprehensiveInterview;