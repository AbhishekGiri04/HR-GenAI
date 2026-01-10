import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Mic, MicOff, Play, Phone } from 'lucide-react';
import Header from '../components/Header';
import TimedCulturalInterview from '../components/TimedCulturalInterview';
import TextInterview from '../components/TextInterview';
// import AIInterviewer from '../components/AIInterviewer'; // Not used - removed
// import VoiceAPIAgent from '../components/VoiceAPIAgent'; // Not used - removed

const TemplateBasedInterview = () => {
  const { candidateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { template, questions, aiGenerated } = location.state || {};
  
  const [interviewPhase, setInterviewPhase] = useState('setup');
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voiceAnswers, setVoiceAnswers] = useState([]);
  const [textAnswers, setTextAnswers] = useState([]);

  // Separate questions by type for mixed interviews
  const voiceQuestions = questions?.filter(q => q.type === 'voice' || q.interviewMode === 'voice') || [];
  const textQuestions = questions?.filter(q => q.type === 'text' || q.interviewMode === 'text') || [];
  
  const isVoiceInterview = template?.interviewType === 'technical';
  const isTextInterview = template?.interviewType === 'behavioral';
  const isMixedInterview = template?.interviewType === 'mixed';
  
  console.log('Interview Type:', template?.interviewType);
  console.log('Voice Questions:', voiceQuestions.length);
  console.log('Text Questions:', textQuestions.length);
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/candidates/${candidateId}`);
        if (response.ok) {
          const data = await response.json();
          setCandidateData(data);
        }
      } catch (error) {
        console.error('Failed to fetch candidate data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidateData();
    } else {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    if (!template || !questions) {
      navigate('/dashboard');
      return;
    }
  }, [template, questions, navigate]);

  const handleCompleteInterview = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analysis/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          templateId: template._id,
          aiGenerated
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setInterviewPhase('completed');
        
        setTimeout(() => {
          navigate(`/genome/${candidateId}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit interview:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate data...</p>
        </div>
      </div>
    );
  }

  if (!template || !questions) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Interview Not Found</h2>
          <p className="text-gray-600">Please select a template to start the interview.</p>
        </div>
      </div>
    );
  }

  if (interviewPhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{template.name} Assessment</h1>
              <p className="text-gray-600 text-lg">
                {isMixedInterview && 'Mixed Interview: Voice + Text Questions'}
                {isVoiceInterview && 'Voice Interview with AI'}
                {isTextInterview && 'Text-based Cultural Interview'}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 text-sm">
                  {isMixedInterview && `🎤 ${voiceQuestions.length} Voice Questions + 📝 ${textQuestions.length} Text Questions`}
                  {isVoiceInterview && '🎤 Voice interview with AI conversation'}
                  {isTextInterview && '📝 Timed text questions with proctoring'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Duration</h3>
                <p className="text-blue-600 font-bold">{template.duration} minutes</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Questions</h3>
                <p className="text-green-600 font-bold">{questions.length} total</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Passing Score</h3>
                <p className="text-purple-600 font-bold">{template.passingScore}%</p>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => {
                  if (isMixedInterview && voiceQuestions.length > 0) {
                    setInterviewPhase('voice-interview');
                  } else {
                    setInterviewPhase('text-interview');
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg flex items-center space-x-3 mx-auto"
              >
                <Play className="w-5 h-5" />
                <span>Start Interview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (interviewPhase === 'voice-interview' && (isVoiceInterview || (isMixedInterview && voiceQuestions.length > 0))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Mic className="w-16 h-16 text-purple-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Voice Interview Phase</h2>
            <p className="text-gray-600 mb-6">
              {isMixedInterview ? `Answering ${voiceQuestions.length} voice questions` : 'AI Voice Interview'}
            </p>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-purple-800 mb-3">Voice Questions:</h3>
              <div className="space-y-2">
                {voiceQuestions.map((q, index) => (
                  <div key={index} className="text-left p-3 bg-white rounded border">
                    <span className="font-medium text-purple-700">Q{index + 1}:</span> {q.question}
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => {
                // Simulate voice interview completion
                const voiceAnswersData = voiceQuestions.map((q, index) => ({
                  question: q.question,
                  answer: `Voice answer for question ${index + 1}`,
                  type: 'voice',
                  category: q.category
                }));
                setVoiceAnswers(voiceAnswersData);
                
                if (isMixedInterview && textQuestions.length > 0) {
                  setInterviewPhase('text-interview');
                } else {
                  setInterviewPhase('completed');
                }
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Complete Voice Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (interviewPhase === 'text-interview') {
    return (
      <TimedCulturalInterview 
        questions={isMixedInterview ? textQuestions : questions}
        candidateInfo={candidateData || {
          personalInfo: { 
            name: candidateData?.skillDNA?.personalInfo?.name || candidateData?.personalInfo?.name || 'Candidate',
            profilePicture: candidateData?.skillDNA?.personalInfo?.profilePicture || candidateData?.personalInfo?.profilePicture
          },
          skillDNA: candidateData?.skillDNA,
          position: template?.name || 'Interview'
        }}
        onComplete={async (answers) => {
          console.log('📝 Text interview completed with', answers.length, 'answers');
          setTextAnswers(answers);
          
          // Combine voice and text answers for mixed interviews
          const allAnswers = isMixedInterview ? [...voiceAnswers, ...answers] : answers;
          
          // Save interview responses and evaluate
          try {
            const saveResponse = await fetch(`${API_URL}/api/candidates/${candidateId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appliedFor: template?.name,
                templateId: template?._id,
                interviewResponses: allAnswers,
                status: 'interviewed',
                $addToSet: { completedTemplates: template?._id }
              })
            });
            
            if (saveResponse.ok) {
              console.log('✅ Interview responses saved');
              
              const evalResponse = await fetch(`${API_URL}/api/analysis/evaluate-interview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  candidateId,
                  templateId: template?._id,
                  answers: allAnswers
                })
              });
              
              if (evalResponse.ok) {
                const evalResult = await evalResponse.json();
                console.log('✅ Interview evaluated, score:', evalResult.score);
              }
            }
          } catch (error) {
            console.error('Failed to save/evaluate interview:', error);
          }
          
          setInterviewPhase('completed');
          setTimeout(() => {
            navigate(`/genome/${candidateId}`);
          }, 3000);
        }}
        template={template}
      />
    );
  }

  if (interviewPhase === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Interview Completed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the {template.name} assessment.
            {isMixedInterview && ` (${voiceAnswers.length} voice + ${textAnswers.length} text answers)`}
          </p>
          
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Redirecting to results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{template.name} Assessment</h1>
            <p className="text-gray-600 text-lg">Ready to begin your timed cultural interview?</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 text-sm">
                🎯 <strong>Simple Flow:</strong> Camera & screen setup → Timed cultural questions<br/>
                ⏰ <strong>Features:</strong> Timer per question, proctoring, progress tracking
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Duration</h3>
              <p className="text-blue-600 font-bold">{template.duration} minutes</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Questions</h3>
              <p className="text-green-600 font-bold">{questions.length} total</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-xl text-center">
              <AlertCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Passing Score</h3>
              <p className="text-purple-600 font-bold">{template.passingScore}%</p>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setInterviewPhase('timed-cultural')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg flex items-center space-x-3 mx-auto"
            >
              <Play className="w-5 h-5" />
              <span>Start Cultural Interview</span>
            </button>
            <p className="text-sm text-gray-500 mt-3">
              📹 Camera setup → 🖥️ Screen sharing → 📝 Cultural questions with timer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBasedInterview;