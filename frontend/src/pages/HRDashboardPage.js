import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Settings,
  BarChart3,
  Eye,
  Plus,
  Trash2,
  Search,
  Filter,
  Mail,
  MapPin,
  Calendar,
  Code,
  Award,
  TrendingUp,
  Star,
  Play,
  FileText,
  ArrowRight
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CreateTemplateModal from '../components/CreateTemplateModal';
import BulkInviteModal from '../components/BulkInviteModal';
import TemplateNotification from '../components/TemplateNotification';
import useTemplateNotifications from '../hooks/useTemplateNotifications';
import Spline from '@splinetool/react-spline';
import QuickHire from '../components/QuickHire';
import InterviewScheduler from '../components/InterviewScheduler';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { notification, closeNotification, confirmUseTemplate, confirmDeleteTemplate, showSuccess } = useTemplateNotifications();

  useEffect(() => {
    fetchCandidates();
    fetchInterviews();
    fetchTemplates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/candidates`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/hr/interviews`);
      const data = await response.json();
      setInterviews(data || []);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      console.log('🔄 Fetching templates from:', `${API_URL}/api/hr/templates`);
      const response = await fetch(`${API_URL}/api/hr/templates`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Templates fetched:', data.length, 'templates');
        console.log('📋 Template details:', data.map(t => ({
          name: t.name,
          type: t.templateType,
          scheduled: t.isScheduled,
          date: t.scheduledDate
        })));
        setTemplates(data || []);
      } else {
        console.error('❌ Failed to fetch templates:', response.status);
      }
    } catch (error) {
      console.error('❌ Failed to fetch templates:', error);
    }
  };

  const handleUseTemplate = async (template) => {
    const templateInfo = {
      name: template.name,
      description: `${template.difficulty} level assessment with ${template.totalQuestions || 'multiple'} questions`,
      questions: template.totalQuestions || template.categories?.length || 0,
      category: template.categories?.join(', ') || 'General',
      difficulty: template.difficulty
    };
    
    confirmUseTemplate(templateInfo, async () => {
      try {
        const response = await fetch(`${API_URL}/api/hr/templates/${template._id}/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          showSuccess('Template activated successfully! It will now be used for matching candidates.');
          fetchTemplates();
        }
      } catch (error) {
        console.error('Error activating template:', error);
      }
    }, 'hr');
  };

  const handleDeleteTemplate = async (template) => {
    const templateInfo = {
      name: template.name,
      description: `${template.difficulty} level assessment`,
      questions: template.totalQuestions || template.categories?.length || 0,
      category: template.categories?.join(', ') || 'General'
    };
    
    confirmDeleteTemplate(templateInfo, async () => {
      try {
        const response = await fetch(`${API_URL}/api/hr/templates/${template._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          showSuccess('Template deleted successfully!');
          await fetchTemplates();
        }
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    });
  };

  const handleDeployTemplate = async (template) => {
    try {
      const endpoint = template.isDeployed ? 'undeploy' : 'deploy';
      const response = await fetch(`${API_URL}/api/hr/templates/${template._id}/${endpoint}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        showSuccess(`Template ${template.isDeployed ? 'undeployed' : 'deployed'} successfully!`);
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Error deploying template:', error);
    }
  };

  const handleSaveTemplate = async (newTemplate) => {
    console.log('Saving template:', newTemplate);
    // Force immediate refresh
    await fetchTemplates();
  };

  const getGradeColor = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 80) return 'from-blue-500 to-blue-600';
    if (score >= 70) return 'from-purple-500 to-purple-600';
    if (score >= 60) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    return 'C';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-slate-100">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-black text-gray-900 mb-4">
              HR Dashboard
            </h1>
            <p className="text-xl text-gray-600 font-medium">Manage templates and candidates</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-4xl font-black text-white mb-2">{candidates.length}</p>
              <p className="text-blue-100 text-sm font-semibold">Total Candidates</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <Eye className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-4xl font-black text-white mb-2">{templates.length}</p>
              <p className="text-orange-100 text-sm font-semibold">Templates</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-4xl font-black text-white mb-2">{candidates.filter(c => c.interviewCompleted).length}</p>
              <p className="text-emerald-100 text-sm font-semibold">Completed</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-4xl font-black text-white mb-2">
                {candidates.filter(c => c.interviewCompleted).length > 0 
                  ? Math.round((candidates.filter(c => c.interviewScore >= 70).length / candidates.filter(c => c.interviewCompleted).length) * 100)
                  : 0}%
              </p>
              <p className="text-purple-100 text-sm font-semibold">Pass Rate</p>
            </div>
          </div>

          {/* Quick AI Hire Section */}
          <QuickHire />

          {/* Interview Scheduler */}
          <div className="mb-8">
            <InterviewScheduler />
          </div>

          {/* 3D Spline Robot */}
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-100 mb-8">
            <div className="h-96 rounded-xl overflow-hidden">
              <Spline scene="https://prod.spline.design/5HVoUDtYXsfqlJ-z/scene.splinecode" />
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Interview Templates</h2>
              <div className="flex items-center space-x-3">
                <button 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2" 
                  onClick={() => setShowInviteModal(true)}
                >
                  <Mail className="w-5 h-5" />
                  <span>Invite Candidates</span>
                </button>
                <button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2" 
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Template</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.length > 0 ? templates.map((template) => (
                <div key={template._id} className={`bg-gradient-to-br ${template.difficulty === 'hard' ? 'from-red-50 to-pink-50 border-red-200' : template.difficulty === 'medium' ? 'from-yellow-50 to-orange-50 border-yellow-200' : 'from-green-50 to-emerald-50 border-green-200'} p-6 rounded-xl border hover:shadow-lg transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{template.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        template.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                        template.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                      </span>
                      {template.templateType === 'scheduled' && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          template.isActive ? 'bg-green-500 text-white animate-pulse' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {template.isActive ? '🟢 LIVE' : '📅 Scheduled'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Scheduling Info for Scheduled Templates */}
                  {template.templateType === 'scheduled' && template.scheduledDate && (
                    <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-xs text-purple-800 mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-semibold">Scheduled Interview</span>
                      </div>
                      <div className="text-xs text-purple-700 space-y-1">
                        <p><strong>Date:</strong> {new Date(template.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p><strong>Time:</strong> {template.scheduledStartTime} - {template.scheduledEndTime}</p>
                        {!template.isActive && (
                          <p className="text-purple-600 font-medium mt-1">⏰ Will activate at {template.scheduledStartTime}</p>
                        )}
                        {template.isActive && (
                          <p className="text-green-600 font-medium mt-1">✅ Currently Active - Expires at {template.scheduledEndTime}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Duration: {template.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Categories: {template.categories?.join(', ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Passing Score: {template.passingScore}%</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeployTemplate(template)}
                    className={`w-full py-3 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 mb-2 ${
                      template.isDeployed 
                        ? 'bg-orange-500 text-white hover:bg-orange-600' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>{template.isDeployed ? 'Undeploy' : 'Deploy'}</span>
                  </button>
                  <button onClick={() => handleDeleteTemplate(template)}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )) : (
                <div className="col-span-2 text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No templates created yet</p>
                  <p className="text-gray-400 text-sm mt-2">Create your first interview template to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Candidates Results */}
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Candidates</h2>
              <button 
                onClick={() => navigate('/analytics')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span>View Analytics</span>
              </button>
            </div>
            
            {/* Search and Sort */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Scores</option>
                <option value="high">High (90+)</option>
                <option value="medium">Medium (70-89)</option>
                <option value="low">Low (0-69)</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterScore('all');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium transform hover:scale-105 active:scale-95"
              >
                Reset
              </button>
            </div>
            
            <div className="space-y-4">
              {candidates
                .filter(candidate => {
                  // Only show candidates who completed interview
                  const hasInterviewScore = candidate.interviewScore || (candidate.interviewResponses && candidate.interviewResponses.length > 0);
                  if (!hasInterviewScore) return false;
                  
                  const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());
                  const score = candidate.interviewScore || 0;
                  const matchesFilter = filterScore === 'all' ||
                                      (filterScore === 'high' && score >= 90) ||
                                      (filterScore === 'medium' && score >= 70 && score < 90) ||
                                      (filterScore === 'low' && score < 70);
                  return matchesSearch && matchesFilter;
                })
                .slice(0, 5).map((candidate) => {
                const score = candidate.interviewScore || 0;
                const skills = candidate.skillDNA?.technicalSkills || candidate.skills || [];
                const grade = getGrade(score);
                
                return (
                  <div key={candidate._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                        {candidate.profileImage ? (
                          <img 
                            src={candidate.profileImage} 
                            alt={candidate.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className={candidate.profileImage ? 'hidden' : 'block'}>
                          {candidate.name?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{candidate.name}</h4>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {candidate.interviewScore || 'N/A'}
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
                );
              })}
              
              {candidates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No candidates yet. Upload resumes to get started!</p>
                </div>
              )}
              
              {candidates.length > 5 && (
                <div className="text-center pt-4">
                  <button 
                    onClick={() => navigate('/analytics')}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 mx-auto"
                  >
                    <span>View All {candidates.length} Candidates</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      <CreateTemplateModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveTemplate}
      />
      
      <BulkInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        templates={templates}
      />
      
      {notification && (
        <TemplateNotification
          notification={notification}
          onConfirm={notification.onConfirm || (() => {})}
          onCancel={() => {}}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default HRDashboard;