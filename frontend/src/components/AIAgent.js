import React, { useState, useEffect, useRef } from 'react';
import { Video, Monitor, Mic, CheckCircle, Shield, AlertCircle, Phone, PhoneOff, Brain, Zap, Code, Database, Server, Globe } from 'lucide-react';
import axios from 'axios';

const AdvancedAIAgent = ({ candidateId, questions, candidateInfo, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [conversationLog, setConversationLog] = useState([]);
  const [callStatus, setCallStatus] = useState('INACTIVE'); // INACTIVE, CONNECTING, ACTIVE, FINISHED
  
  // Proctoring
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const [conversationStarted, setConversationStarted] = useState(false);

  // Dynamic question generation based on tech stack
  const generateDynamicQuestion = (techSkills, questionIndex) => {
    const skillsLower = techSkills.map(skill => skill.toLowerCase());
    
    const questionBank = {
      react: [
        "Explain React hooks and their lifecycle. How do useState and useEffect work?",
        "How would you optimize a React app with performance issues?"
      ],
      javascript: [
        "Explain closures in JavaScript with a practical example.",
        "What's the difference between let, const, and var?"
      ],
      python: [
        "Explain the difference between lists and tuples in Python.",
        "How do you handle memory management in Python?"
      ],
      java: [
        "Explain object-oriented programming concepts in Java.",
        "How does garbage collection work in Java?"
      ],
      sql: [
        "How would you optimize a slow SQL query?",
        "Explain ACID properties in database transactions."
      ],
      dsa: [
        "Explain time and space complexity with examples.",
        "How do you implement a binary search tree?"
      ],
      system: [
        "How would you design a scalable chat application?",
        "Explain microservices architecture and its benefits."
      ]
    };
    
    // Select questions based on skills
    let selectedQuestions = [];
    
    if (questionIndex === 0) {
      if (skillsLower.some(s => s.includes('react'))) selectedQuestions = questionBank.react;
      else if (skillsLower.some(s => s.includes('javascript'))) selectedQuestions = questionBank.javascript;
      else if (skillsLower.some(s => s.includes('python'))) selectedQuestions = questionBank.python;
      else if (skillsLower.some(s => s.includes('java'))) selectedQuestions = questionBank.java;
      else selectedQuestions = questionBank.javascript;
    } else if (questionIndex === 1) {
      if (skillsLower.some(s => s.includes('sql'))) selectedQuestions = questionBank.sql;
      else selectedQuestions = questionBank.dsa;
    } else {
      selectedQuestions = questionBank.system;
    }
    
    return selectedQuestions[Math.floor(Math.random() * selectedQuestions.length)];
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setCurrentAnswer(transcript);
      };

      recognition.onend = () => {
        if (conversationStarted && !aiSpeaking && isListening) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {}
          }, 200);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

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
      
      console.log('✅ Camera stream obtained:', stream.getVideoTracks());
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        
        // Force play immediately
        try {
          await videoRef.current.play();
          console.log('✅ Video playing');
        } catch (playError) {
          console.log('⚠️ Auto-play blocked, trying on user interaction');
          videoRef.current.onclick = () => videoRef.current.play();
        }
      }
      
      mediaStreamRef.current = stream;
      setCameraEnabled(true);
      setMicEnabled(true);
      console.log('✅ Camera enabled successfully');
    } catch (error) {
      console.error('❌ Camera error:', error);
      alert('Camera/Microphone access required for interview!');
    }
  };

  const enableScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setScreenShared(true);
    } catch (error) {
      alert('Screen sharing required for interview!');
    }
  };

  const addToLog = (speaker, text) => {
    setConversationLog(prev => [...prev, { speaker, text, time: new Date().toLocaleTimeString() }]);
  };

  const startCall = async () => {
    setCallStatus('CONNECTING');
    
    setTimeout(() => {
      setCallStatus('ACTIVE');
      setConversationStarted(true);
      
      // Start interview with dynamic questions
      setTimeout(() => {
        const name = candidateInfo?.personalInfo?.name || 'Candidate';
        const skills = (candidateInfo?.technicalSkills || []).slice(0, 2).join(' and ') || 'programming';
        
        // Generate dynamic first question
        const dynamicQuestion = generateDynamicQuestion(candidateInfo?.technicalSkills || [], 0);
        const text = `Hello ${name}! I'm Huma, your AI interviewer. I've reviewed your ${skills} experience. Let's begin with your first question: ${dynamicQuestion}`;
        
        addToLog('Huma', text);
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.volume = 1.0;
        
        utterance.onstart = () => setAiSpeaking(true);
        utterance.onend = () => {
          setAiSpeaking(false);
          setIsListening(true);
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        };
        
        window.speechSynthesis.speak(utterance);
      }, 1000);
    }, 2000);
  };

  const endCall = () => {
    setCallStatus('FINISHED');
    setConversationStarted(false);
    setIsListening(false);
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) return;
    
    addToLog('You', currentAnswer);
    
    const newAnswers = [...answers, {
      question: questions[currentQuestion].question,
      answer: currentAnswer,
      type: questions[currentQuestion].type
    }];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    
    if (currentQuestion < questions.length - 1) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      
      // Generate dynamic next question
      const dynamicNextQuestion = generateDynamicQuestion(candidateInfo?.technicalSkills || [], nextQ);
      const nextText = `Thank you. Next question: ${dynamicNextQuestion}`;
      addToLog('Huma', nextText);
      
      const utterance = new SpeechSynthesisUtterance(nextText);
      utterance.rate = 0.9;
      utterance.onstart = () => setAiSpeaking(true);
      utterance.onend = () => {
        setAiSpeaking(false);
        setIsListening(true);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // Interview complete
      const completion = "Excellent! We've completed the interview. Thank you for your time.";
      addToLog('Huma', completion);
      
      const utterance = new SpeechSynthesisUtterance(completion);
      utterance.onend = () => {
        setTimeout(() => {
          endCall();
          onComplete && onComplete();
        }, 2000);
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!cameraEnabled || !micEnabled || !screenShared) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6">
        {/* Background Image */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        
        <div className="max-w-2xl w-full relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-l from-white to-[#CAC5FE] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Shield className="w-10 h-10 text-[#08090D]" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Interview Proctoring Setup</h1>
            <p className="text-[#CAC5FE] text-lg">Enable security features for a professional interview experience</p>
          </div>

          {/* Main Card */}
          <div className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] rounded-2xl shadow-2xl p-8 border border-[#4B4D4F]">
            <div className="space-y-6">
              {/* Camera Setup */}
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                cameraEnabled 
                  ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20' 
                  : 'bg-[#1A1C20] border-[#4B4D4F] hover:border-[#CAC5FE]/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      cameraEnabled ? 'bg-green-500' : 'bg-[#CAC5FE]'
                    }`}>
                      <Video className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Camera Access</h3>
                      <p className="text-[#CAC5FE]">Required for video proctoring and identity verification</p>
                      {cameraEnabled && (
                        <p className="text-green-400 text-sm font-semibold mt-1 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Camera successfully enabled
                        </p>
                      )}
                    </div>
                  </div>
                  {cameraEnabled ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-bold text-lg">ACTIVE</span>
                    </div>
                  ) : (
                    <button 
                      onClick={enableCamera} 
                      className="bg-[#CAC5FE] hover:bg-[#CAC5FE]/80 text-[#08090D] px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
                    >
                      Enable Camera
                    </button>
                  )}
                </div>
              </div>

              {/* Microphone Setup */}
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                micEnabled 
                  ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20' 
                  : cameraEnabled 
                  ? 'bg-[#1A1C20] border-[#4B4D4F]' 
                  : 'bg-[#1A1C20] border-[#4B4D4F] opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      micEnabled ? 'bg-green-500' : cameraEnabled ? 'bg-orange-500' : 'bg-gray-500'
                    }`}>
                      <Mic className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Microphone Access</h3>
                      <p className="text-[#CAC5FE]">Required for voice responses and audio monitoring</p>
                      {micEnabled && (
                        <p className="text-green-400 text-sm font-semibold mt-1 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Microphone successfully enabled
                        </p>
                      )}
                    </div>
                  </div>
                  {micEnabled ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-bold text-lg">ACTIVE</span>
                    </div>
                  ) : (
                    <div className="text-[#CAC5FE] font-semibold">
                      {cameraEnabled ? 'Auto-enabled with camera' : 'Waiting for camera'}
                    </div>
                  )}
                </div>
              </div>

              {/* Screen Share Setup */}
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                screenShared 
                  ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20' 
                  : cameraEnabled 
                  ? 'bg-[#1A1C20] border-[#4B4D4F] hover:border-[#CAC5FE]/50' 
                  : 'bg-[#1A1C20] border-[#4B4D4F] opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      screenShared ? 'bg-green-500' : cameraEnabled ? 'bg-purple-500' : 'bg-gray-500'
                    }`}>
                      <Monitor className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Screen Sharing</h3>
                      <p className="text-[#CAC5FE]">Prevents tab switching and ensures interview integrity</p>
                      {screenShared && (
                        <p className="text-green-400 text-sm font-semibold mt-1 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Screen sharing active
                        </p>
                      )}
                    </div>
                  </div>
                  {screenShared ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-bold text-lg">SHARING</span>
                    </div>
                  ) : (
                    <button 
                      onClick={enableScreenShare} 
                      disabled={!cameraEnabled}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enable Sharing
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Camera Preview */}
            {cameraEnabled && (
              <div className="mt-8 p-6 bg-[#08090D] rounded-2xl border border-[#4B4D4F]">
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
                  className="w-full h-64 bg-[#1A1C20] rounded-xl object-cover shadow-inner"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              {cameraEnabled && micEnabled && screenShared ? (
                <>
                  <button 
                    onClick={() => {
                      window.speechSynthesis.cancel();
                      const msg = new SpeechSynthesisUtterance('Hello! I am Huma, your professional AI interviewer. Voice system is working perfectly.');
                      msg.rate = 0.9;
                      msg.onstart = () => console.log('✅ Voice working!');
                      msg.onend = () => alert('✅ Perfect! Huma is ready to interview you.');
                      window.speechSynthesis.speak(msg);
                    }} 
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105"
                  >
                    Test Huma's Voice
                  </button>
                  <button 
                    onClick={startCall}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105"
                  >
                    START INTERVIEW
                  </button>
                </>
              ) : (
                <div className="text-center p-6 bg-[#1A1C20] rounded-xl border border-[#4B4D4F]">
                  <AlertCircle className="w-12 h-12 text-[#CAC5FE] mx-auto mb-3" />
                  <h4 className="font-bold text-white mb-2">Setup Required</h4>
                  <p className="text-[#CAC5FE]">
                    Please enable all proctoring features above to continue with your interview.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-6">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Call View */}
        <div className="flex sm:flex-row flex-col gap-10 items-center justify-between w-full mb-8">
          {/* AI Interviewer Card */}
          <div className="flex flex-col items-center gap-4 p-8 h-[420px] bg-gradient-to-b from-[#171532] to-[#08090D] rounded-2xl border-2 border-[#CAC5FE]/50 flex-1 sm:basis-1/2 w-full relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <Code className="absolute top-4 left-4 w-6 h-6 text-[#CAC5FE]" />
              <Database className="absolute top-8 right-8 w-5 h-5 text-[#CAC5FE]" />
              <Server className="absolute bottom-8 left-8 w-5 h-5 text-[#CAC5FE]" />
              <Globe className="absolute bottom-4 right-4 w-6 h-6 text-[#CAC5FE]" />
            </div>
            
            {/* AI Avatar */}
            <div className="z-10 flex items-center justify-center bg-gradient-to-br from-[#CAC5FE] via-white to-[#CAC5FE] rounded-full size-[140px] relative shadow-2xl">
              <div className="absolute inset-2 bg-gradient-to-br from-[#171532] to-[#08090D] rounded-full flex items-center justify-center">
                <Brain className="w-16 h-16 text-[#CAC5FE]" />
              </div>
              {aiSpeaking && (
                <>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#CAC5FE] opacity-30" />
                  <span className="absolute inline-flex size-5/6 animate-pulse rounded-full bg-[#CAC5FE] opacity-20" />
                </>
              )}
            </div>
            
            {/* AI Info */}
            <div className="text-center z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Huma</h3>
              <p className="text-[#CAC5FE] text-sm mb-3">AI HR Interviewer</p>
              
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                callStatus === 'CONNECTING' ? 'bg-yellow-500/20 border border-yellow-500' :
                callStatus === 'ACTIVE' && aiSpeaking ? 'bg-green-500/20 border border-green-500' :
                callStatus === 'ACTIVE' && isListening ? 'bg-blue-500/20 border border-blue-500' :
                'bg-[#CAC5FE]/20 border border-[#CAC5FE]'
              }`}>
                {callStatus === 'CONNECTING' && <Zap className="w-4 h-4 text-yellow-400 animate-spin" />}
                {callStatus === 'ACTIVE' && aiSpeaking && <Mic className="w-4 h-4 text-green-400" />}
                {callStatus === 'ACTIVE' && isListening && <Phone className="w-4 h-4 text-blue-400" />}
                {callStatus === 'INACTIVE' && <Brain className="w-4 h-4 text-[#CAC5FE]" />}
                
                <span className={`text-sm font-bold ${
                  callStatus === 'CONNECTING' ? 'text-yellow-400' :
                  callStatus === 'ACTIVE' && aiSpeaking ? 'text-green-400' :
                  callStatus === 'ACTIVE' && isListening ? 'text-blue-400' :
                  'text-[#CAC5FE]'
                }`}>
                  {callStatus === 'CONNECTING' ? 'Connecting...' :
                   callStatus === 'ACTIVE' && aiSpeaking ? 'Speaking' :
                   callStatus === 'ACTIVE' && isListening ? 'Listening' :
                   'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="border-gradient p-0.5 rounded-2xl flex-1 sm:basis-1/2 w-full h-[400px] max-md:hidden">
            <div className="flex flex-col gap-2 justify-center items-center p-7 bg-gradient-to-b from-[#1A1C20] to-[#08090D] rounded-2xl min-h-full">
              <img
                src="/user-avatar.jpg"
                alt="profile-image"
                className="rounded-full object-cover size-[120px]"
              />
              <h3 className="text-center text-[#CAC5FE] mt-5 text-2xl font-semibold">
                {candidateInfo?.personalInfo?.name || 'Candidate'}
              </h3>
            </div>
          </div>
        </div>

        {/* Transcript */}
        {conversationLog.length > 0 && (
          <div className="border-gradient p-0.5 rounded-2xl w-full mb-8">
            <div className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] rounded-2xl min-h-12 px-5 py-3 flex items-center justify-center">
              <p className="text-lg text-center text-white animate-fadeIn">
                {conversationLog[conversationLog.length - 1]?.text}
              </p>
            </div>
          </div>
        )}

        {/* Current Answer Display */}
        {currentAnswer && (
          <div className="border-gradient p-0.5 rounded-2xl w-full mb-8">
            <div className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] rounded-2xl min-h-12 px-5 py-3 flex items-center justify-center">
              <p className="text-lg text-center text-blue-400">
                You: "{currentAnswer}"
              </p>
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="w-full flex justify-center relative">
          {callStatus !== 'ACTIVE' ? (
            <button 
              className="inline-block px-7 py-3 font-bold text-xl leading-5 text-white transition-colors duration-150 bg-green-500 border border-transparent rounded-full shadow-sm focus:outline-none focus:shadow-2xl active:bg-green-600 hover:bg-green-600 min-w-28 cursor-pointer items-center justify-center overflow-visible"
              onClick={startCall}
            >
              <span className="relative">
                {callStatus === 'INACTIVE' || callStatus === 'FINISHED'
                  ? 'Call'
                  : <span className="dots-loading">. . .</span>}
              </span>
            </button>
          ) : (
            <div className="flex gap-4">
              <button 
                className="inline-block px-7 py-3 text-sm font-bold leading-5 text-white transition-colors duration-150 bg-red-500 border border-transparent rounded-full shadow-sm focus:outline-none focus:shadow-2xl active:bg-red-600 hover:bg-red-600 min-w-28"
                onClick={endCall}
              >
                End
              </button>
              {currentAnswer.trim() && !aiSpeaking && (
                <button
                  onClick={handleSubmit}
                  className="inline-block px-7 py-3 text-sm font-bold leading-5 text-white transition-colors duration-150 bg-blue-500 border border-transparent rounded-full shadow-sm focus:outline-none focus:shadow-2xl active:bg-blue-600 hover:bg-blue-600 min-w-28"
                >
                  Submit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {callStatus === 'ACTIVE' && (
          <div className="mt-8 text-center">
            <div className="text-[#CAC5FE] mb-2">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="w-full bg-[#1A1C20] rounded-full h-1.5">
              <div 
                className="h-1.5 bg-[#CAC5FE] rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .border-gradient {
          background: linear-gradient(to bottom, #4B4D4F, #4B4D4F33);
        }
        .dots-loading {
          display: inline-block;
          width: 30px;
          text-align: left;
          animation: dotsAnimation 1.2s infinite steps(1);
        }
        @keyframes dotsAnimation {
          0% { clip-path: inset(0 66% 0 0); }
          33% { clip-path: inset(0 33% 0 0); }
          66% { clip-path: inset(0 0% 0 0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedAIAgent;