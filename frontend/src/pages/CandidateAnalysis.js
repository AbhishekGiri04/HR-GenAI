import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResumeUpload from '../components/ResumeUpload';
import EnhancedAIAgent from '../components/EnhancedAIAgent';
import TextInterview from '../components/TextInterview';
import GenomeChart from '../components/GenomeChart';
import axios from 'axios';

const CandidateAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [textAnswers, setTextAnswers] = useState([]);
  const [candidateId, setCandidateId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [candidateData, setCandidateData] = useState({
    skillDNA: null,
    behaviorDNA: null,
    personalInfo: null,
    questions: []
  });

  useEffect(() => {
    if (location.state?.candidateId) {
      setCandidateId(location.state.candidateId);
      fetchSkillDNA(location.state.candidateId);
    }
  }, [location]);

  const fetchSkillDNA = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/candidates/${id}`);
      const questionsResponse = await axios.get(`http://localhost:5001/api/candidates/${id}/questions`);
      
      setCandidateData(prev => ({
        ...prev,
        skillDNA: response.data.skillDNA,
        personalInfo: response.data.skillDNA?.personalInfo,
        questions: questionsResponse.data.questions || []
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInterviewComplete = async () => {
    setCandidateData(prev => ({
      ...prev,
      behaviorDNA: {
        stress_tolerance: 8,
        team_collaboration: 7,
        problem_solving: 9,
        communication_clarity: 8,
        leadership_potential: 7
      }
    }));
    setTimeout(() => {
      // Always go to step 3 (results) instead of trying to find profile
      setStep(3);
    }, 2000);
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
  };

  const handleStartAnalysis = async () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);
      formData.append('name', 'Candidate');
      formData.append('email', 'candidate@example.com');

      const response = await axios.post('http://localhost:5001/api/candidates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.candidateId) {
        setCandidateId(response.data.candidateId);
        // Use the extracted data directly from the response
        setCandidateData(prev => ({
          ...prev,
          skillDNA: response.data.skillDNA,
          personalInfo: response.data.personalInfo,
          questions: response.data.questions || []
        }));
        setStep(1); // Move to step 1 to show extracted data
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Resume analysis failed. Please try again with a different file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCompleteAnalysis = () => {
    if (candidateId) {
      navigate(`/profile/${candidateId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Sparkles className="w-8 h-8 mr-3 text-blue-600" />
              Candidate Analysis Pipeline
            </h1>
            <p className="text-gray-600">AI-powered comprehensive candidate evaluation</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className={`flex-1 text-center ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-bold text-lg mb-2 ${
                step >= 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <p className="font-semibold text-gray-900">Resume Analysis</p>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div className={`h-full bg-blue-600 transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            <div className={`flex-1 text-center ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-bold text-lg mb-2 ${
                step >= 2 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
              </div>
              <p className="font-semibold text-gray-900">AI Interview</p>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div className={`h-full bg-blue-600 transition-all duration-500 ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            <div className={`flex-1 text-center ${step >= 3 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-bold text-lg mb-2 ${
                step >= 3 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 3 ? <CheckCircle className="w-6 h-6" /> : '3'}
              </div>
              <p className="font-semibold text-gray-900">Genome Profile</p>
            </div>
          </div>

          {/* Step Content */}
          {!candidateId ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl mr-5 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Upload Resume to Start</h2>
                  <p className="text-gray-600 text-lg">Upload your resume to begin the AI-powered interview process</p>
                </div>
              </div>
              
              <ResumeUpload onFileUpload={handleFileUpload} />
              
              {uploadedFile && (
                <div className="mt-8 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-3 mr-4 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-emerald-900 font-bold text-lg">Resume Uploaded Successfully!</p>
                        <p className="text-emerald-700 text-sm font-medium">{uploadedFile.name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleStartAnalysis}
                      disabled={isAnalyzing}
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center space-x-3 shadow-xl"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          <span>Start AI Analysis</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : step === 1 && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Resume Analysis Complete</h2>
                  <p className="text-gray-600">Profile extracted successfully</p>
                </div>
              </div>
              
              {candidateData.personalInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6 border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3">Candidate Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">{candidateData.personalInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{candidateData.personalInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{candidateData.personalInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">{candidateData.personalInfo.location}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {candidateData.skillDNA && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Overall Skill Score</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {candidateData.skillDNA.overallScore || 0}/100
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Learning Velocity</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {candidateData.skillDNA.learningVelocity || 0}/10
                    </p>
                  </div>
                </div>
              )}

              {candidateData.skillDNA?.technicalSkills && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidateData.skillDNA.technicalSkills.slice(0, 10).map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Start Text Interview</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <TextInterview 
                questions={[
                  {question: "Tell me about yourself and your background.", type: "basic"},
                  {question: "What interests you about our company culture?", type: "cultural"}
                ]}
                candidateInfo={candidateData.skillDNA}
                onComplete={(answers) => {
                  setTextAnswers(answers);
                  setStep(2.5); // Move to voice setup
                }}
              />
            </div>
          )}

          {step === 2.5 && (
            <div>
              <EnhancedAIAgent 
                candidateId={candidateId} 
                questions={[
                  {question: "Explain the most complex technical problem you've solved.", type: "technical"},
                  {question: "How do you handle tight deadlines and pressure situations?", type: "stress"},
                  {question: "Describe a time when you had to learn a new technology quickly.", type: "technical"}
                ]}
                candidateInfo={candidateData.skillDNA}
                textAnswers={textAnswers}
                onComplete={handleInterviewComplete} 
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <GenomeChart 
                skillDNA={candidateData.skillDNA}
                behaviorDNA={candidateData.behaviorDNA}
              />
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Final Genome Score</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-4xl font-bold text-blue-600">87</p>
                    <p className="text-sm text-gray-600 mt-2">Clean Talent Score</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-4xl font-bold text-green-600">94%</p>
                    <p className="text-sm text-gray-600 mt-2">Growth Likelihood</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="text-4xl font-bold text-purple-600">91%</p>
                    <p className="text-sm text-gray-600 mt-2">Retention Prediction</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Recommended Roles:</h4>
                  <div className="flex gap-2">
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">Senior Developer</span>
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">Team Lead</span>
                  </div>
                </div>

                <button
                  onClick={handleCompleteAnalysis}
                  className="w-full bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 font-semibold flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>View Complete Profile</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateAnalysis;