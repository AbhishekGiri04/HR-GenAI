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
  const { template: locationTemplate, questions: locationQuestions, aiGenerated } = location.state || {};
  
  const [interviewPhase, setInterviewPhase] = useState('loading');
  const [candidateData, setCandidateData] = useState(null);
  const [template, setTemplate] = useState(locationTemplate);
  const [questions, setQuestions] = useState(locationQuestions);
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
    const fetchData = async () => {
      try {
        // Fetch candidate data
        const candidateResponse = await fetch(`${API_URL}/api/candidates/${candidateId}`);
        if (candidateResponse.ok) {
          const candidate = await candidateResponse.json();
          setCandidateData(candidate);
          
          // If no template from location, fetch deployed templates
          if (!template) {
            const templatesResponse = await fetch(`${API_URL}/api/hr/templates/deployed/public?candidateId=${candidateId}`);
            if (templatesResponse.ok) {
              const templates = await templatesResponse.json();
              if (templates.length > 0) {
                const selectedTemplate = templates[0];
                setTemplate(selectedTemplate);
                
                // Generate questions
                const questionsResponse = await fetch(`${API_URL}/api/interview/generate-questions/${candidateId}/${selectedTemplate._id}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                
                if (questionsResponse.ok) {
                  const data = await questionsResponse.json();
                  setQuestions(data.questions);
                  setInterviewPhase('assessment');
                }
              }
            }
          } else {
            setInterviewPhase('assessment');
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [candidateId, template]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate data...</p>
        </div>
      </div>
    );
  }

  if (interviewPhase === 'assessment') {
    return (
      <div className="min-h-screen relative">
        {/* Background Image */}
        <div className="fixed inset-0 z-0">
          <img 
            src="https://strobeleducation.com/wp-content/uploads/2023/05/blog50_featimg.png" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/70 to-indigo-900/70"></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{template?.name || 'Interview Assessment'}</h1>
                  <p className="text-blue-100">Welcome, {candidateData?.name || 'Candidate'}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <Clock className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Assessment Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 p-2 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Questions</p>
                        <p className="text-2xl font-bold text-gray-800">{questions?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-2xl font-bold text-gray-800">{template?.duration || 30} min</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-600 p-2 rounded-lg">
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Interview Type</p>
                        <p className="text-lg font-bold text-gray-800 capitalize">{template?.interviewType || 'Mixed'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
                  Important Instructions
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Ensure you have a stable internet connection throughout the interview</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Find a quiet environment with minimal background noise</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Allow microphone and camera access when prompted</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Answer all questions honestly and to the best of your ability</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>You cannot pause or restart once the interview begins</span>
                  </li>
                </ul>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={() => setInterviewPhase('setup')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto"
                >
                  <Play className="w-6 h-6" />
                  <span>Start Assessment</span>
                </button>
                <p className="text-sm text-gray-500 mt-4">Click the button above when you're ready to begin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (interviewPhase === 'setup') {
    return (
      <TimedCulturalInterview 
        questions={questions}
        candidateInfo={candidateData || {
          personalInfo: { 
            name: candidateData?.skillDNA?.personalInfo?.name || candidateData?.personalInfo?.name || 'Candidate',
            profilePicture: candidateData?.skillDNA?.personalInfo?.profilePicture || candidateData?.personalInfo?.profilePicture
          },
          skillDNA: candidateData?.skillDNA,
          position: template?.name || 'Interview'
        }}
        onComplete={async (answers) => {
          console.log('📝 Interview completed with', answers.length, 'answers');
          
          try {
            const saveResponse = await fetch(`${API_URL}/api/candidates/${candidateId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appliedFor: template?.name,
                templateId: template?._id,
                interviewResponses: answers,
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
                  answers
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
          
          navigate(`/genome/${candidateId}`);
        }}
        template={template}
      />
    );
  }

  return null;
};

export default TemplateBasedInterview;