import React, { useState, useEffect, useRef } from 'react';
import { Clock, User, MessageSquare, ArrowRight, Camera, Mic, AlertCircle, CheckCircle } from 'lucide-react';
import Lottie from 'lottie-react';
import aiAnimation from '../ai-animation-flow.json';
import VoiceInterviewBox from './VoiceInterviewBox';

const TimedCulturalInterview = ({ questions, candidateInfo, onComplete, template }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [interviewPhase, setInterviewPhase] = useState('text');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Update video when camera is enabled
  useEffect(() => {
    if (cameraEnabled && mediaStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(e => console.log('Play error:', e));
    }
  }, [cameraEnabled]);

  // Speak introduction when interview starts
  useEffect(() => {
    if (setupComplete && interviewPhase === 'text') {
      speak(`Hello ${candidateName}! I'm Huma, your AI interviewer. I've carefully analyzed your resume and I'm impressed with your background. Let's begin with some cultural questions to understand your work style and team fit better.`);
    }
  }, [setupComplete, interviewPhase]);

  // Reattach video stream when setup is complete
  useEffect(() => {
    if (setupComplete && mediaStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(e => console.log('Play error:', e));
    }
  }, [setupComplete]);

  // Check template type to determine interview phase
  useEffect(() => {
    if (template) {
      const templateType = template.interviewType?.toLowerCase() || '';
      if (templateType === 'mixed') {
        setInterviewPhase('text');
      } else if (templateType === 'technical') {
        setInterviewPhase('voice');
      } else {
        setInterviewPhase('text');
      }
    } else {
      setInterviewPhase('text');
    }
  }, [template]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setCurrentAnswer(transcript);
      };

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-to-speech
  const speak = (text) => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      window.speechSynthesis.speak(utterance);
    });
  };

  const culturalQuestions = [
    { question: "Tell me about yourself and your background.", type: "basic", timeLimit: 300 },
    { question: "What interests you about this role and our company culture?", type: "cultural", timeLimit: 240 },
    { question: "How do you handle working in a team environment?", type: "behavioral", timeLimit: 180 }
  ];

  const voiceQuestions = [
    { question: "Explain the difference between let, const, and var in JavaScript.", type: "technical", timeLimit: 240 },
    { question: "How would you implement a feature using your preferred technology?", type: "technical", timeLimit: 300 },
    { question: "Describe your approach to debugging a complex application issue.", type: "technical", timeLimit: 240 }
  ];

  // Filter questions based on interview phase and type
  let interviewQuestions = [];
  
  if (questions && questions.length > 0) {
    if (interviewPhase === 'text') {
      // Text phase: behavioral, cultural-fit, leadership questions
      interviewQuestions = questions.filter(q => 
        q.type === 'text' || 
        q.category === 'behavioral' || 
        q.category === 'cultural-fit' || 
        q.category === 'leadership'
      );
    } else {
      // Voice phase: technical, problem-solving, communication questions
      interviewQuestions = questions.filter(q => 
        q.type === 'voice' || 
        q.category === 'technical' || 
        q.category === 'problem-solving' || 
        q.category === 'communication'
      );
    }
  }
  
  // Fallback to default questions if filtering results in empty array
  if (interviewQuestions.length === 0) {
    interviewQuestions = interviewPhase === 'text' ? culturalQuestions : voiceQuestions;
  }
  
  console.log('📊 Interview Phase:', interviewPhase);
  console.log('📝 All Questions:', questions?.length || 0);
  console.log('📝 Filtered Questions:', interviewQuestions.length);
  console.log('🎯 Questions:', interviewQuestions.map(q => ({ question: q.question, category: q.category, type: q.type })));
  
  const totalQuestions = interviewQuestions.length;
  const progress = Math.round(((currentQuestion + 1) / totalQuestions) * 100);

  // Timer countdown - starts immediately when setup is complete
  useEffect(() => {
    if (setupComplete) {
      const currentQ = interviewQuestions[currentQuestion];
      if (currentQ) {
        setTimeRemaining(currentQ.timeLimit || 300);
        
        timerRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              handleAutoSubmit();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestion, setupComplete]);



  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showScreenShareError, setShowScreenShareError] = useState(false);
  const [showReadyModal, setShowReadyModal] = useState(false);

  const enableCamera = async () => {
    try {
      console.log('🎥 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      console.log('✅ Camera stream obtained');
      mediaStreamRef.current = stream;
      setCameraEnabled(true);
      setMicEnabled(true);
    } catch (error) {
      console.error('❌ Media access denied:', error);
      alert('Camera and microphone access required for interview');
    }
  };

  const enableScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      const track = stream.getVideoTracks()[0];
      track.onended = () => {
        setShowViolationModal(true);
        setScreenShared(false);
      };
      
      setScreenShared(true);
    } catch (error) {
      setShowScreenShareError(true);
    }
  };

  const handleSubmit = () => {
    if (currentAnswer.trim().length < 10) {
      alert('Please provide at least 10 characters for a meaningful response');
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    submitAnswer(currentAnswer.trim());
  };

  const handleAutoSubmit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    submitAnswer(currentAnswer.trim() || 'No answer provided', true);
  };

  const submitAnswer = (answer, autoSubmitted = false) => {
    const newAnswer = {
      question: interviewQuestions[currentQuestion].question,
      type: interviewQuestions[currentQuestion].type,
      answer: answer,
      timeSpent: (interviewQuestions[currentQuestion].timeLimit || 300) - timeRemaining,
      wordCount: answer.split(' ').filter(w => w).length,
      autoSubmitted
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeRemaining(interviewQuestions[currentQuestion + 1]?.timeLimit || 300);
    } else {
      if (interviewPhase === 'text' && template?.interviewType === 'mixed') {
        const voiceQs = questions?.filter(q => q.category === 'technical' || q.category === 'problem-solving' || q.category === 'communication') || voiceQuestions;
        if (voiceQs.length > 0) {
          console.log('🔄 Switching to voice phase with', voiceQs.length, 'questions');
          setInterviewPhase('voice');
          setCurrentQuestion(0);
          setCurrentAnswer('');
          return;
        }
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
      onComplete(newAnswers);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 120) return 'text-green-600';
    if (timeRemaining > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const candidateName = candidateInfo?.personalInfo?.name || candidateInfo?.skillDNA?.personalInfo?.name || 'Candidate';

  if (!setupComplete) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6">
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: 'url(https://mblogthumb-phinf.pstatic.net/MjAyMTA0MDJfMjI2/MDAxNjE3MzM1NjgyMDM1.ualXDXMxD8ZMeP5kpdvKYsrTX1JHHpAo5v9SZDbyjhYg.234M35XrEpG5RTLZmeEChYOPKh-x0OB-sAmP9My1v5Mg.JPEG.kimky0302/Zoom_BG4_Bright-Office.jpg?type=w800)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Interview Proctoring Setup</h2>
            <p className="text-gray-700 text-lg">
              Enable security features for a professional interview experience
            </p>
          </div>
          
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
              cameraEnabled 
                ? 'bg-green-50 border-green-300 shadow-lg' 
                : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Camera className={`w-8 h-8 ${
                    cameraEnabled ? 'text-green-600' : 'text-gray-500'
                  }`} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Camera Access</h3>
                    <p className="text-gray-600">Required for video proctoring and identity verification</p>
                  </div>
                </div>
                {cameraEnabled ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 font-bold">ACTIVE</span>
                  </div>
                ) : (
                  <button 
                    onClick={enableCamera}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
                  >
                    Enable Camera
                  </button>
                )}
              </div>
            </div>

            <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
              screenShared 
                ? 'bg-green-50 border-green-300 shadow-lg' 
                : cameraEnabled 
                ? 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:shadow-md' 
                : 'bg-gray-100 border-gray-200 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <AlertCircle className={`w-8 h-8 ${
                    screenShared ? 'text-green-600' : cameraEnabled ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Screen Sharing</h3>
                    <p className="text-gray-600">Prevents tab switching and ensures interview integrity</p>
                  </div>
                </div>
                {screenShared ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 font-bold">SHARING</span>
                  </div>
                ) : (
                  <button 
                    onClick={enableScreenShare}
                    disabled={!cameraEnabled}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enable Sharing
                  </button>
                )}
              </div>
            </div>
          </div>

          {cameraEnabled && (
            <div className="mt-8 p-6 bg-gray-900 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-bold text-lg">Camera Preview</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm font-semibold">LIVE</span>
                </div>
              </div>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted 
                className="w-full h-48 bg-gray-800 rounded-xl object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
          )}

          <div className="mt-8 text-center">
            {cameraEnabled && micEnabled && screenShared ? (
              <button
                onClick={() => setShowReadyModal(true)}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105"
              >
                START INTERVIEW
              </button>
            ) : (
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-bold text-blue-900 mb-2">Setup Required</h4>
                <p className="text-blue-700">
                  Please enable all proctoring features above to continue with your interview.
                </p>
              </div>
            )}
          </div>
          
          {/* Custom Ready Modal */}
          {showReadyModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Start Interview?</h3>
                  <p className="text-gray-600 mb-6">
                    This will begin the interview process. Make sure you are ready and in a quiet environment.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowReadyModal(false)}
                      className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowReadyModal(false);
                        setSetupComplete(true);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all"
                    >
                      Let's Begin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Violation Warning Modal */}
          {showViolationModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Screen Sharing Stopped!</h3>
                  <p className="text-gray-600 mb-6">
                    This is a violation of interview integrity. Screen sharing must remain active throughout the interview.
                  </p>
                  <button
                    onClick={() => setShowViolationModal(false)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Screen Share Error Modal */}
          {showScreenShareError && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Screen Sharing Required</h3>
                  <p className="text-gray-600 mb-6">
                    Screen sharing is mandatory for interview integrity. Please enable it to continue.
                  </p>
                  <button
                    onClick={() => setShowScreenShareError(false)}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (interviewPhase === 'voice') {
    return (
      <VoiceInterviewBox
        candidateName={candidateName}
        candidateInfo={candidateInfo}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        currentAnswer={currentAnswer}
        isListening={isListening}
        isSpeaking={isSpeaking}
        timeRemaining={timeRemaining}
        interviewQuestions={interviewQuestions}
        onMicToggle={() => {
          if (isListening) {
            recognitionRef.current?.stop();
          } else {
            recognitionRef.current?.start();
          }
        }}
        onClear={() => {
          setCurrentAnswer('');
          window.speechSynthesis.cancel();
          recognitionRef.current?.stop();
        }}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6" style={{
      backgroundImage: 'url(https://www.active-note.jp/wp-content/uploads/2024/04/16cd20d6b72550380e558bd1d8838a83-jpg.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-xl p-6 mb-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg overflow-hidden bg-white">
                <Lottie animationData={aiAnimation} className="w-20 h-20" loop={true} />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HUMA</h2>
                <p className="text-sm text-gray-600 font-semibold">AI INTERVIEWER</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-semibold">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div>
                <p className="text-sm text-gray-500">Interview Progress</p>
                <p className="text-lg font-bold text-gray-900">Questions</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{currentQuestion + 1}/{totalQuestions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time Remaining</p>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className={`text-lg font-bold ${getTimeColor()}`}>{formatTime(timeRemaining)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Words Typed</p>
                <p className="text-lg font-bold text-gray-900">{currentAnswer.trim().split(' ').filter(w => w).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Camera Feed</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600 font-semibold">RECORDING</span>
                </div>
              </div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 bg-gray-900 rounded-lg object-cover mb-4 shadow-lg"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-semibold">Camera Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 font-semibold">Microphone Recording</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CULTURAL INTERVIEW
                  </h3>
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800 rounded-full text-sm font-semibold border border-purple-200">
                    Cultural & Behavioral Assessment
                  </span>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Question {currentQuestion + 1} of {totalQuestions}</span>
                    <span>{progress}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden bg-white">
                    <Lottie animationData={aiAnimation} className="w-16 h-16" loop={true} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HUMA</span>
                      <span className="text-sm text-gray-500">AI Interviewer</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Hello {candidateName}! I'm Huma, your AI interviewer. I've carefully analyzed your resume and I'm impressed with your background. Let's begin with some cultural questions to understand your work style and team fit better.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => speak(`Hello ${candidateName}! I'm Huma, your AI interviewer. I've carefully analyzed your resume and I'm impressed with your background. Let's begin with some cultural questions to understand your work style and team fit better.`)}
                  className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center space-x-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Repeat Introduction</span>
                </button>
              </div>

              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800 rounded-full text-sm font-semibold border border-purple-200">
                    {interviewQuestions[currentQuestion]?.type || 'general'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Time limit: {Math.floor((interviewQuestions[currentQuestion]?.timeLimit || 300) / 60)} minutes
                  </span>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Question {currentQuestion + 1}
                </h4>
                <p className="text-xl text-gray-800 leading-relaxed mb-4">
                  {interviewQuestions[currentQuestion]?.question || 'Loading question...'}
                </p>
                <button
                  onClick={() => speak(interviewQuestions[currentQuestion]?.question || '')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold flex items-center space-x-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Repeat Question</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <div className="text-sm text-gray-500 mb-3">
                    {currentAnswer.length} chars • {currentAnswer.trim().split(' ').filter(w => w).length} words
                  </div>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Share your thoughts in detail. Take your time to craft a comprehensive response..."
                    className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 shadow-sm bg-white"
                    maxLength={2000}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {currentAnswer.trim().length < 10 && (
                      <p className="text-sm text-orange-600 flex items-center space-x-1">
                        <span>💡</span>
                        <span>Please provide at least 10 characters for a meaningful response</span>
                      </p>
                    )}
                    {timeRemaining <= 60 && (
                      <p className="text-sm text-red-600 flex items-center space-x-1 mt-1">
                        <span>⏰</span>
                        <span>Time running out! Answer will auto-submit in {timeRemaining}s</span>
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={currentAnswer.trim().length < 10}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center space-x-2 shadow-lg transition-all transform hover:scale-105"
                  >
                    <span>
                      {currentQuestion < totalQuestions - 1 ? 'Continue to Next Question' : 'Complete Cultural Interview'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-purple-900 mb-1">Pro Tip</h5>
                    <p className="text-sm text-purple-800">
                      Detailed, authentic responses help our AI understand your cultural fit and work style better.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimedCulturalInterview;