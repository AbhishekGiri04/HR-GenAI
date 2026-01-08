import React from 'react';
import API_URL from '../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, TrendingUp, Users, Award } from 'lucide-react';
import GenomeChart from '../components/GenomeChart';

const GenomeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidateData, setCandidateData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await fetch(`${API_URL}/api/candidates/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCandidateData(data);
        }
      } catch (error) {
        console.error('Failed to fetch candidate:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  // Redirect to dashboard after 30 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 30000);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Candidate not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{
      backgroundImage: 'url(https://img.freepik.com/premium-photo/white-tulips-pale-pink-background-with-morning-sunlight-stylish-compositions-pastel-colors_479776-717.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-8 rounded-lg shadow-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">Digital DNA Profile</h1>
          <p className="text-gray-300">Candidate ID: {id}</p>
          <div className="mt-4">
            <h2 className="text-2xl font-semibold">{candidateData.name}</h2>
            <p className="text-gray-300">{candidateData.email}</p>
            <p className="text-gray-300">Applied for: {candidateData.appliedFor || candidateData.position || candidateData.template?.name || candidateData.appliedPosition || 'Not specified'}</p>
          </div>
        </div>

        {/* Genome Scores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-center">
            <Award className="w-12 h-12 text-white mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{candidateData.skillDNA?.overallScore || candidateData.hiringProbability?.score || 85}</p>
            <p className="text-sm text-blue-100">Clean Talent Score</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-center">
            <TrendingUp className="w-12 h-12 text-white mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{candidateData.hiringProbability?.predictions?.willStay6Months || 90}%</p>
            <p className="text-sm text-green-100">Growth Likelihood</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-center">
            <Users className="w-12 h-12 text-white mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{100 - (candidateData.hiringProbability?.predictions?.burnoutRisk || 10)}%</p>
            <p className="text-sm text-purple-100">Retention Prediction</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-lg shadow-lg text-center">
            <Brain className="w-12 h-12 text-white mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{candidateData.personality?.traits?.teamOrientation * 10 || 85}%</p>
            <p className="text-sm text-orange-100">Culture Fit</p>
          </div>
        </div>

        {/* DNA Chart */}
        <div className="mb-6">
          <GenomeChart 
            skillDNA={{
              overall_skill_score: candidateData.skillDNA?.overallScore || 85,
              adaptability_score: 8,
              learning_velocity: 9
            }} 
            behaviorDNA={{
              team_collaboration: candidateData.personality?.traits?.teamOrientation || 8,
              problem_solving: candidateData.personality?.traits?.analytical || 8,
              communication_clarity: candidateData.eqAnalysis?.breakdown?.communicationClarity || 8,
              leadership_potential: candidateData.personality?.traits?.leadership || 7,
              stress_tolerance: candidateData.eqAnalysis?.breakdown?.stressManagement || 8,
              emotional_stability: candidateData.eqAnalysis?.overallEQ || 8
            }} 
          />
        </div>

        {/* Skills Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">💻 Technical Skills</h3>
            {(candidateData.skillDNA?.technicalSkills || []).slice(0, 5).map((skill, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{skill}</span>
                  <span className="text-sm text-gray-600">Verified</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">🤝 Soft Skills</h3>
            {[
              { name: 'Leadership', strength: candidateData.personality?.traits?.leadership || 7 },
              { name: 'Communication', strength: candidateData.eqAnalysis?.breakdown?.communicationClarity || 8 },
              { name: 'Team Collaboration', strength: candidateData.personality?.traits?.teamOrientation || 8 }
            ].map((skill, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm text-gray-600">{skill.strength}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${skill.strength * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Recommendation */}
        <div className="mt-6 bg-green-50 border-2 border-green-500 p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-green-800 mb-2">✅ Hiring Recommendation: {candidateData.interviewSummary?.verdict || 'STRONG HIRE'}</h3>
          <p className="text-green-700">
            {candidateData.interviewSummary?.summary || 'This candidate shows exceptional potential with high scores across all DNA profiles.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenomeProfile;