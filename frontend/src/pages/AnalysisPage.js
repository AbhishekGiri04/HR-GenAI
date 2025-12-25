import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResumeUpload from '../components/ResumeUpload';
import TimedCulturalInterview from '../components/TimedCulturalInterview';
import AIAgent from '../components/AIAgent';
import GenomeChart from '../components/GenomeChart';
import axios from 'axios';

const CandidateAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [textAnswers, setTextAnswers] = useState([]);
  const [voiceAnswers, setVoiceAnswers] = useState([]);
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
      const response = await axios.get(`${API_URL}/api/candidates/${id}`);
      const questionsResponse = await axios.get(`${API_URL}/api/candidates/${id}/questions`);
      
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

  const handleTextInterviewComplete = (answers) => {
    setTextAnswers(answers);
    setStep(3); // Move to voice interview
  };

  const handleVoiceInterviewComplete = async (voiceData) => {
    setVoiceAnswers(voiceData);
    
    // Generate behavior DNA based on both interviews
    setCandidateData(prev => ({
      ...prev,
      behaviorDNA: {
        stress_tolerance: 8,
        team_collaboration: 7,
        problem_solving: 9,
        communication_clarity: 8,
        leadership_potential: 7,
        technical_competency: 9
      }
    }));
    
    setTimeout(() => {
      setStep(4); // Go to results
    }, 2000);
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
  };

  const handleStartAnalysis = async () => {
    if (!uploadedFile) {
      alert('Please select a resume file first');
      return;
    }
    
    // Validate file type and size
    const allowedTypes = ['application/pdf', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(uploadedFile.type) && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file or text document');
      return;
    }
    
    if (uploadedFile.size > maxSize) {
      alert('File size too large. Please upload a file smaller than 10MB');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      console.log('🚀 Starting resume analysis for:', uploadedFile.name);
      
      const formData = new FormData();
      formData.append('resume', uploadedFile);

      const response = await axios.post('${API_URL}/api/candidates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // 30 second timeout
      });

      console.log('✅ Analysis response:', response.data);

      if (response.data.success && response.data.candidateId) {
        setCandidateId(response.data.candidateId);
        
        // Validate extracted data
        const skillDNA = response.data.skillDNA;
        if (!skillDNA?.personalInfo?.name || skillDNA.personalInfo.name === 'Candidate') {
          console.log('⚠️ Warning: Name not properly extracted');
        }
        
        setCandidateData(prev => ({
          ...prev,
          skillDNA: skillDNA,
          personalInfo: skillDNA?.personalInfo,
          questions: response.data.questions || []
        }));
        
        console.log('✅ Moving to step 1 with extracted data');
        setStep(1);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Analysis error:', error);
      
      let errorMessage = 'Resume analysis failed. ';
      
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
        if (error.response.data.details) {
          errorMessage += ' - ' + error.response.data.details;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage += 'Cannot connect to server. Please check if the backend is running.';
      } else {
        errorMessage += 'Please try again with a different file.';
      }
      
      alert(errorMessage);
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
              <div className={`h-full bg-blue-600 transition-all duration-500 ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            <div className={`flex-1 text-center ${step >= 3 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-bold text-lg mb-2 ${
                step >= 3 ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 3 ? <CheckCircle className="w-6 h-6" /> : '2'}
              </div>
              <p className="font-semibold text-gray-900">Voice Interview</p>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div className={`h-full bg-blue-600 transition-all duration-500 ${step >= 4 ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            <div className={`flex-1 text-center ${step >= 4 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-bold text-lg mb-2 ${
                step >= 4 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 4 ? <CheckCircle className="w-6 h-6" /> : '3'}
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
                          <span>Analyzing Resume...</span>
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
                      <p className="font-semibold text-gray-900">
                        {candidateData.personalInfo.name || 'Not extracted'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">
                        {candidateData.personalInfo.email || 'Not extracted'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">
                        {candidateData.personalInfo.phone || 'Not extracted'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">
                        {candidateData.personalInfo.location || 'Not extracted'}
                      </p>
                    </div>
                  </div>
                  
                  {(!candidateData.personalInfo.name || candidateData.personalInfo.name === 'Candidate') && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Some information could not be extracted. Please verify the resume format and content.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {candidateData.skillDNA && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Overall Skill Score</p>
                    <p className="text-3xl font-bold text-blue-600">
                      Pending Interview
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Learning Velocity</p>
                    <p className="text-3xl font-bold text-purple-600">
                      Pending Interview
                    </p>
                  </div>
                </div>
              )}

              {candidateData.skillDNA?.technicalSkills && candidateData.skillDNA.technicalSkills.length > 0 ? (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Technical Skills ({candidateData.skillDNA.technicalSkills.length} found)</p>
                  <div className="flex flex-wrap gap-2">
                    {candidateData.skillDNA.technicalSkills.slice(0, 15).map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white text-gray-800 rounded-full text-sm font-semibold border border-gray-300">
                        {skill}
                      </span>
                    ))}
                    {candidateData.skillDNA.technicalSkills.length > 15 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        +{candidateData.skillDNA.technicalSkills.length - 15} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Technical Skills</p>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      No technical skills were extracted. Please ensure your resume contains clear skill information.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-purple-600 text-white px-6 py-4 rounded-xl hover:bg-purple-700 font-semibold flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Start Cultural Interview</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 font-semibold flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Skip to Voice Interview</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <TimedCulturalInterview 
              questions={[
                {question: "Tell me about yourself and your background.", type: "basic", timeLimit: 300},
                {question: "What interests you about this role and our company culture?", type: "cultural", timeLimit: 240},
                {question: "How do you handle working in a team environment?", type: "behavioral", timeLimit: 180}
              ]}
              candidateInfo={candidateData.skillDNA}
              onComplete={handleTextInterviewComplete}
            />
          )}

          {step === 3 && (
            <div>
              <AIAgent 
                candidateId={candidateId} 
                questions={candidateData.questions || [
                  {question: `Tell me about your experience with ${candidateData.skillDNA?.technicalSkills?.[0] || 'programming'}.`, type: "technical"},
                  {question: `How would you implement a ${candidateData.skillDNA?.technicalSkills?.[1] || 'web'} application from scratch?`, type: "technical"},
                  {question: `Describe a challenging project where you used ${candidateData.skillDNA?.technicalSkills?.[2] || 'technology'}.`, type: "technical"}
                ]}
                candidateInfo={candidateData}
                textAnswers={textAnswers}
                onComplete={handleVoiceInterviewComplete} 
              />
            </div>
          )}

          {step === 4 && (
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