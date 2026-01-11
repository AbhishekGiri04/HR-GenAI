import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Mic, Play } from 'lucide-react';
import Header from '../components/Header';
import TimedCulturalInterview from '../components/TimedCulturalInterview';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const candidateResponse = await fetch(`${API_URL}/api/candidates/${candidateId}`);
        if (candidateResponse.ok) {
          const candidate = await candidateResponse.json();
          setCandidateData(candidate);
          
          // Only fetch templates if no template was passed from location state
          if (!locationTemplate) {
            const templatesResponse = await fetch(`${API_URL}/api/hr/templates/deployed/public?candidateId=${candidateId}`);
            if (templatesResponse.ok) {
              const templates = await templatesResponse.json();
              console.log('Fetched templates:', templates.length);
              if (templates.length > 0) {
                setInterviewPhase('template-selection');
                setTemplate(templates);
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
  }, [candidateId]);

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

  if (interviewPhase === 'template-selection') {
    const templates = Array.isArray(template) ? template : [template];
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <img 
            src="https://png.pngtree.com/thumb_back/fh260/background/20220824/pngtree-freelance-writer-enjoys-coffee-break-at-tidy-desk-photo-image_38868896.jpg" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black text-white mb-4 drop-shadow-lg">Select Your Interview Template</h1>
              <p className="text-blue-100 text-xl font-medium drop-shadow">Choose the assessment that best matches your skills</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templates.map((tmpl, index) => {
                const colors = [
                  { from: 'from-blue-500', to: 'to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
                  { from: 'from-purple-500', to: 'to-pink-500', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
                  { from: 'from-green-500', to: 'to-emerald-500', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
                  { from: 'from-orange-500', to: 'to-red-500', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
                  { from: 'from-indigo-500', to: 'to-blue-500', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
                  { from: 'from-pink-500', to: 'to-rose-500', bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' }
                ];
                const color = colors[index % colors.length];
                
                return (
                  <div key={tmpl._id} className="group bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-white/50 hover:scale-105 hover:shadow-3xl transition-all duration-300">
                    <div className={`bg-gradient-to-r ${color.from} ${color.to} p-8 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-3xl font-black">{tmpl.name}</h3>
                          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-sm font-bold">#{index + 1}</span>
                          </div>
                        </div>
                        <p className="text-white/90 text-sm font-medium">{tmpl.description || 'Professional Assessment'}</p>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4 mb-6">
                        <div className={`${color.bg} ${color.border} border-2 p-4 rounded-xl`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`bg-gradient-to-r ${color.from} ${color.to} p-2 rounded-lg`}>
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-gray-700 font-semibold">Questions</span>
                            </div>
                            <span className={`${color.text} font-black text-2xl`}>{tmpl.questions?.length || 0}</span>
                          </div>
                        </div>
                        
                        <div className={`${color.bg} ${color.border} border-2 p-4 rounded-xl`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`bg-gradient-to-r ${color.from} ${color.to} p-2 rounded-lg`}>
                                <Clock className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-gray-700 font-semibold">Duration</span>
                            </div>
                            <span className={`${color.text} font-black text-2xl`}>{tmpl.duration || 30} min</span>
                          </div>
                        </div>
                        
                        <div className={`${color.bg} ${color.border} border-2 p-4 rounded-xl`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`bg-gradient-to-r ${color.from} ${color.to} p-2 rounded-lg`}>
                                <Mic className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-gray-700 font-semibold">Type</span>
                            </div>
                            <span className={`${color.text} font-black text-lg capitalize`}>{tmpl.interviewType || 'Mixed'}</span>
                          </div>
                        </div>
                        
                        <div className={`${color.bg} ${color.border} border-2 p-4 rounded-xl`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`bg-gradient-to-r ${color.from} ${color.to} p-2 rounded-lg`}>
                                <AlertCircle className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-gray-700 font-semibold">Passing Score</span>
                            </div>
                            <span className={`${color.text} font-black text-2xl`}>{tmpl.passingScore || 70}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={async () => {
                          setTemplate(tmpl);
                          const questionsResponse = await fetch(`${API_URL}/api/interview/generate-questions/${candidateId}/${tmpl._id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                          });
                          
                          if (questionsResponse.ok) {
                            const data = await questionsResponse.json();
                            setQuestions(data.questions);
                            setInterviewPhase('assessment');
                          }
                        }}
                        className={`w-full bg-gradient-to-r ${color.from} ${color.to} hover:shadow-2xl text-white py-4 rounded-2xl font-black text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2`}
                      >
                        <Play className="w-6 h-6" />
                        <span>Select Template</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (interviewPhase === 'assessment') {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <img 
            src="https://st3.depositphotos.com/7865540/12758/i/450/depositphotos_127583080-stock-photo-business-assessment-concept.jpg" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-indigo-900/30"></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
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

                <div className="text-center">
                  <button
                    onClick={() => setInterviewPhase('setup')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto"
                  >
                    <Play className="w-6 h-6" />
                    <span>Start Assessment</span>
                  </button>
                  <p className="text-sm text-gray-500 mt-4">Click the button above when you are ready to begin</p>
                </div>
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
                console.log('Interview evaluated, score:', evalResult.score);
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