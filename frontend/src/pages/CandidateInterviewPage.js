import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, User, Briefcase } from 'lucide-react';
import axios from 'axios';

const EnhancedCandidateInterview = () => {
  const { interviewId, candidateId } = useParams();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    loadInterview();
  }, [interviewId, candidateId]);

  useEffect(() => {
    if (interview && currentQuestion < interview.questions.length && !isCompleted) {
      const question = interview.questions[currentQuestion];
      setTimeLeft(question.timeLimit || 180);
      setStartTime(Date.now());
    }
  }, [currentQuestion, interview]);

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      handleAutoSubmit();
    }
  }, [timeLeft, isCompleted]);

  const loadInterview = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/hr/candidate/interview/${interviewId}/${candidateId}`);
      setInterview(response.data);
      setAnswers(new Array(response.data.questions.length).fill(null));
    } catch (error) {
      console.error('Failed to load interview:', error);
      setError('Failed to load interview. Please check the link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: currentQuestion + 1,
      question: interview.questions[currentQuestion],
      answer: currentAnswer,
      timeSpent: timeSpent,
      isAutoSubmitted: true
    };
    setAnswers(newAnswers);
    
    if (currentQuestion < interview.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer('');
    } else {
      submitInterview(newAnswers);
    }
  };

  const handleNextQuestion = () => {
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: currentQuestion + 1,
      question: interview.questions[currentQuestion],
      answer: currentAnswer,
      timeSpent: timeSpent,
      isAutoSubmitted: false
    };
    setAnswers(newAnswers);
    
    if (currentQuestion < interview.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer('');
    } else {
      submitInterview(newAnswers);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevAnswer = answers[currentQuestion - 1];
      setCurrentAnswer(prevAnswer ? prevAnswer.answer : '');
    }
  };

  const submitInterview = async (finalAnswers) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post('${API_URL}/api/hr/candidate/submit-interview', {
        interviewId,
        candidateId,
        answers: finalAnswers,
        completedAt: new Date().toISOString()
      });
      
      setResult(response.data);
      setIsCompleted(true);
    } catch (error) {
      console.error('Failed to submit interview:', error);
      setError('Failed to submit interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 60) return 'text-green-600';
    if (timeLeft > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted && result) {
    // Auto redirect after 3 seconds
    React.useEffect(() => {
      const timer = setTimeout(() => {
        navigate(`/genome/${candidateId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Completed!</h2>
            <p className="text-gray-600 mb-6">Thank you for completing the SDE assessment.</p>
            
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Redirecting to results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  const question = interview.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / interview.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{interview.title}</h1>
                <p className="text-sm text-gray-600">{interview.jobTitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{interview.candidateInfo?.name}</span>
              </div>
              <div className={`flex items-center space-x-2 ${getTimeColor()}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {interview.questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {question.difficulty}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {question.category}
              </span>
              {question.skillsToTest && question.skillsToTest.length > 0 && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {question.skillsToTest.join(', ')}
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {question.text}
            </h2>
          </div>

          <div className="mb-6">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {currentAnswer.length} characters
              </p>
              <p className="text-sm text-gray-500">
                Time limit: {formatTime(question.timeLimit || 180)}
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0 || isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={isSubmitting || !currentAnswer.trim()}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {currentQuestion === interview.questions.length - 1 ? 'Submit Interview' : 'Next Question'}
              </span>
              {currentQuestion < interview.questions.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCandidateInterview;