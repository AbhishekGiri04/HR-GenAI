import React from 'react';
import { useParams } from 'react-router-dom';
import { Brain, TrendingUp, Users, Award } from 'lucide-react';
import GenomeChart from '../components/GenomeChart';

const GenomeProfile = () => {
  const { id } = useParams();

  const mockData = {
    candidate: {
      name: "John Doe",
      email: "john.doe@example.com",
      appliedFor: "Senior Developer"
    },
    skillDNA: {
      overall_skill_score: 87,
      adaptability_score: 8,
      learning_velocity: 9,
      technical_skills: [
        { name: "Python", level: 8, years: 3 },
        { name: "React", level: 7, years: 2 },
        { name: "Node.js", level: 8, years: 3 }
      ],
      soft_skills: [
        { name: "Leadership", strength: 7 },
        { name: "Communication", strength: 8 }
      ]
    },
    behaviorDNA: {
      stress_tolerance: 8,
      team_collaboration: 7,
      problem_solving: 9,
      communication_clarity: 8,
      leadership_potential: 7,
      emotional_stability: 8
    },
    genomeScore: {
      clean_talent_score: 87,
      growth_likelihood: 94,
      retention_prediction: 91,
      culture_fit: 89
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">🧬 Digital DNA Profile</h1>
          <p className="text-blue-100">Candidate ID: {id}</p>
          <div className="mt-4">
            <h2 className="text-2xl font-semibold">{mockData.candidate.name}</h2>
            <p className="text-blue-100">{mockData.candidate.email}</p>
            <p className="text-blue-100">Applied for: {mockData.candidate.appliedFor}</p>
          </div>
        </div>

        {/* Genome Scores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Award className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{mockData.genomeScore.clean_talent_score}</p>
            <p className="text-sm text-gray-600">Clean Talent Score</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{mockData.genomeScore.growth_likelihood}%</p>
            <p className="text-sm text-gray-600">Growth Likelihood</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{mockData.genomeScore.retention_prediction}%</p>
            <p className="text-sm text-gray-600">Retention Prediction</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Brain className="w-12 h-12 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{mockData.genomeScore.culture_fit}%</p>
            <p className="text-sm text-gray-600">Culture Fit</p>
          </div>
        </div>

        {/* DNA Chart */}
        <div className="mb-6">
          <GenomeChart skillDNA={mockData.skillDNA} behaviorDNA={mockData.behaviorDNA} />
        </div>

        {/* Skills Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">💻 Technical Skills</h3>
            {mockData.skillDNA.technical_skills.map((skill, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm text-gray-600">{skill.level}/10 • {skill.years} years</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${skill.level * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">🤝 Soft Skills</h3>
            {mockData.skillDNA.soft_skills.map((skill, idx) => (
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
          <h3 className="text-2xl font-bold text-green-800 mb-2">✅ Hiring Recommendation: STRONG HIRE</h3>
          <p className="text-green-700">
            This candidate shows exceptional potential with high scores across all DNA profiles. 
            Recommended for Senior Developer or Team Lead positions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenomeProfile;