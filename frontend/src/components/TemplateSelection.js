import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Star, CheckCircle, ArrowRight, Target, Award, Zap, BookOpen, MessageCircle, Brain, Globe } from 'lucide-react';
import TemplateNotification from './TemplateNotification';
import useTemplateNotifications from '../hooks/useTemplateNotifications';

const TemplateSelection = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { notification, closeNotification, confirmUseTemplate, confirmDeleteTemplate, showSuccess } = useTemplateNotifications();

  useEffect(() => {
    fetchTemplates();
  }, [candidateId]);

  const fetchTemplates = async () => {
    try {
      console.log('=== FETCH TEMPLATES START ===');
      console.log('Candidate ID:', candidateId);
      
      // Try to fetch assigned template if valid candidate ID
      if (candidateId && candidateId !== 'public' && candidateId.length === 24) {
        console.log('Attempting to fetch assigned template for candidate');
        try {
          const candidateResponse = await fetch(`${API_URL}/api/candidates/${candidateId}`);
          
          if (candidateResponse.ok) {
            const candidate = await candidateResponse.json();
            console.log('Candidate data:', candidate);
            
            if (candidate.assignedTemplate) {
              const templateResponse = await fetch(`${API_URL}/api/hr/templates/${candidate.assignedTemplate}`);
              
              if (templateResponse.ok) {
                const template = await templateResponse.json();
                console.log('Assigned template found:', template);
                setTemplates([template]);
                setLoading(false);
                return;
              }
            }
          }
        } catch (err) {
          console.log('Candidate fetch error:', err);
        }
      }
      
      // No assigned template or public access - show deployed templates
      console.log('Fetching deployed templates for public access');
      const deployedResponse = await fetch(`${API_URL}/api/hr/templates/deployed/public?candidateId=${candidateId}`);
      console.log('Deployed response status:', deployedResponse.status);
      
      if (deployedResponse.ok) {
        const deployedTemplates = await deployedResponse.json();
        console.log('Deployed templates received:', deployedTemplates);
        console.log('Number of templates:', deployedTemplates.length);
        setTemplates(deployedTemplates);
      } else {
        console.error('Failed to fetch deployed templates:', deployedResponse.status);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      console.log('=== FETCH TEMPLATES END ===');
      setLoading(false);
    }
  };

  const startInterview = async (templateId) => {
    try {
      console.log('Starting interview with template:', templateId);
      const response = await fetch(`${API_URL}/api/interview/generate-questions/${candidateId}/${templateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Questions generated:', data);
        showSuccess('Template applied successfully! Starting interview...');
        setTimeout(() => {
          navigate(`/interview/${candidateId}`, { 
            state: { 
              template: data.template,
              questions: data.questions,
              aiGenerated: true
            } 
          });
        }, 1500);
      } else {
        console.error('Failed to generate questions:', response.status);
        alert('Failed to start interview. Please try again.');
      }
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview. Please try again.');
    }
  };

  const handleUseTemplate = (template) => {
    console.log('Using template:', template);
    const templateInfo = {
      name: template.name,
      description: `${template.difficulty} level assessment with ${template.totalQuestions} questions`,
      questions: template.totalQuestions,
      category: template.categories.join(', '),
      difficulty: template.difficulty
    };
    
    confirmUseTemplate(templateInfo, () => {
      console.log('Template confirmed, starting interview with ID:', template._id);
      startInterview(template._id);
    }, 'candidate');
  };

  const handleDeleteTemplate = async (template) => {
    const templateInfo = {
      name: template.name,
      description: `${template.difficulty} level assessment`,
      questions: template.totalQuestions,
      category: template.categories.join(', ')
    };
    
    confirmDeleteTemplate(templateInfo, async () => {
      try {
        const response = await fetch(`${API_URL}/api/hr/templates/${template._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          showSuccess('Template deleted successfully!');
          fetchTemplates();
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'technical': Brain,
      'behavioral': Users,
      'problem-solving': Target,
      'communication': MessageCircle,
      'leadership': Award,
      'cultural-fit': Globe
    };
    return icons[category] || BookOpen;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-yellow-500 to-orange-600';
      case 'hard': return 'from-red-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading interview options...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: 'url(https://img.freepik.com/free-photo/green-apple-spiral-notepad-pen-eyeglasses-laptop-blue-background_23-2148178578.jpg?semt=ais_hybrid&w=740&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full mb-6 shadow-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">Assessment Selection</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Choose Your Assessment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the assessment template that best matches your skills and experience level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div 
              key={template._id} 
              className={`bg-white rounded-2xl shadow-xl border-2 transition-all hover:shadow-2xl hover:scale-105 ${
                template.recommended ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              {template.recommended && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-t-2xl">
                  <div className="flex items-center justify-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-bold">RECOMMENDED FOR YOU</span>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBadge(template.difficulty)}`}>
                    {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">{template.duration} minutes duration</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">{template.totalQuestions} assessment questions</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">{template.passingScore}% minimum score to pass</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium">Skill Match: {template.matchScore}%</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Assessment Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.categories.map((category, idx) => {
                      const IconComponent = getCategoryIcon(category);
                      return (
                        <span key={idx} className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                          <IconComponent className="w-3 h-3 mr-1" />
                          {category} ({template.categoryQuestions[category] || 1})
                        </span>
                      );
                    })}
                  </div>
                </div>

                {template.techStack && template.techStack.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Required Technical Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.techStack.slice(0, 5).map((tech, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium border">
                          <Brain className="w-3 h-3 mr-1 text-gray-500" />
                          {tech}
                        </span>
                      ))}
                      {template.techStack.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border">
                          +{template.techStack.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleUseTemplate(template)}
                  className={`w-full bg-gradient-to-r ${getDifficultyColor(template.difficulty)} text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center space-x-2 transform hover:scale-105`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Start Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Templates Available</h3>
            <p className="text-gray-500">Please contact HR to set up interview templates.</p>
          </div>
        )}
      </div>
      
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

export default TemplateSelection;