import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import InterviewBot from '../components/InterviewBot';
import GenomeChart from '../components/GenomeChart';
import axios from 'axios';

const CandidateAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [candidateId, setCandidateId] = useState(null);
  const [candidateData, setCandidateData] = useState({
    skillDNA: null,
    behaviorDNA: null
  });

  useEffect(() => {
    if (location.state?.candidateId) {
      setCandidateId(location.state.candidateId);
      fetchSkillDNA(location.state.candidateId);
    }
  }, [location]);

  const fetchSkillDNA = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/candidates/${id}`);
      setCandidateData(prev => ({
        ...prev,
        skillDNA: response.data.skillDNA
      }));
    } catch (error) {
      console.error('Error fetching skill DNA:', error);
    }
  };

  const handleInterviewComplete = async () => {
    setStep(3);
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
  };

  const handleCompleteAnalysis = () => {
    if (candidateId) {
      navigate(`/profile/${candidateId}`);
    } else {
      navigate('/dashboard');
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
          {step === 1 && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Resume Analysis Complete</h2>
                  <p className="text-gray-600">Skill DNA has been extracted successfully</p>
                </div>
              </div>
              
              {candidateData.skillDNA && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Overall Skill Score</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {candidateData.skillDNA.overall_skill_score || 0}/100
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Learning Velocity</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {candidateData.skillDNA.learning_velocity || 0}/10
                    </p>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Start AI Interview</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <InterviewBot candidateId={candidateId} onComplete={handleInterviewComplete} />
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