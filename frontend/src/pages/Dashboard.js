import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Brain, Users, TrendingUp, Sparkles, Target, Award, Zap, Shield, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResumeUpload from '../components/ResumeUpload';
import StatsCard from '../components/StatsCard';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleFileUpload = (file) => {
    setUploadedFile(file);
  };

  const handleStartAnalysis = async () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);

      const response = await axios.post('http://localhost:5001/api/candidates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.candidateId) {
        setCandidateData({
          candidateId: response.data.candidateId,
          skillDNA: response.data.skillDNA,
          personalInfo: response.data.personalInfo,
          questions: response.data.questions || []
        });
        setShowResults(true);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                  <Sparkles className="w-4 h-4 text-yellow-300 mr-2" />
                  <span className="text-white text-sm font-semibold">AI-Powered Intelligence</span>
                </div>
                <h1 className="text-5xl font-black text-white mb-4 leading-tight">
                  Transform Hiring with
                  <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                    Digital DNA Profiling
                  </span>
                </h1>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Go beyond resumes. Measure human potential through behavioral analysis, 
                  emotional intelligence, and predictive performance scoring.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">95%</p>
                      <p className="text-sm text-blue-100">AI Accuracy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">3 sec</p>
                      <p className="text-sm text-blue-100">Analysis Time</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">100%</p>
                      <p className="text-sm text-blue-100">Bias-Free</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-30"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                        <Brain className="w-8 h-8 text-yellow-300 mb-3" />
                        <p className="text-white font-bold text-lg">AI Analysis</p>
                        <p className="text-blue-100 text-sm">Deep Learning</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                        <Target className="w-8 h-8 text-green-300 mb-3" />
                        <p className="text-white font-bold text-lg">Predictive</p>
                        <p className="text-blue-100 text-sm">94% Accurate</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                        <Shield className="w-8 h-8 text-pink-300 mb-3" />
                        <p className="text-white font-bold text-lg">Bias-Free</p>
                        <p className="text-blue-100 text-sm">Fair Hiring</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                        <Clock className="w-8 h-8 text-orange-300 mb-3" />
                        <p className="text-white font-bold text-lg">Real-time</p>
                        <p className="text-blue-100 text-sm">Instant Results</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard
              icon={<Users className="w-8 h-8 text-blue-600" />}
              title="Candidates Analyzed"
              value="1,247"
              change="+12%"
            />
            <StatsCard
              icon={<Brain className="w-8 h-8 text-green-600" />}
              title="AI Interviews"
              value="892"
              change="+8%"
            />
            <StatsCard
              icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
              title="Success Rate"
              value="94.2%"
              change="+5%"
            />
            <StatsCard
              icon={<Award className="w-8 h-8 text-orange-600" />}
              title="Active Profiles"
              value="156"
              change="+18%"
            />
          </div>

          {/* Main Upload Section */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 mb-12">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl mr-5 shadow-lg">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Start Candidate Analysis</h2>
                <p className="text-gray-600 text-lg">Upload resume to begin AI-powered DNA profiling</p>
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
                    <h3 className="text-2xl font-bold text-gray-900">Resume Analysis Complete</h3>
                    <p className="text-gray-600">Profile extracted successfully</p>
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
                  <div>
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
                  onClick={() => navigate('/analysis', { state: { candidateId: candidateData.candidateId } })}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Start Interview Process</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI-Powered Analysis</h3>
              <p className="text-blue-100 leading-relaxed">
                Advanced GPT-4 algorithms analyze candidate potential beyond traditional resumes
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Predictive Scoring</h3>
              <p className="text-purple-100 leading-relaxed">
                94% accurate performance and retention predictions using machine learning
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Bias-Free Hiring</h3>
              <p className="text-emerald-100 leading-relaxed">
                100% objective assessment removing unconscious bias from hiring decisions
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;