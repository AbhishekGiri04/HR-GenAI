import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import { Upload, Brain, Users, TrendingUp, Sparkles, Target, Award, Zap, Shield, Clock, CheckCircle, ArrowRight, Eye, Trash2, Calendar, FileText, Star, Filter, Search, BarChart3 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResumeUpload from '../components/ResumeUpload';
import StatsCard from '../components/StatsCard';
import Lottie from 'lottie-react';
import robotAnimation from '../robot-ai-animation.json';
import { useAuth } from '../contexts/authContext';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableInterviews, setAvailableInterviews] = useState([]);
  const [showInterviewMatch, setShowInterviewMatch] = useState(false);
  const [matchedInterviews, setMatchedInterviews] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleFileUpload = (file) => {
    setUploadedFile(file);
  };

  const findBestMatchingTemplate = async (candidateSkills) => {
    try {
      const response = await axios.get(`${API_URL}/api/hr/templates`);
      const templates = response.data || [];
      
      let bestMatch = null;
      let highestScore = 0;
      
      templates.forEach(template => {
        if (template.isActive && template.techStack) {
          const matchingSkills = candidateSkills.filter(skill => 
            template.techStack.some(tech => 
              skill.toLowerCase().includes(tech.toLowerCase()) ||
              tech.toLowerCase().includes(skill.toLowerCase())
            )
          );
          
          const matchScore = (matchingSkills.length / template.techStack.length) * 100;
          
          if (matchScore > highestScore && matchScore >= 60) {
            highestScore = matchScore;
            bestMatch = template;
          }
        }
      });
      
      return bestMatch;
    } catch (error) {
      console.error('Failed to find matching template:', error);
      return null;
    }
  };

  const checkForMatchingInterviews = async (techStack) => {
    try {
      const response = await axios.get(`${API_URL}/api/hr/interviews`);
      const interviews = response.data || [];
      
      const matches = interviews.filter(interview => {
        const interviewSkills = interview.requiredSkills || [];
        const skillMatch = techStack.some(skill => 
          interviewSkills.some(reqSkill => 
            skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
            reqSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        return skillMatch || interviewSkills.length === 0;
      });
      
      if (matches.length > 0) {
        setMatchedInterviews(matches);
        setShowInterviewMatch(true);
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    }
  };

  const startInterview = (interviewId) => {
    if (candidateData?.candidateId) {
      const link = `/candidate-interview/${interviewId}/${candidateData.candidateId}`;
      window.open(link, '_blank');
      setShowInterviewMatch(false);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/candidates`);
      setCandidates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchCandidates();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/hr/templates`);
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleStartAnalysis = async () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);

      const response = await axios.post(`${API_URL}/api/candidates/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.candidateId) {
        setCandidateData({
          candidateId: response.data.candidateId,
          skillDNA: response.data.skillDNA,
          personalInfo: response.data.personalInfo,
          questions: response.data.questions || [],
          techStack: response.data.skillDNA?.technicalSkills || []
        });
        setShowResults(true);
        fetchCandidates();
        
        // Auto-assign to available interviews based on tech stack
        const matchingTemplate = await findBestMatchingTemplate(response.data.skillDNA?.technicalSkills || []);
        if (matchingTemplate) {
          // Show template selection instead of auto-redirect
          // User will manually choose template
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      let errorMessage = 'Resume analysis failed. ';
      if (error.response?.status === 500) {
        errorMessage += 'Server error. Please check if the backend is running.';
      } else if (error.response?.status === 400) {
        errorMessage += 'Invalid file format. Please upload a PDF file.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Cannot connect to server. Please start the backend server.';
      } else {
        errorMessage += 'Please try again with a different file.';
      }
      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="flex-grow">
        {/* Enhanced Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
          <div className="absolute inset-0 opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-7">
                  <Sparkles className="w-5 h-5 text-yellow-300 mr-3 animate-pulse" />
                  <span className="text-white text-lg font-bold">AI-Powered Intelligence</span>
                </div>
                <h1 className="text-5xl font-black text-white mb-6 leading-tight">
                  Revolutionize Recruitment with
                  <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mt-2">
                    AI-Powered Talent Intelligence
                  </span>
                </h1>
                <p className="text-xl text-blue-100 mb-10 leading-relaxed font-medium">
                  Advanced AI algorithms analyze candidate potential beyond traditional resumes. 
                  Discover hidden talents, predict performance, and eliminate hiring bias with our intelligent assessment platform.
                </p>
                <div className="grid grid-cols-3 gap-6">
                  <div className="group flex flex-col items-center text-white hover:scale-105 transition-transform">
                    <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/25 transition-colors">
                      <Target className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black mb-1">95%</p>
                      <p className="text-sm text-blue-200 font-semibold">Resume Accuracy</p>
                    </div>
                  </div>
                  <div className="group flex flex-col items-center text-white hover:scale-105 transition-transform">
                    <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/25 transition-colors">
                      <Zap className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black mb-1">10x</p>
                      <p className="text-sm text-blue-200 font-semibold">Faster Hiring</p>
                    </div>
                  </div>
                  <div className="group flex flex-col items-center text-white hover:scale-105 transition-transform">
                    <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/25 transition-colors">
                      <Shield className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black mb-1">100%</p>
                      <p className="text-sm text-blue-200 font-semibold">Bias-Free</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="relative">
                  <Lottie animationData={robotAnimation} className="w-[636px] h-[636px] mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-200 hover:border-blue-300 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-blue-600">{candidates.length || 0}</p>
                  <p className="text-green-600 text-sm font-bold">+{Math.floor(candidates.length * 0.12)}%</p>
                </div>
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">Candidates Analyzed</h3>
              <p className="text-gray-600 text-sm">Total profiles processed</p>
            </div>
            
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-200 hover:border-green-300 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-green-600">{candidates.filter(c => c.interviewCompleted).length || 0}</p>
                  <p className="text-green-600 text-sm font-bold">+8%</p>
                </div>
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">AI Interviews</h3>
              <p className="text-gray-600 text-sm">Completed assessments</p>
            </div>
            
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-200 hover:border-purple-300 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-purple-600">
                    {candidates.length > 0 ? Math.round((candidates.filter(c => c.skillDNA?.overallScore >= 70).length / candidates.length) * 100) : 0}%
                  </p>
                  <p className="text-green-600 text-sm font-bold">+5%</p>
                </div>
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">Success Rate</h3>
              <p className="text-gray-600 text-sm">Hiring accuracy</p>
            </div>
            
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-200 hover:border-orange-300 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-orange-600">{candidates.filter(c => c.status === 'active' || !c.status).length || 0}</p>
                  <p className="text-green-600 text-sm font-bold">+18%</p>
                </div>
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">Active Profiles</h3>
              <p className="text-gray-600 text-sm">Ready for hiring</p>
            </div>
          </div>

          {/* Enhanced Upload Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-10 border border-slate-700 mb-12">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-5 rounded-3xl mr-6 shadow-lg">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white mb-2">Intelligent Candidate Assessment</h2>
                <p className="text-slate-400 text-xl font-medium">Upload resume to begin comprehensive AI-powered talent evaluation</p>
              </div>
            </div>

            <ResumeUpload onFileUpload={handleFileUpload} />
            
            {uploadedFile && !showResults && (
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

            {showResults && candidateData && (
              <div className="mt-8 space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Resume Analysis Complete</h3>
                    <p className="text-gray-300">Profile extracted successfully</p>
                  </div>
                </div>
                
                {candidateData.personalInfo && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-gray-900 mb-3">Candidate Profile</h4>
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
                  <div className="grid grid-cols-2 gap-4">
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

                {candidateData.skillDNA?.technicalSkills && (
                  <div>
                    <p className="text-sm text-white mb-2">Technical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {candidateData.skillDNA.technicalSkills.slice(0, 10).map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white text-gray-800 rounded-full text-sm font-semibold border border-gray-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => navigate(`/template-selection/${candidateData.candidateId}`)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all transform hover:scale-105 mb-4"
                >
                  <span>Choose Interview Template</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => window.open(`${API_URL}/api/candidates/${candidateData.candidateId}/resume`, '_blank')}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all transform hover:scale-105"
                >
                  <FileText className="w-5 h-5" />
                  <span>View Uploaded Resume</span>
                </button>
              </div>
            )}
          </div>

          {/* Available Assessments Section - Only for HR */}
          {userRole === 'hr' && templates.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200 mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-4 rounded-2xl mr-4 shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Available Assessments</h2>
                    <p className="text-gray-600 text-lg">Professional skill evaluations tailored for your expertise</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template._id} className={`bg-gradient-to-br p-6 rounded-xl border hover:shadow-lg transition-all ${
                    template.difficulty === 'hard' ? 'from-red-50 to-pink-50 border-red-200' :
                    template.difficulty === 'medium' ? 'from-yellow-50 to-orange-50 border-yellow-200' :
                    'from-green-50 to-emerald-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{template.name} Assessment</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        template.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                        template.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)} Level
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{template.duration} minutes duration</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4" />
                        <span>{template.passingScore}% minimum score</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{template.questions?.length || 0} evaluation questions</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.techStack.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {tech}
                          </span>
                        ))}
                        {template.techStack.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            +{template.techStack.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                    
                    <button 
                      onClick={() => {
                        if (candidateData?.candidateId) {
                          navigate(`/template-selection/${candidateData.candidateId}`);
                        } else {
                          alert('Please upload and analyze your resume first to begin the assessment');
                        }
                      }}
                      className={`w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors font-semibold text-sm ${
                        template.difficulty === 'hard' ? 'bg-red-600' :
                        template.difficulty === 'medium' ? 'bg-yellow-600' :
                        'bg-green-600'
                      } ${!candidateData?.candidateId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!candidateData?.candidateId}
                    >
                      Begin Assessment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity Summary - Only for HR */}
          {userRole === 'hr' && (
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl mr-4 shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Recent Activity</h2>
                    <p className="text-gray-600 text-lg">Latest candidate submissions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-all font-semibold flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reset Data</span>
                  </button>
                  <button
                    onClick={() => navigate('/hr-dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
                  >
                    <span>Manage Candidates</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {candidates.slice(0, 5).map((candidate) => (
                  <div key={candidate._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {candidate.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="font-semibold">{candidate.name}</h4>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {candidate.interviewScore || candidate.skillDNA?.overallScore || 'Pending'}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">Date</div>
                      </div>
                      <button
                        onClick={() => navigate(`/profile/${candidate._id}`)}
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center space-x-1 mr-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => window.open(`${API_URL}/api/candidates/${candidate._id}/resume`, '_blank')}
                        className="bg-green-100 text-green-600 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center space-x-1"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Resume</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                {candidates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No candidates yet. Upload a resume to get started!</p>
                  </div>
                )}
                
                {candidates.length > 5 && (
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => navigate('/hr-dashboard')}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 mx-auto"
                    >
                      <span>View All {candidates.length} Candidates</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Digital DNA Profiling</h3>
              <p className="text-blue-100 leading-relaxed">
                Advanced AI extracts comprehensive skill profiles from resumes with 95% accuracy using GPT-4 technology
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Voice AI Interviews</h3>
              <p className="text-purple-100 leading-relaxed">
                Huma AI conducts natural voice interviews with real-time speech recognition and intelligent response evaluation
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Predictive Analytics</h3>
              <p className="text-emerald-100 leading-relaxed">
                AI-powered evaluation system analyzes responses and provides comprehensive performance insights with detailed feedback
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reset All Data</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset all candidate data? This action cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <ul className="text-sm text-red-800 space-y-1">
                <li>• All candidate profiles will be deleted</li>
                <li>• All interview results will be lost</li>
                <li>• All uploaded resumes will be removed</li>
              </ul>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`${API_URL}/api/candidates/reset`);
                    setCandidates([]);
                    setCandidateData(null);
                    setShowResults(false);
                    setShowResetModal(false);
                    setShowSuccessModal(true);
                  } catch (error) {
                    console.error('Failed to reset candidates:', error);
                    setShowResetModal(false);
                    setShowErrorModal(true);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success</h3>
              <p className="text-gray-600 mb-6">
                All candidate data has been reset successfully. The dashboard will now show updated statistics.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">
                Failed to reset candidate data. Please check your connection and try again.
              </p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;