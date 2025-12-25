import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, CheckCircle, Sparkles, MessageCircle, User, Clock, Target } from 'lucide-react';

const TextInterview = ({ questions, candidateInfo, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setWordCount(currentAnswer.split(' ').filter(word => word.length > 0).length);
    setIsTyping(currentAnswer.length > 0);
  }, [currentAnswer]);

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return;

    const newAnswers = [...answers, {
      question: questions[currentQuestion].question,
      type: questions[currentQuestion].type,
      answer: currentAnswer.trim(),
      wordCount
    }];
    
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestion < 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const name = candidateInfo?.personalInfo?.name || candidateInfo?.name || 'Candidate';
  const progress = ((currentQuestion + 1) / 2) * 100;

  return (
    <>
    <style>{`
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(0, 245, 255, 0.3); }
        50% { box-shadow: 0 0 40px rgba(0, 245, 255, 0.6); }
      }
      .animate-float { animation: float 3s ease-in-out infinite; }
      .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
    `}</style>
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 25%, #0f0a1e 50%, #1a0f2e 75%, #0a0a0f 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite'
    }}>
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar - AI Avatar & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* AI Avatar */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl animate-pulse-glow">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4 animate-float">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl" style={{
                      clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                    }}></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-1" style={{
                    background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>HUMA</h3>
                  <p className="text-cyan-300 text-sm font-bold">AI INTERVIEWER</p>
                  <div className="mt-4 px-4 py-2 bg-green-500/20 rounded-xl border border-green-400/30">
                    <p className="text-green-300 text-xs font-bold">🟢 ACTIVE</p>
                  </div>
                </div>
              </div>

              {/* Interview Stats */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                <h4 className="text-white font-bold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-cyan-400" />
                  Interview Progress
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Questions</span>
                    <span className="text-cyan-400 font-bold">{currentQuestion + 1}/2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Words Typed</span>
                    <span className="text-green-400 font-bold">{wordCount}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Previous Answers */}
              {answers.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <h4 className="text-white font-bold mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                    Completed
                  </h4>
                  <div className="space-y-3">
                    {answers.map((answer, idx) => (
                      <div key={idx} className="bg-green-500/10 rounded-xl p-3 border border-green-400/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-400 text-xs font-bold">Q{idx + 1}</span>
                          <span className="text-white/60 text-xs">{answer.wordCount} words</span>
                        </div>
                        <p className="text-white/80 text-xs leading-relaxed">
                          {answer.answer.substring(0, 80)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Interview Area */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-black mb-2" style={{
                        background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>TEXT INTERVIEW</h2>
                      <p className="text-white/70 text-lg font-semibold">Basic & Cultural Assessment</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                        <p className="text-cyan-400 text-sm font-bold">Question {currentQuestion + 1} of 2</p>
                        <p className="text-white/60 text-xs">{Math.round(progress)}% Complete</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Message */}
                {currentQuestion === 0 && (
                  <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/10">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-cyan-400 font-bold text-sm">HUMA</span>
                          <span className="text-white/40 text-xs">AI Interviewer</span>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-white leading-relaxed">
                          Hello <span className="text-cyan-400 font-semibold">{name}</span>! I'm Huma, your AI interviewer. 
                          I've carefully analyzed your resume and I'm impressed with your background. 
                          Let's begin with some foundational questions to understand your professional journey better.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Section */}
                <div className="p-8">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-400/20 mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                        <span className="text-white text-xs font-bold uppercase">{questions[currentQuestion]?.type}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/60">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Question {currentQuestion + 1}</span>
                      </div>
                    </div>
                    <h3 className="text-white text-2xl font-bold leading-relaxed">
                      {questions[currentQuestion]?.question}
                    </h3>
                  </div>

                  {/* Answer Input */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center space-x-2 text-white font-bold">
                          <User className="w-5 h-5 text-cyan-400" />
                          <span>Your Response</span>
                        </label>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-white/60">{currentAnswer.length} chars</span>
                          <span className="text-cyan-400 font-semibold">{wordCount} words</span>
                          {isTyping && <span className="text-green-400 animate-pulse">✍️ Typing...</span>}
                        </div>
                      </div>
                      <div className="relative">
                        <textarea
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          placeholder="Share your thoughts in detail. Take your time to craft a comprehensive response..."
                          className="w-full p-6 rounded-2xl bg-white/95 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:outline-none resize-none transition-all duration-300"
                          rows={8}
                          style={{
                            minHeight: '200px',
                            boxShadow: isTyping ? '0 0 30px rgba(0, 245, 255, 0.2)' : 'none'
                          }}
                        />
                        {currentAnswer.length > 0 && (
                          <div className="absolute bottom-4 right-4">
                            <div className="bg-cyan-500/20 rounded-lg px-3 py-1 backdrop-blur-sm">
                              <span className="text-cyan-300 text-xs font-bold">
                                {currentAnswer.length >= 50 ? '✅ Good length' : '⏳ Keep writing...'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col space-y-4">
                      <button
                        onClick={handleSubmit}
                        disabled={!currentAnswer.trim() || currentAnswer.trim().length < 10}
                        className="w-full py-5 text-white rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-105"
                        style={{
                          background: currentAnswer.trim().length >= 10 
                            ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcc02 100%)' 
                            : 'linear-gradient(135deg, #666 0%, #888 100%)',
                          boxShadow: currentAnswer.trim().length >= 10 
                            ? '0 0 40px rgba(255, 107, 53, 0.6), 0 0 80px rgba(247, 147, 30, 0.4)' 
                            : 'none'
                        }}
                      >
                        <Sparkles className="w-6 h-6" />
                        <span>
                          {currentQuestion < 1 ? 'Continue to Next Question' : 'Complete Text Interview'}
                        </span>
                        <ArrowRight className="w-6 h-6" />
                      </button>

                      {currentAnswer.trim().length < 10 && (
                        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-400/20">
                          <p className="text-yellow-300 text-sm text-center">
                            💡 Please provide at least 10 characters for a meaningful response
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Tip */}
                <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6 border-t border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-yellow-300 font-semibold">Pro Tip</p>
                      <p className="text-white/70 text-sm">
                        Detailed, authentic responses help our AI understand your unique value proposition better.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default TextInterview;