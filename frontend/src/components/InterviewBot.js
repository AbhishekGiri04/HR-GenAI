import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import axios from 'axios';

const InterviewBot = ({ candidateId, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const questions = [
    "Describe a time when you had to work under extreme pressure. How did you handle it?",
    "Tell me about a project that failed. What was your role and what did you learn?",
    "How do you handle conflicts within a team?",
    "Describe a complex problem you solved recently. Walk me through your approach."
  ];

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    const newAnswers = [...answers, { question: questions[currentQuestion], answer: currentAnswer }];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit all answers for analysis
      try {
        await axios.post('http://localhost:5000/api/analysis/interview', {
          candidateId,
          responses: newAnswers
        });
        setIsComplete(true);
        onComplete && onComplete();
      } catch (error) {
        console.error('Interview submission error:', error);
      }
    }
  };

  if (isComplete) {
    return (
      <div className="bg-green-50 p-6 rounded-lg text-center">
        <h3 className="text-2xl font-bold text-green-800 mb-2">✅ Interview Complete!</h3>
        <p className="text-green-600">Your responses are being analyzed...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">AI Cognitive Interview</h3>
      </div>

      <div className="mb-4">
        <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {questions.length}</span>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-gray-800 font-medium">{questions[currentQuestion]}</p>
      </div>

      <textarea
        value={currentAnswer}
        onChange={(e) => setCurrentAnswer(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows="6"
      />

      <button
        onClick={handleSubmitAnswer}
        disabled={!currentAnswer.trim()}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
        {currentQuestion < questions.length - 1 ? 'Next Question' : 'Submit Interview'}
      </button>
    </div>
  );
};

export default InterviewBot;