import React from 'react';
import { Mic, User, ArrowRight } from 'lucide-react';
import Lottie from 'lottie-react';
import loadingAnimation from '../loading-loop-animation.json';
import Spline from '@splinetool/react-spline';

const VoiceInterviewBox = ({ 
  candidateName, 
  candidateInfo, 
  currentQuestion, 
  totalQuestions, 
  currentAnswer, 
  isListening, 
  isSpeaking, 
  timeRemaining,
  onMicToggle, 
  onClear, 
  onSubmit,
  interviewQuestions
}) => {
  const [hasIntroduced, setHasIntroduced] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);

  // Auto-introduce Huma and ask first question immediately
  React.useEffect(() => {
    if (!hasIntroduced && !isSpeaking) {
      const introduceAndAsk = async () => {
        setHasIntroduced(true);
        
        // Professional introduction
        await speak(`Good day ${candidateName}! I'm Huma, your AI technical interviewer. I've thoroughly reviewed your profile and credentials. Let's proceed with the technical assessment. I'll be asking you ${totalQuestions} questions to evaluate your expertise.`);
        
        // Ask the current question
        const currentQ = interviewQuestions?.[currentQuestion];
        if (currentQ) {
          await speak(`Question ${currentQuestion + 1}: ${currentQ.question}`);
          setIsReady(true);
        }
      };
      
      // Start immediately
      const timer = setTimeout(introduceAndAsk, 500);
      return () => clearTimeout(timer);
    }
  }, [hasIntroduced, isSpeaking, candidateName, currentQuestion, interviewQuestions, totalQuestions]);

  // Ask next question when currentQuestion changes
  React.useEffect(() => {
    if (hasIntroduced && currentQuestion > 0) {
      const askNextQuestion = async () => {
        setIsReady(false);
        const currentQ = interviewQuestions?.[currentQuestion];
        if (currentQ) {
          await speak(`Question ${currentQuestion + 1}: ${currentQ.question}`);
          setIsReady(true);
        }
      };
      const timer = setTimeout(askNextQuestion, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion]);

  // Repeat question function
  const repeatQuestion = async () => {
    const currentQ = interviewQuestions?.[currentQuestion];
    if (currentQ) {
      await speak(`Let me repeat: ${currentQ.question}`);
    }
  };

  // Text-to-speech function
  const speak = (text) => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: 'url(https://img.freepik.com/premium-photo/professional-zoom-backgrounds-highquality-virtual-backgrounds-video-conferencing_1335648-3.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}></div>
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-semibold text-sm">LIVE INTERVIEW</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Technical Assessment Call</h3>
            <p className="text-gray-700 text-lg mb-2">Question {currentQuestion + 1} of {totalQuestions}</p>
            <p className="text-gray-600 text-sm">{hasIntroduced ? `Time Remaining: ${formatTime(timeRemaining)}` : 'Preparing interview...'}</p>
            <p className="text-gray-900 text-lg mt-4 font-semibold">
              {isSpeaking ? 'Huma is speaking...' :
               isListening ? 'Listening to your response...' : 
               'Tap microphone to respond'}
            </p>
          </div>

          {/* Two Box Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Huma Box */}
            <div className="bg-gradient-to-br from-blue-800/80 to-indigo-800/80 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-blue-600 backdrop-blur-md">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 to-purple-600"></div>
              </div>
              
              {/* Repeat Question Button - Bottom Center */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                <button
                  onClick={repeatQuestion}
                  disabled={!isReady || isSpeaking}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Repeat Question</span>
                </button>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <Lottie animationData={loadingAnimation} className="w-full h-full" loop={true} />
                  </div>
                </div>
                <h4 className="font-bold text-2xl mb-2">HUMA</h4>
                <p className="text-blue-200 text-sm mb-4">AI Interviewer</p>
                {isSpeaking && (
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="text-blue-300 text-sm ml-2">Speaking...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Box */}
            <div className="bg-gradient-to-br from-green-800/80 to-blue-800/80 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-green-600 backdrop-blur-md">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-400 to-blue-600"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-blue-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {candidateInfo?.personalInfo?.profilePicture || candidateInfo?.skillDNA?.personalInfo?.profilePicture ? (
                      <img 
                        src={candidateInfo?.personalInfo?.profilePicture || candidateInfo?.skillDNA?.personalInfo?.profilePicture} 
                        alt={candidateInfo?.personalInfo?.name || candidateInfo?.skillDNA?.personalInfo?.name || candidateName}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-600" />
                    )}
                  </div>
                </div>
                <h4 className="font-bold text-2xl mb-2">{candidateInfo?.personalInfo?.name || candidateInfo?.skillDNA?.personalInfo?.name || candidateName}</h4>
                <p className="text-green-200 text-sm mb-4">Candidate</p>
                {isListening && (
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-red-200 text-sm">Recording...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Call Controls - Centered Microphone */}
          <div className="flex items-center justify-center mb-8">
            <button
              onClick={onMicToggle}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              <Mic className="w-10 h-10 text-white" />
            </button>
          </div>
          
          {/* Clear Button */}
          {currentAnswer.trim() && (
            <div className="flex justify-center mb-8">
              <button
                onClick={onClear}
                className="w-16 h-16 rounded-full bg-gray-600 hover:bg-gray-700 flex items-center justify-center shadow-xl transition-all transform hover:scale-110"
              >
                <span className="text-white text-2xl">×</span>
              </button>
            </div>
          )}

          {/* Live Transcription */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-300 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Live Transcription</h4>
              <div className="text-sm text-gray-600">
                {currentAnswer.length} chars • {currentAnswer.trim().split(' ').filter(w => w).length} words
              </div>
            </div>
            <div className="min-h-[120px] p-4 bg-gray-50 rounded-lg border border-gray-200">
              {currentAnswer ? (
                <p className="text-gray-900 leading-relaxed text-lg">{currentAnswer}</p>
              ) : (
                <p className="text-gray-500 italic text-lg">Your speech will appear here in real-time...</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              {currentAnswer.trim().length < 10 && (
                <p className="text-gray-600 flex items-center space-x-1">
                  <span>Please provide a meaningful response (minimum 10 characters)</span>
                </p>
              )}
              {timeRemaining <= 60 && isReady && (
                <p className="text-gray-900 flex items-center space-x-1 mt-1 font-semibold">
                  <span>Time running out! Answer will auto-submit in {timeRemaining}s</span>
                </p>
              )}
            </div>
            
            <button
              onClick={onSubmit}
              disabled={currentAnswer.trim().length < 10 || !isReady}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center space-x-2 shadow-lg transition-all transform hover:scale-105 text-lg"
            >
              <span>Submit and Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterviewBox;