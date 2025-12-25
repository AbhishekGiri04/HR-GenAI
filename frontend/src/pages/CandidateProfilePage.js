import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Award, TrendingUp, Target, Sparkles, ArrowLeft, Star, Zap, Shield, Users, CheckCircle, AlertTriangle, Activity, BarChart3, Mic, Camera, Monitor, Eye, FileText } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GenomeChart from '../components/GenomeChart';
import axios from 'axios';

const CandidateProfilePage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  useEffect(() => {
    if (candidate) {
      document.title = `${candidate.name} - Candidate Profile | HR-GenAI`;
    }
    return () => {
      document.title = 'HR-GenAI | AI-Powered Hiring Intelligence Platform';
    };
  }, [candidate]);

  const fetchCandidate = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/candidates/${candidateId}`);
      setCandidate(response.data);
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Candidate not found</p>
          <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const cleanTalentScore = candidate.hiringProbability?.score || 87;
  const growthLikelihood = candidate.hiringProbability?.predictions?.willStay6Months || 94;
  const retentionPrediction = 100 - (candidate.hiringProbability?.predictions?.burnoutRisk || 9);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: 'url(https://i.etsystatic.com/43362815/r/il/55d8b4/5172417159/il_570xN.5172417159_2rji.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/96 via-blue-900/96 to-indigo-900/96"></div>
      </div>
      <div className="relative z-10">
        <Header />
      </div>
      
      <main className="flex-grow relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-blue-200 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Dashboard</span>
          </button>

          {/* Enhanced Hero Profile Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl border border-white/20">
            <div className="absolute inset-0 opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>
            
            <div className="relative flex flex-col lg:flex-row items-center justify-between">
              <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-40 h-40 rounded-full bg-white/10 backdrop-blur-lg border-4 border-white/20 shadow-2xl group-hover:scale-105 transition-transform overflow-hidden">
                    {candidate.photoURL || candidate.profileImage ? (
                      <img 
                        src={candidate.photoURL || candidate.profileImage} 
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=4F46E5&color=fff&size=200`;
                        }}
                      />
                    ) : (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=4F46E5&color=fff&size=200`}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white animate-bounce" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="text-white text-center lg:text-left">
                  <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
                    <Activity className="w-4 h-4 text-green-300 mr-2" />
                    <span className="text-sm font-semibold text-green-300">AI Analyzed Profile</span>
                  </div>
                  <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {candidate.name}
                  </h1>
                  <p className="text-blue-100 text-xl mb-4 font-medium">{candidate.email}</p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    <span className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/20">
                      📞 {candidate.phone || 'No phone'}
                    </span>
                    <span className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/20">
                      📍 {candidate.location || 'No location'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center shadow-2xl">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="w-6 h-6 text-yellow-300 mr-2" />
                    <span className="text-white/80 text-sm font-semibold">AI Talent Score</span>
                  </div>
                  <div className="relative">
                    <div className="text-7xl font-black text-white mb-2">{cleanTalentScore}</div>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
                  </div>
                  <p className="text-white/70 text-sm font-medium">out of 100</p>
                  <div className="mt-4 flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(cleanTalentScore/20) ? 'text-yellow-400 fill-current' : 'text-white/30'}`} />
                    ))}
                  </div>
                  <button
                    onClick={() => window.open(`http://localhost:5001/api/candidates/${candidateId}/resume`, '_blank')}
                    className="mt-6 w-full bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-semibold flex items-center justify-center space-x-2 border border-white/30"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Resume</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Interview Summary */}
          {candidate.interviewSummary && candidate.interviewSummary.summary ? (
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl mr-4">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">AI Interview Analysis</h2>
                </div>
                <span className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-lg ${
                  candidate.interviewSummary.verdict === 'Strong Hire' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                  candidate.interviewSummary.verdict === 'Hire' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' :
                  candidate.interviewSummary.verdict === 'Maybe' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' :
                  'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                }`}>
                  {candidate.interviewSummary.verdict}
                </span>
              </div>
              <p className="text-slate-300 text-lg mb-6 leading-relaxed">{candidate.interviewSummary.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                    <h4 className="font-bold text-green-400 text-lg">Key Strengths</h4>
                  </div>
                  <ul className="space-y-2">
                    {candidate.interviewSummary.strengths && candidate.interviewSummary.strengths.length > 0 ? (
                      candidate.interviewSummary.strengths.map((s, i) => (
                        <li key={i} className="text-green-100 flex items-start">
                          <span className="text-green-400 mr-2">•</span>
                          <span>{s}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-green-100/60 text-sm italic">Interview pending - strengths will appear after completion</li>
                    )}
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-orange-400 mr-3" />
                    <h4 className="font-bold text-orange-400 text-lg">Areas for Growth</h4>
                  </div>
                  <ul className="space-y-2">
                    {candidate.interviewSummary.weaknesses && candidate.interviewSummary.weaknesses.length > 0 ? (
                      candidate.interviewSummary.weaknesses.map((w, i) => (
                        <li key={i} className="text-orange-100 flex items-start">
                          <span className="text-orange-400 mr-2">•</span>
                          <span>{w}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-orange-100/60 text-sm italic">Interview pending - areas for growth will appear after completion</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {/* Enhanced Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-green-500/30 hover:border-green-400/60 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-green-400">{growthLikelihood}%</span>
                  <div className="flex justify-end mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(growthLikelihood/20) ? 'text-green-400 fill-current' : 'text-slate-600'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Growth Potential</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Predicted performance improvement and learning velocity over 12 months</p>
            </div>

            <div className="group bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-purple-500/30 hover:border-purple-400/60 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-purple-400">{retentionPrediction}%</span>
                  <div className="flex justify-end mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(retentionPrediction/20) ? 'text-purple-400 fill-current' : 'text-slate-600'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Retention Score</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Likelihood to stay committed and engaged for 2+ years</p>
            </div>

            <div className="group bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-500/30 hover:border-orange-400/60 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-orange-400">{candidate.skillDNA?.overallScore || 85}</span>
                  <div className="flex justify-end mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor((candidate.skillDNA?.overallScore || 85)/20) ? 'text-orange-400 fill-current' : 'text-slate-600'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Skill Mastery</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Combined technical expertise and soft skills assessment</p>
            </div>
          </div>

          {/* Enhanced Personality & EQ Analysis */}
          {(candidate.personality?.mbti || candidate.eqAnalysis?.overallEQ) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {candidate.personality?.mbti ? (
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-purple-500/30">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-2xl mr-4">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Personality DNA</h3>
                  </div>
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-purple-500/30 to-indigo-500/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/40">
                    <span className="text-5xl font-black text-purple-300">{candidate.personality.mbti || 'N/A'}</span>
                    <p className="text-purple-200 text-sm mt-2 font-semibold">Myers-Briggs Personality Type</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Leadership', value: candidate.personality.traits?.leadership, icon: '👑' },
                    { label: 'Team Orientation', value: candidate.personality.traits?.teamOrientation, icon: '🤝' },
                    { label: 'Analytical', value: candidate.personality.traits?.analytical, icon: '🧮' },
                    { label: 'Creative', value: candidate.personality.traits?.creative, icon: '🎨' }
                  ].map((trait, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{trait.icon}</span>
                        <span className="text-slate-300 font-medium">{trait.label}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-slate-700 rounded-full mr-3">
                          <div 
                            className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            style={{width: `${(trait.value || 0) * 10}%`}}
                          ></div>
                        </div>
                        <span className="font-bold text-purple-400 text-lg">{trait.value || 0}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              ) : (
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-purple-500/30">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-2xl mr-4">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Personality DNA</h3>
                  </div>
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-lg">Personality analysis will be available after interview completion</p>
                  </div>
                </div>
              )}

              {candidate.eqAnalysis?.overallEQ ? (
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-pink-500/30">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-3 rounded-2xl mr-4">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Emotional Intelligence</h3>
                  </div>
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-pink-500/30 to-rose-500/30 backdrop-blur-sm rounded-2xl p-6 border border-pink-400/40 text-center">
                    <span className="text-5xl font-black text-pink-300">{candidate.eqAnalysis?.overallEQ || 0}/10</span>
                    <p className="text-pink-200 text-sm mt-2 font-semibold">Overall EQ Assessment</p>
                    <div className="flex justify-center mt-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor((candidate.eqAnalysis?.overallEQ || 0)/2) ? 'text-pink-400 fill-current' : 'text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Voice Confidence', value: candidate.eqAnalysis?.breakdown?.voiceConfidence, icon: '🎤' },
                    { label: 'Stress Management', value: candidate.eqAnalysis?.breakdown?.stressManagement, icon: '🧘' },
                    { label: 'Communication', value: candidate.eqAnalysis?.breakdown?.communicationClarity, icon: '💬' }
                  ].map((eq, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{eq.icon}</span>
                        <span className="text-slate-300 font-medium">{eq.label}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-slate-700 rounded-full mr-3">
                          <div 
                            className="h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                            style={{width: `${(eq.value || 0) * 10}%`}}
                          ></div>
                        </div>
                        <span className="font-bold text-pink-400 text-lg">{eq.value || 0}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              ) : (
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-pink-500/30">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-3 rounded-2xl mr-4">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Emotional Intelligence</h3>
                  </div>
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-lg">EQ analysis will be available after interview completion</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Enhanced DNA Genome Chart */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-500/30 mb-8">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl mr-4 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Digital DNA Genome Profile</h2>
                <p className="text-slate-400">Comprehensive behavioral and skill analysis powered by AI</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/20">
              <GenomeChart 
                skillDNA={{
                  overall_skill_score: candidate.skillDNA?.overallScore || 85,
                  adaptability_score: 8,
                  learning_velocity: 9
                }}
                behaviorDNA={{
                  team_collaboration: candidate.personality?.traits?.teamOrientation || 8,
                  problem_solving: candidate.personality?.traits?.analytical || 8,
                  communication_clarity: candidate.eqAnalysis?.breakdown?.communicationClarity || 8,
                  leadership_potential: candidate.personality?.traits?.leadership || 7,
                  stress_tolerance: candidate.eqAnalysis?.breakdown?.stressManagement || 8,
                  emotional_stability: candidate.eqAnalysis?.overallEQ || 8
                }}
              />
            </div>
          </div>

          {/* Enhanced Skills Section */}
          {candidate.skillDNA?.technicalSkills && (
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-cyan-500/30 mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-2xl mr-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Technical Arsenal</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {candidate.skillDNA.technicalSkills.map((skill, idx) => (
                  <span key={idx} className="group px-5 py-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 rounded-2xl font-semibold border border-cyan-400/40 hover:border-cyan-300 hover:bg-gradient-to-r hover:from-cyan-500/40 hover:to-blue-500/40 transition-all cursor-default shadow-lg hover:shadow-cyan-500/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {candidate.skillDNA?.experience && candidate.skillDNA.experience.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Experience</h3>
              <div className="space-y-4">
                {candidate.skillDNA.experience.map((exp, idx) => (
                  <div key={idx} className="border-l-4 border-blue-600 pl-4">
                    <h4 className="font-bold text-gray-900">{exp.role}</h4>
                    <p className="text-gray-600">{exp.company} • {exp.duration}</p>
                    {exp.achievements && (
                      <ul className="mt-2 space-y-1">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="text-sm text-gray-600">• {achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Timeline Graph */}
          {candidate.proctoringData?.confidenceTimeline && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Confidence Timeline</h3>
              <div className="space-y-3">
                {candidate.proctoringData.confidenceTimeline.map((c, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <span className="text-gray-600 font-semibold w-16">Q{c.question}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{width: `${c.confidence * 10}%`}}
                      >
                        <span className="text-white text-xs font-bold">{c.confidence}/10</span>
                      </div>
                    </div>
                    <span className="text-gray-500 text-xs w-20">{c.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Start</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {candidate.proctoringData.confidenceTimeline[0]?.confidence}/10
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(candidate.proctoringData.confidenceTimeline.reduce((a,b) => a + b.confidence, 0) / candidate.proctoringData.confidenceTimeline.length)}/10
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">End</p>
                  <p className="text-2xl font-bold text-green-600">
                    {candidate.proctoringData.confidenceTimeline[candidate.proctoringData.confidenceTimeline.length - 1]?.confidence}/10
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Proctoring Report */}
          {candidate.proctoringData && (
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-green-500/30 mb-8">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-2xl mr-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Security & Integrity Report</h3>
                  <p className="text-slate-400">Real-time proctoring and monitoring analysis</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-6 rounded-2xl border-2 transition-all ${
                  candidate.proctoringData.cameraEnabled 
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30' 
                    : 'bg-gradient-to-br from-red-900/30 to-pink-900/30 border-red-500/30'
                }`}>
                  <div className="flex items-center mb-3">
                    <Camera className={`w-5 h-5 mr-2 ${candidate.proctoringData.cameraEnabled ? 'text-green-400' : 'text-red-400'}`} />
                    <p className="text-sm text-slate-300 font-semibold">Camera</p>
                  </div>
                  <p className={`text-lg font-bold ${candidate.proctoringData.cameraEnabled ? 'text-green-400' : 'text-red-400'}`}>
                    {candidate.proctoringData.cameraEnabled ? '✓ Active' : '✗ Inactive'}
                  </p>
                </div>
                <div className={`p-6 rounded-2xl border-2 transition-all ${
                  candidate.proctoringData.microphoneEnabled 
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30' 
                    : 'bg-gradient-to-br from-red-900/30 to-pink-900/30 border-red-500/30'
                }`}>
                  <div className="flex items-center mb-3">
                    <Mic className={`w-5 h-5 mr-2 ${candidate.proctoringData.microphoneEnabled ? 'text-green-400' : 'text-red-400'}`} />
                    <p className="text-sm text-slate-300 font-semibold">Microphone</p>
                  </div>
                  <p className={`text-lg font-bold ${candidate.proctoringData.microphoneEnabled ? 'text-green-400' : 'text-red-400'}`}>
                    {candidate.proctoringData.microphoneEnabled ? '✓ Active' : '✗ Inactive'}
                  </p>
                </div>
                <div className={`p-6 rounded-2xl border-2 transition-all ${
                  candidate.proctoringData.screenShared 
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30' 
                    : 'bg-gradient-to-br from-red-900/30 to-pink-900/30 border-red-500/30'
                }`}>
                  <div className="flex items-center mb-3">
                    <Monitor className={`w-5 h-5 mr-2 ${candidate.proctoringData.screenShared ? 'text-green-400' : 'text-red-400'}`} />
                    <p className="text-sm text-slate-300 font-semibold">Screen Share</p>
                  </div>
                  <p className={`text-lg font-bold ${candidate.proctoringData.screenShared ? 'text-green-400' : 'text-red-400'}`}>
                    {candidate.proctoringData.screenShared ? '✓ Active' : '✗ Inactive'}
                  </p>
                </div>
                <div className={`p-6 rounded-2xl border-2 transition-all ${
                  candidate.proctoringData.violations?.length === 0 
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30' 
                    : 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30'
                }`}>
                  <div className="flex items-center mb-3">
                    <Eye className={`w-5 h-5 mr-2 ${candidate.proctoringData.violations?.length === 0 ? 'text-green-400' : 'text-yellow-400'}`} />
                    <p className="text-sm text-slate-300 font-semibold">Violations</p>
                  </div>
                  <p className={`text-lg font-bold ${candidate.proctoringData.violations?.length === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {candidate.proctoringData.violations?.length || 0}
                  </p>
                </div>
              </div>
              {candidate.proctoringData.violations && candidate.proctoringData.violations.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3" />
                    <h4 className="font-bold text-yellow-400 text-lg">Security Alerts Detected</h4>
                  </div>
                  <ul className="space-y-2">
                    {candidate.proctoringData.violations.map((v, i) => (
                      <li key={i} className="text-yellow-100 flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        <span>{v.type} detected at {v.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Voice Metrics */}
          {candidate.proctoringData?.voiceMetrics && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">🎤 Voice Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Speech Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{candidate.proctoringData.voiceMetrics.speechRate} wpm</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {candidate.proctoringData.voiceMetrics.speechRate > 180 ? 'Fast' : 
                     candidate.proctoringData.voiceMetrics.speechRate < 120 ? 'Slow' : 'Normal'}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Pause Duration</p>
                  <p className="text-2xl font-bold text-purple-600">{candidate.proctoringData.voiceMetrics.pauseDuration}s</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {candidate.proctoringData.voiceMetrics.pauseDuration > 5 ? 'High' : 'Normal'}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Volume Variation</p>
                  <p className="text-2xl font-bold text-green-600">{(candidate.proctoringData.voiceMetrics.volumeVariation * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-500 mt-1">Expressiveness</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Pitch Variation</p>
                  <p className="text-2xl font-bold text-orange-600">{(candidate.proctoringData.voiceMetrics.pitchVariation * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-500 mt-1">Tone Range</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Recommended Roles */}
          <div className="bg-gradient-to-br from-indigo-600/90 to-purple-600/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-indigo-400/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl mr-4 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Perfect Role Matches</h3>
                  <p className="text-indigo-200">AI-recommended positions based on comprehensive analysis</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { 
                    role: 'Senior Developer', 
                    match: `${Math.min(95, Math.round((candidate.skillDNA?.overallScore || 85) + 10))}%`, 
                    icon: '💻', 
                    gradient: 'from-blue-500/40 to-cyan-500/40', 
                    border: 'border-blue-300/50 hover:border-blue-200', 
                    shadow: 'hover:shadow-blue-500/30' 
                  },
                  { 
                    role: 'Team Lead', 
                    match: `${Math.min(95, Math.round((candidate.personality?.traits?.leadership || 7) * 10 + 5))}%`, 
                    icon: '🚀', 
                    gradient: 'from-purple-500/40 to-pink-500/40', 
                    border: 'border-purple-300/50 hover:border-purple-200', 
                    shadow: 'hover:shadow-purple-500/30' 
                  },
                  { 
                    role: 'Technical Architect', 
                    match: `${Math.min(95, Math.round((candidate.skillDNA?.overallScore || 85) + 7))}%`, 
                    icon: '⚙️', 
                    gradient: 'from-orange-500/40 to-red-500/40', 
                    border: 'border-orange-300/50 hover:border-orange-200', 
                    shadow: 'hover:shadow-orange-500/30' 
                  }
                ].map((item, i) => (
                  <div key={i} className={`group bg-gradient-to-br ${item.gradient} backdrop-blur-sm rounded-2xl p-6 border ${item.border} transition-all hover:scale-105 shadow-xl ${item.shadow}`}>
                    <div className="text-center">
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <h4 className="text-white font-bold text-lg mb-2">{item.role}</h4>
                      <div className="bg-white/20 rounded-full px-4 py-2">
                        <span className="text-white font-bold">{item.match} Match</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default CandidateProfilePage;
