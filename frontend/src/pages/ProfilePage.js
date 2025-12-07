import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Award, TrendingUp, Target, Sparkles, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GenomeChart from '../components/GenomeChart';
import axios from 'axios';

const ProfilePage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          {/* AI Avatar Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Circular AI Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-lg border-4 border-white/30 flex items-center justify-center shadow-2xl">
                    <Brain className="w-16 h-16 text-white animate-pulse" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="text-white">
                  <h1 className="text-4xl font-black mb-2">{candidate.name}</h1>
                  <p className="text-blue-100 text-lg mb-3">{candidate.email}</p>
                  <div className="flex items-center space-x-4">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                      {candidate.phone || 'No phone'}
                    </span>
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                      {candidate.location || 'No location'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                  <p className="text-white/80 text-sm mb-1">Clean Talent Score</p>
                  <p className="text-6xl font-black text-white">{cleanTalentScore}</p>
                  <p className="text-white/80 text-sm mt-1">out of 100</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Summary */}
          {candidate.interviewSummary && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg border-2 border-blue-200 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">AI Interview Summary</h2>
                <span className={`px-4 py-2 rounded-full font-bold ${
                  candidate.interviewSummary.verdict === 'Strong Hire' ? 'bg-green-600 text-white' :
                  candidate.interviewSummary.verdict === 'Hire' ? 'bg-blue-600 text-white' :
                  candidate.interviewSummary.verdict === 'Maybe' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {candidate.interviewSummary.verdict}
                </span>
              </div>
              <p className="text-gray-700 text-lg mb-4">{candidate.interviewSummary.summary}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-green-700 mb-2">✅ Strengths</h4>
                  <ul className="space-y-1">
                    {candidate.interviewSummary.strengths?.map((s, i) => (
                      <li key={i} className="text-sm text-gray-700">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-red-700 mb-2">⚠️ Weaknesses</h4>
                  <ul className="space-y-1">
                    {candidate.interviewSummary.weaknesses?.map((w, i) => (
                      <li key={i} className="text-sm text-gray-700">• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Scores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-10 h-10 text-green-600" />
                <span className="text-4xl font-black text-green-600">{growthLikelihood}%</span>
              </div>
              <h3 className="text-gray-900 font-bold text-lg">Growth Likelihood</h3>
              <p className="text-gray-600 text-sm mt-2">Predicted performance improvement over 12 months</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-10 h-10 text-purple-600" />
                <span className="text-4xl font-black text-purple-600">{retentionPrediction}%</span>
              </div>
              <h3 className="text-gray-900 font-bold text-lg">Retention Prediction</h3>
              <p className="text-gray-600 text-sm mt-2">Likelihood to stay for 2+ years</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-10 h-10 text-orange-600" />
                <span className="text-4xl font-black text-orange-600">{candidate.skillDNA?.overallScore || 85}</span>
              </div>
              <h3 className="text-gray-900 font-bold text-lg">Skill Score</h3>
              <p className="text-gray-600 text-sm mt-2">Technical and soft skills combined</p>
            </div>
          </div>

          {/* Personality & EQ Analysis */}
          {candidate.personality && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🧠 Personality Profile</h3>
                <div className="mb-4">
                  <span className="text-4xl font-black text-purple-600">{candidate.personality.mbti}</span>
                  <p className="text-gray-600 text-sm mt-1">Myers-Briggs Type</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Leadership</span>
                    <span className="font-bold text-blue-600">{candidate.personality.traits?.leadership}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Team Orientation</span>
                    <span className="font-bold text-blue-600">{candidate.personality.traits?.teamOrientation}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Analytical</span>
                    <span className="font-bold text-blue-600">{candidate.personality.traits?.analytical}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Creative</span>
                    <span className="font-bold text-blue-600">{candidate.personality.traits?.creative}/10</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">❤️ Emotional Intelligence</h3>
                <div className="mb-4">
                  <span className="text-4xl font-black text-pink-600">{candidate.eqAnalysis?.overallEQ}/10</span>
                  <p className="text-gray-600 text-sm mt-1">Overall EQ Score</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Voice Confidence</span>
                    <span className="font-bold text-pink-600">{candidate.eqAnalysis?.breakdown?.voiceConfidence}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Stress Management</span>
                    <span className="font-bold text-pink-600">{candidate.eqAnalysis?.breakdown?.stressManagement}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Communication</span>
                    <span className="font-bold text-pink-600">{candidate.eqAnalysis?.breakdown?.communicationClarity}/10</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DNA Genome Chart */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Brain className="w-7 h-7 mr-3 text-blue-600" />
              Digital DNA Genome Profile
            </h2>
            <GenomeChart 
              skillDNA={candidate.skillDNA}
              behaviorDNA={candidate.behaviorDNA}
            />
          </div>

          {/* Skills Section */}
          {candidate.skillDNA?.technicalSkills && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Skills</h3>
              <div className="flex flex-wrap gap-3">
                {candidate.skillDNA.technicalSkills.map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {candidate.skillDNA?.experience && candidate.skillDNA.experience.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
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
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
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

          {/* Proctoring Report */}
          {candidate.proctoringData && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">🔒 Proctoring Report</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${candidate.proctoringData.cameraEnabled ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-gray-600">Camera</p>
                  <p className={`text-lg font-bold ${candidate.proctoringData.cameraEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {candidate.proctoringData.cameraEnabled ? '✓ Enabled' : '✗ Disabled'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${candidate.proctoringData.microphoneEnabled ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-gray-600">Microphone</p>
                  <p className={`text-lg font-bold ${candidate.proctoringData.microphoneEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {candidate.proctoringData.microphoneEnabled ? '✓ Enabled' : '✗ Disabled'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${candidate.proctoringData.screenShared ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-gray-600">Screen Share</p>
                  <p className={`text-lg font-bold ${candidate.proctoringData.screenShared ? 'text-green-600' : 'text-red-600'}`}>
                    {candidate.proctoringData.screenShared ? '✓ Enabled' : '✗ Disabled'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${candidate.proctoringData.violations?.length === 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <p className="text-sm text-gray-600">Violations</p>
                  <p className={`text-lg font-bold ${candidate.proctoringData.violations?.length === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {candidate.proctoringData.violations?.length || 0}
                  </p>
                </div>
              </div>
              {candidate.proctoringData.violations && candidate.proctoringData.violations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">⚠️ Detected Violations:</h4>
                  <ul className="space-y-1">
                    {candidate.proctoringData.violations.map((v, i) => (
                      <li key={i} className="text-sm text-yellow-700">• {v.type} at {v.time}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Voice Metrics */}
          {candidate.proctoringData?.voiceMetrics && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
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

          {/* Recommended Roles */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-green-600" />
              Recommended Roles
            </h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg">
                Senior Developer
              </span>
              <span className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg">
                Team Lead
              </span>
              <span className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg">
                Technical Architect
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
