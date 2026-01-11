import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Mic, MicOff, Play, Phone } from 'lucide-react';
import Header from '../components/Header';
import TimedCulturalInterview from '../components/TimedCulturalInterview';
import TextInterview from '../components/TextInterview';
// import AIInterviewer from '../components/AIInterviewer'; // Not used - removed
// import VoiceAPIAgent from '../components/VoiceAPIAgent'; // Not used - removed

const TemplateBasedInterview = () => {
  const { candidateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { template: locationTemplate, questions: locationQuestions, aiGenerated } = location.state || {};
  
  const [interviewPhase, setInterviewPhase] = useState('loading');
  const [candidateData, setCandidateData] = useState(null);
  const [template, setTemplate] = useState(locationTemplate);
  const [questions, setQuestions] = useState(locationQuestions);
  const [loading, setLoading] = useState(true);
  const [voiceAnswers, setVoiceAnswers] = useState([]);
  const [textAnswers, setTextAnswers] = useState([]);

  // Separate questions by type for mixed interviews
  const voiceQuestions = questions?.filter(q => q.type === 'voice' || q.interviewMode === 'voice') || [];
  const textQuestions = questions?.filter(q => q.type === 'text' || q.interviewMode === 'text') || [];
  
  const isVoiceInterview = template?.interviewType === 'technical';
  const isTextInterview = template?.interviewType === 'behavioral';
  const isMixedInterview = template?.interviewType === 'mixed';
  
  console.log('Interview Type:', template?.interviewType);
  console.log('Voice Questions:', voiceQuestions.length);
  console.log('Text Questions:', textQuestions.length);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch candidate data
        const candidateResponse = await fetch(`${API_URL}/api/candidates/${candidateId}`);
        if (candidateResponse.ok) {
          const candidate = await candidateResponse.json();
          setCandidateData(candidate);
          
          // If no template from location, fetch deployed templates
          if (!template) {
            const templatesResponse = await fetch(`${API_URL}/api/hr/templates/deployed/public?candidateId=${candidateId}`);
            if (templatesResponse.ok) {
              const templates = await templatesResponse.json();
              if (templates.length > 0) {
                const selectedTemplate = templates[0];
                setTemplate(selectedTemplate);
                
                // Generate questions
                const questionsResponse = await fetch(`${API_URL}/api/interview/generate-questions/${candidateId}/${selectedTemplate._id}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                
                if (questionsResponse.ok) {
                  const data = await questionsResponse.json();
                  setQuestions(data.questions);
                  setInterviewPhase('setup');
                }
              }
            }
          } else {
            setInterviewPhase('setup');
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [candidateId, template]);

  const handleCompleteInterview = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analysis/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          templateId: template._id,
          aiGenerated
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setInterviewPhase('completed');
        
        setTimeout(() => {
          navigate(`/genome/${candidateId}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit interview:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate data...</p>
        </div>
      </div>
    );
  }

  if (!template || !questions) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Interview Not Found</h2>
          <p className="text-gray-600">Please select a template to start the interview.</p>
        </div>
      </div>
    );
  }

  if (interviewPhase === 'setup') {
    return (
      <TimedCulturalInterview 
        questions={questions}
        candidateInfo={candidateData || {
          personalInfo: { 
            name: candidateData?.skillDNA?.personalInfo?.name || candidateData?.personalInfo?.name || 'Candidate',
            profilePicture: candidateData?.skillDNA?.personalInfo?.profilePicture || candidateData?.personalInfo?.profilePicture
          },
          skillDNA: candidateData?.skillDNA,
          position: template?.name || 'Interview'
        }}
        onComplete={async (answers) => {
          console.log('📝 Interview completed with', answers.length, 'answers');
          
          try {
            const saveResponse = await fetch(`${API_URL}/api/candidates/${candidateId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appliedFor: template?.name,
                templateId: template?._id,
                interviewResponses: answers,
                status: 'interviewed',
                $addToSet: { completedTemplates: template?._id }
              })
            });
            
            if (saveResponse.ok) {
              console.log('✅ Interview responses saved');
              
              const evalResponse = await fetch(`${API_URL}/api/analysis/evaluate-interview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  candidateId,
                  templateId: template?._id,
                  answers
                })
              });
              
              if (evalResponse.ok) {
                const evalResult = await evalResponse.json();
                console.log('✅ Interview evaluated, score:', evalResult.score);
              }
            }
          } catch (error) {
            console.error('Failed to save/evaluate interview:', error);
          }
          
          navigate(`/genome/${candidateId}`);
        }}
        template={template}
      />
    );
  }

  return null;
};

export default TemplateBasedInterview;