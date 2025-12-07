import React, { useState, useEffect, useRef } from 'react';
import { Video, Monitor, AlertTriangle, TrendingUp, Brain, Sparkles, Mic } from 'lucide-react';
import axios from 'axios';

const EnhancedAIAgent = ({ candidateId, questions, candidateInfo, onComplete }) => {
  // PHASE SYSTEM: TEXT FIRST, THEN VOICE
  const [interviewPhase, setInterviewPhase] = useState('text'); // 'text' or 'voice'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [conversationLog, setConversationLog] = useState([]);
  
  // Proctoring
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [cheatingDetected, setCheatingDetected] = useState([]);
  
  // Voice metrics
  const [voiceMetrics, setVoiceMetrics] = useState({
    pauseDuration: 0,
    speechRate: 150,
    volumeVariation: 0.5,
    pitchVariation: 0.5
  });
  
  // Confidence tracking
  const [confidenceTimeline, setConfidenceTimeline] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const [conversationStarted, setConversationStarted] = useState(false);

  const showCompletionNotification = () => {
    setShowCompletionModal(true);
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Continuous listening
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setCurrentAnswer(transcript);
        
        // Calculate speech metrics
        if (startTimeRef.current) {
          const duration = (Date.now() - startTimeRef.current) / 1000;
          const wordCount = transcript.split(' ').length;
          const speechRate = (wordCount / duration) * 60;
          
          setVoiceMetrics(prev => ({
            ...prev,
            speechRate: Math.round(speechRate),
            pauseDuration: duration > 5 ? Math.round(duration - 5) : 0
          }));
        }
      };

      recognition.onend = () => {
        // Auto-restart if conversation started and AI not speaking
        if (conversationStarted) {
          setTimeout(() => {
            if (!aiSpeaking) {
              try {
                recognition.start();
              } catch (e) {
                console.log('Recognition restart failed:', e);
              }
            }
          }, 200);
        }
      };
      
      recognition.onerror = (event) => {
        console.log('Recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Ignore no-speech errors
          return;
        }
      };

      recognitionRef.current = recognition;
    }

    // Anti-cheating: detect page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopAllMedia();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleVisibilityChange = () => {
    if (document.hidden && conversationStarted) {
      const violation = {
        type: 'Tab Switch Detected',
        time: new Date().toLocaleTimeString()
      };
      setCheatingDetected(prev => [...prev, violation]);
      
      // STRICT: Auto-fail after 2 violations
      if (cheatingDetected.length >= 1) {
        window.speechSynthesis.cancel();
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        alert('⚠️ INTERVIEW TERMINATED\n\nMultiple tab switches detected.\nYou have been disqualified for violating interview rules.');
        stopAllMedia();
        // Auto-submit with rejection
        setTimeout(async () => {
          try {
            await axios.post('http://localhost:5001/api/analysis/interview', {
              candidateId,
              responses: answers,
              proctoringData: { 
                cameraEnabled, 
                microphoneEnabled: micEnabled, 
                screenShared,
                violations: [...cheatingDetected, violation],
                disqualified: true,
                reason: 'Multiple tab switches - Cheating detected'
              }
            });
          } catch (error) {
            console.error('Error:', error);
          }
          window.location.href = '/';
        }, 2000);
      } else {
        // Warning for first violation
        speakText('Warning! Tab switch detected. One more violation will terminate your interview.');
      }
    }
  };

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaStreamRef.current = stream;
      setCameraEnabled(true);
      setMicEnabled(true);
    } catch (error) {
      alert('Camera/Microphone required!');
    }
  };

  const enableScreenShare = async () => {
    try {
      await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenShared(true);
    } catch (error) {
      alert('Screen sharing required!');
    }
  };

  const stopAllMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
  };

  const speakText = (text) => {
    return new Promise((resolve) => {
      console.log('🔊 Attempting to speak:', text.substring(0, 40));
      
      if (!('speechSynthesis' in window)) {
        console.error('❌ Speech not supported');
        resolve();
        return;
      }
      
      // Stop listening
      if (recognitionRef.current && conversationStarted) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';
        
        utterance.onstart = () => {
          console.log('✅ SPEAKING NOW');
          setAiSpeaking(true);
        };
        
        utterance.onend = () => {
          console.log('✅ FINISHED');
          setAiSpeaking(false);
          
          if (conversationStarted && recognitionRef.current) {
            setTimeout(() => {
              try {
                recognitionRef.current.start();
              } catch (e) {}
            }, 500);
          }
          
          resolve();
        };
        
        utterance.onerror = (e) => {
          console.error('❌ Speech error:', e);
          setAiSpeaking(false);
          resolve();
        };
        
        console.log('🚀 Calling speak()');
        window.speechSynthesis.speak(utterance);
        console.log('📊 Speaking:', window.speechSynthesis.speaking);
      }, 200);
    });
  };

  const startTextInterview = () => {
    console.log('📝 Starting TEXT interview...');
    setInterviewPhase('text');
    setConversationStarted(true);
    startTimeRef.current = Date.now();
    
    const name = candidateInfo?.personalInfo?.name || candidateInfo?.name || 'there';
    const skills = candidateInfo?.technicalSkills?.slice(0, 3).join(', ') || 'your skills';
    
    addToLog('Huma', `Hello ${name}! I'm Huma, your AI interviewer. I've reviewed your resume and see you have experience in ${skills}. Let's start with a text-based interview first.`);
  };

  const startVoiceInterview = async () => {
    if (!cameraEnabled || !micEnabled || !screenShared) {
      alert('Enable all proctoring features!');
      return;
    }
    
    console.log('🎤 Starting VOICE interview...');
    setInterviewPhase('voice');
    setIsListening(true);
    
    // IMMEDIATE voice test to activate API
    const testMsg = new SpeechSynthesisUtterance('Starting voice interview');
    testMsg.volume = 0.01; // Almost silent
    window.speechSynthesis.speak(testMsg);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const messages = [
      "Excellent! Now let's move to the technical and stress-related questions.",
      "These will be more challenging and require voice responses.",
      "Feel free to think out loud and explain your reasoning.",
      `Let's continue with a technical question. ${questions[currentQuestion].question}`
    ];
    
    for (const msg of messages) {
      addToLog('Huma', msg);
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      
      await new Promise((resolve) => {
        utterance.onend = resolve;
        utterance.onerror = resolve;
        setAiSpeaking(true);
        window.speechSynthesis.speak(utterance);
        console.log('🔊 Speaking:', msg.substring(0, 30));
      });
      
      setAiSpeaking(false);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Start listening
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log('✅ Listening started');
      } catch (e) {
        console.error('❌ Error:', e);
      }
    }
  };

  const addToLog = (speaker, text) => {
    setConversationLog(prev => [...prev, { speaker, text, time: new Date().toLocaleTimeString() }]);
  };

  const handleTextSubmit = async () => {
    if (!currentAnswer.trim()) return;
    
    addToLog('You', currentAnswer);
    await processAnswer();
  };

  const handleManualSubmit = async () => {
    if (!currentAnswer.trim()) return;
    
    addToLog('You', currentAnswer);
    await processAnswer();
  };

  const calculateConfidence = (answer) => {
    const wordCount = answer.split(' ').length;
    const hasExamples = answer.toLowerCase().includes('example') || answer.toLowerCase().includes('for instance');
    const hasNumbers = /\d/.test(answer);
    
    let confidence = 5;
    if (wordCount > 30) confidence += 2;
    if (hasExamples) confidence += 2;
    if (hasNumbers) confidence += 1;
    if (voiceMetrics.pauseDuration < 3) confidence += 1;
    
    return Math.min(10, confidence);
  };

  const processAnswer = async () => {
    const answer = currentAnswer;
    setCurrentAnswer(''); // Clear for next
    startTimeRef.current = Date.now();

    // Track confidence
    const confidence = calculateConfidence(answer);
    setConfidenceTimeline(prev => [...prev, {
      question: currentQuestion + 1,
      confidence,
      time: new Date().toLocaleTimeString()
    }]);

    // Check if we should ask follow-up
    if (!showFollowUp && Math.random() > 0.5) {
      try {
        const response = await axios.post('http://localhost:5001/api/analysis/followup', {
          answer: answer,
          question: questions[currentQuestion].question,
          candidateId
        });
        
        if (response.data.followUp) {
          setFollowUpQuestion(response.data.followUp);
          setShowFollowUp(true);
          const followUpText = `Interesting. ${response.data.followUp.followUpQuestion}`;
          addToLog('Huma', followUpText);
          await speakText(followUpText);
          return;
        }
      } catch (error) {
        console.error('Follow-up error:', error);
      }
    }

    const newAnswers = [...answers, { 
      question: showFollowUp ? followUpQuestion.followUpQuestion : questions[currentQuestion].question,
      type: questions[currentQuestion].type,
      answer: answer,
      confidence,
      voiceMetrics: {...voiceMetrics}
    }];
    setAnswers(newAnswers);
    setShowFollowUp(false);
    setFollowUpQuestion(null);

    const thanks = "Thank you. That's helpful.";
    addToLog('Huma', thanks);
    
    if (interviewPhase === 'voice') {
      await speakText(thanks);
    }

    if (currentQuestion < questions.length - 1) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      
      // Check if we should switch to voice after basic/cultural questions
      if (interviewPhase === 'text' && nextQ >= 2) {
        const switchMessage = 'Great! You\'ve completed the basic questions. Now let\'s switch to voice interview for technical and stress-related questions.';
        addToLog('Huma', switchMessage);
        await speakText(switchMessage);
        
        setTimeout(async () => {
          setInterviewPhase('voice');
          setIsListening(true);
          
          // Start voice recognition
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
          
          // Speak the next question
          await new Promise(resolve => setTimeout(resolve, 1000));
          const nextText = `Let's continue with a ${questions[nextQ].type} question. ${questions[nextQ].question}`;
          addToLog('Huma', nextText);
          await speakText(nextText);
        }, 3000);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
      const nextText = interviewPhase === 'voice' 
        ? `Next question. ${questions[nextQ].question}` 
        : `Next question. ${questions[nextQ].question}`;
      addToLog('Huma', nextText);
      
      if (interviewPhase === 'voice') {
        await speakText(nextText);
      }
    } else {
      const completion = "Excellent! We've completed the interview. I'm now analyzing your responses. Thank you for your time.";
      addToLog('Huma', completion);
      await speakText(completion);
      setTimeout(async () => {
        try {
          await axios.post('http://localhost:5001/api/analysis/interview', {
            candidateId,
            responses: newAnswers,
            proctoringData: { 
              cameraEnabled, 
              microphoneEnabled: micEnabled, 
              screenShared,
              violations: cheatingDetected,
              voiceMetrics
            },
            voiceMetrics,
            confidenceTimeline
          });
        } catch (error) {
          console.error('Error:', error);
        }
        stopAllMedia();
        
        // Show custom completion notification
        showCompletionNotification();
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 5000);
      }, 2000);
    }
  };

  if (!cameraEnabled || !micEnabled || !screenShared) {
    return (
      <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 8s linear infinite;
        }
      `}</style>
      <div className="min-h-screen flex items-center justify-center p-6" style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 25%, #0f0a1e 50%, #1a0f2e 75%, #0a0a0f 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}>
        <div className="max-w-2xl w-full rounded-3xl p-8 border-2 shadow-2xl" style={{
          background: 'linear-gradient(135deg, rgba(0, 128, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(0, 245, 255, 0.3)',
          boxShadow: '0 0 60px rgba(0, 128, 255, 0.4), inset 0 0 30px rgba(255, 0, 255, 0.1)'
        }}>
          {/* Futuristic AI Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative w-40 h-40 animate-float">
              <div className="absolute inset-0 animate-pulse" style={{
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                background: 'linear-gradient(135deg, #00f5ff 0%, #0080ff 25%, #ff00ff 50%, #ff0080 75%, #00f5ff 100%)',
                boxShadow: '0 0 60px rgba(0, 245, 255, 0.6)'
              }}></div>
              <div className="absolute inset-2 rounded-full border-2 border-cyan-400/40 animate-spin-slow" style={{borderStyle: 'dashed'}}></div>
              <div className="absolute inset-6 rounded-full flex items-center justify-center" style={{
                background: 'radial-gradient(circle at 30% 30%, #0080ff 0%, #0040ff 40%, #1a1a2e 100%)',
                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(0, 128, 255, 0.3)'
              }}>
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-transparent to-pink-500/30 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
                <Sparkles className="w-16 h-16 text-cyan-400 z-10" style={{
                  filter: 'drop-shadow(0 0 25px rgba(0, 245, 255, 1))'
                }} />
              </div>
            </div>
          </div>
          
          <h2 className="text-4xl font-black mb-3 text-center" style={{
            background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(0, 245, 255, 0.5)'
          }}>SETUP PROCTORING</h2>
          <p className="text-cyan-300 mb-8 text-center font-semibold" style={{
            textShadow: '0 0 10px rgba(0, 245, 255, 0.5)'
          }}>
            Enable all features for fair interview
          </p>
          
          <div className="space-y-4 mb-8">
            <div className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all`} style={{
              background: cameraEnabled 
                ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 245, 255, 0.2) 100%)'
                : 'rgba(0, 0, 0, 0.3)',
              borderColor: cameraEnabled ? 'rgba(0, 255, 136, 0.6)' : 'rgba(0, 245, 255, 0.3)',
              boxShadow: cameraEnabled ? '0 0 30px rgba(0, 255, 136, 0.4)' : '0 0 15px rgba(0, 128, 255, 0.2)'
            }}>
              <div className="flex items-center space-x-4">
                <Video className={`w-8 h-8 ${cameraEnabled ? 'text-green-400' : 'text-white/60'}`} />
                <div>
                  <span className="font-bold text-white text-lg">Camera</span>
                  <p className="text-white/60 text-sm">Video proctoring</p>
                </div>
              </div>
              {cameraEnabled ? (
                <span className="text-green-400 font-bold text-xl">✓</span>
              ) : (
                <button onClick={enableCamera} className="px-6 py-3 text-white rounded-xl font-bold transition-all" style={{
                  background: 'linear-gradient(135deg, #0080ff 0%, #00f5ff 100%)',
                  boxShadow: '0 0 20px rgba(0, 128, 255, 0.5)'
                }}>
                  Enable
                </button>
              )}
            </div>

            <div className={`flex items-center justify-between p-6 rounded-2xl border-2 ${
              micEnabled ? 'bg-green-500/20 border-green-500' : 'bg-white/5 border-white/20'
            }`}>
              <div className="flex items-center space-x-4">
                <Mic className={`w-8 h-8 ${micEnabled ? 'text-green-400' : 'text-white/60'}`} />
                <div>
                  <span className="font-bold text-white text-lg">Microphone</span>
                  <p className="text-white/60 text-sm">Voice responses</p>
                </div>
              </div>
              {micEnabled ? <span className="text-green-400 font-bold text-xl">✓</span> : <span className="text-white/60">Enable camera first</span>}
            </div>

            <div className={`flex items-center justify-between p-6 rounded-2xl border-2 ${
              screenShared ? 'bg-green-500/20 border-green-500' : 'bg-white/5 border-white/20'
            }`}>
              <div className="flex items-center space-x-4">
                <Monitor className={`w-8 h-8 ${screenShared ? 'text-green-400' : 'text-white/60'}`} />
                <div>
                  <span className="font-bold text-white text-lg">Screen Share</span>
                  <p className="text-white/60 text-sm">Anti-cheating</p>
                </div>
              </div>
              {screenShared ? (
                <span className="text-green-400 font-bold text-xl">✓</span>
              ) : (
                <button onClick={enableScreenShare} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold" disabled={!cameraEnabled}>
                  Enable
                </button>
              )}
            </div>
          </div>

          {cameraEnabled && (
            <div className="mb-6">
              <video ref={videoRef} autoPlay muted className="w-full rounded-2xl border-2 border-white/20 shadow-xl" />
            </div>
          )}

          {cameraEnabled && micEnabled && screenShared && (
            <div className="space-y-3">
              <button 
                onClick={() => {
                  const msg = new SpeechSynthesisUtterance('Hello! This is Huma. Voice test successful. You can now start the interview.');
                  msg.rate = 1.0;
                  msg.volume = 1.0;
                  msg.onstart = () => {
                    console.log('✅ VOICE WORKING');
                    alert('✅ Voice is working! Now click START AI INTERVIEW');
                  };
                  msg.onerror = (e) => {
                    console.error('❌ Voice failed:', e);
                    alert('❌ Voice not working. Try Chrome browser.');
                  };
                  window.speechSynthesis.speak(msg);
                }} 
                className="w-full py-3 text-white rounded-xl font-bold shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #0080ff 0%, #00f5ff 100%)',
                  boxShadow: '0 0 30px rgba(0, 128, 255, 0.5)'
                }}
              >
                🔊 TEST VOICE (MUST CLICK!)
              </button>
              <button 
                onClick={() => {
                  console.log('🚀 START TEXT INTERVIEW CLICKED');
                  console.log('Questions:', questions);
                  console.log('Candidate Info:', candidateInfo);
                  startTextInterview();
                }} 
                className="w-full py-4 text-white rounded-2xl font-black text-lg shadow-xl transition-all"
                style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00f5ff 100%)',
                  boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)',
                  textShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
                }}
              >
                START TEXT INTERVIEW
              </button>
            </div>
          )}
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <style>{`
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes vibrate {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(-2px, 0) scale(1.05); }
        50% { transform: translate(2px, 0) scale(1.05); }
        75% { transform: translate(0, -2px) scale(1.05); }
      }
      .animate-vibrate {
        animation: vibrate 0.3s ease-in-out infinite;
      }
      @keyframes sound-wave {
        0%, 100% { height: 20px; }
        50% { height: 40px; }
      }
      .animate-sound-wave {
        animation: sound-wave 0.6s ease-in-out infinite;
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin-slow {
        animation: spin-slow 8s linear infinite;
      }
      @keyframes spin-reverse {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
      }
      .animate-spin-reverse {
        animation: spin-reverse 6s linear infinite;
      }
    `}</style>
    <div className="min-h-screen p-6" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 25%, #0f0a1e 50%, #1a0f2e 75%, #0a0a0f 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite'
    }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          {/* Futuristic AI Avatar */}
          <div className="rounded-3xl p-6 border-2" style={{
            background: 'linear-gradient(135deg, rgba(0, 128, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(0, 245, 255, 0.3)',
            boxShadow: '0 0 40px rgba(0, 128, 255, 0.3), inset 0 0 20px rgba(255, 0, 255, 0.1)'
          }}>
            <div className="flex flex-col items-center">
              {/* 3D Animated Avatar */}
              <div className="relative w-56 h-56 mb-6">
                {/* Hexagonal Outer Frame */}
                <div className={`absolute inset-0 transition-all duration-500 ${
                  aiSpeaking ? 'animate-pulse' : ''
                }`} style={{
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                  background: aiSpeaking 
                    ? 'linear-gradient(135deg, #00f5ff 0%, #0080ff 25%, #ff00ff 50%, #ff0080 75%, #00f5ff 100%)'
                    : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                  boxShadow: aiSpeaking 
                    ? '0 0 80px rgba(0, 245, 255, 0.8), inset 0 0 40px rgba(255, 0, 255, 0.3)'
                    : '0 0 40px rgba(0, 128, 255, 0.4)'
                }}></div>
                
                {/* Rotating Rings */}
                <div className="absolute inset-3 rounded-full border-2 border-cyan-400/40 animate-spin-slow" style={{borderStyle: 'dashed'}}></div>
                <div className="absolute inset-6 rounded-full border border-pink-400/30 animate-spin-reverse" style={{borderStyle: 'dotted'}}></div>
                
                {/* Main Avatar Circle */}
                <div className={`absolute inset-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  aiSpeaking ? 'scale-110' : 'scale-100'
                }`} style={{
                  background: aiSpeaking
                    ? 'radial-gradient(circle at 30% 30%, #00f5ff 0%, #0080ff 30%, #ff00ff 60%, #1a1a2e 100%)'
                    : 'radial-gradient(circle at 30% 30%, #0080ff 0%, #0040ff 40%, #1a1a2e 100%)',
                  boxShadow: aiSpeaking
                    ? '0 0 100px rgba(0, 245, 255, 1), inset 0 0 60px rgba(255, 0, 255, 0.5)'
                    : '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(0, 128, 255, 0.3)'
                }}>
                  {/* Holographic Effect */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-transparent to-pink-500/30 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                  </div>
                  
                  {/* AI Core */}
                  <div className="relative z-10 flex items-center justify-center">
                    <Brain className={`w-24 h-24 transition-all duration-500 ${
                      aiSpeaking 
                        ? 'text-cyan-300 drop-shadow-[0_0_30px_rgba(0,245,255,1)]' 
                        : 'text-blue-400 drop-shadow-[0_0_20px_rgba(0,128,255,0.8)]'
                    }`} />
                  </div>
                  
                  {/* Neon Particles */}
                  <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full animate-pulse" style={{
                    background: 'radial-gradient(circle, #00f5ff 0%, transparent 70%)',
                    boxShadow: '0 0 20px #00f5ff'
                  }}></div>
                  <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full animate-pulse" style={{
                    background: 'radial-gradient(circle, #ff00ff 0%, transparent 70%)',
                    boxShadow: '0 0 15px #ff00ff',
                    animationDelay: '0.3s'
                  }}></div>
                  <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full animate-pulse" style={{
                    background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)',
                    boxShadow: '0 0 15px #00ff88',
                    animationDelay: '0.6s'
                  }}></div>
                  <div className="absolute top-1/2 right-1/3 w-2.5 h-2.5 rounded-full animate-pulse" style={{
                    background: 'radial-gradient(circle, #ffff00 0%, transparent 70%)',
                    boxShadow: '0 0 12px #ffff00',
                    animationDelay: '0.9s'
                  }}></div>
                  <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full animate-pulse" style={{
                    background: 'radial-gradient(circle, #ff0080 0%, transparent 70%)',
                    boxShadow: '0 0 10px #ff0080',
                    animationDelay: '1.2s'
                  }}></div>
                </div>
                
                {/* Speaking Indicator - Sound Waves */}
                {aiSpeaking && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
                    <div className="w-1.5 bg-cyan-400 rounded-full animate-sound-wave" style={{height: '16px', animationDelay: '0s'}}></div>
                    <div className="w-1.5 bg-blue-400 rounded-full animate-sound-wave" style={{height: '24px', animationDelay: '0.1s'}}></div>
                    <div className="w-1.5 bg-purple-400 rounded-full animate-sound-wave" style={{height: '20px', animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 bg-pink-400 rounded-full animate-sound-wave" style={{height: '28px', animationDelay: '0.15s'}}></div>
                    <div className="w-1.5 bg-cyan-400 rounded-full animate-sound-wave" style={{height: '22px', animationDelay: '0.25s'}}></div>
                  </div>
                )}
              </div>
              
              <h3 className="text-3xl font-black mb-1" style={{
                background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(0, 245, 255, 0.5)'
              }}>HUMA</h3>
              <p className="text-sm font-bold mb-3" style={{
                color: '#00f5ff',
                textShadow: '0 0 10px rgba(0, 245, 255, 0.8)'
              }}>AI HR INTERVIEWER</p>
              <div className={`px-5 py-2.5 rounded-xl transition-all duration-300 ${
                aiSpeaking 
                  ? 'bg-gradient-to-r from-cyan-500/40 to-pink-500/40 border-2 border-cyan-400' 
                  : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-2 border-blue-400/50'
              }`} style={{
                boxShadow: aiSpeaking 
                  ? '0 0 30px rgba(0, 245, 255, 0.6), inset 0 0 20px rgba(255, 0, 255, 0.3)'
                  : '0 0 15px rgba(0, 128, 255, 0.4)'
              }}>
                <p className={`text-sm font-black tracking-wider ${
                  aiSpeaking ? 'text-cyan-300 animate-pulse' : 'text-blue-300'
                }`} style={{
                  textShadow: aiSpeaking ? '0 0 10px rgba(0, 245, 255, 1)' : '0 0 5px rgba(0, 128, 255, 0.8)'
                }}>
                  {aiSpeaking ? '🔊 SPEAKING...' : '🎤 LISTENING...'}
                </p>
              </div>
            </div>
          </div>

          {/* Cheating Alerts */}
          {cheatingDetected.length > 0 && (
            <div className="rounded-2xl p-4 border-2" style={{
              background: 'rgba(255, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(255, 0, 0, 0.5)',
              boxShadow: '0 0 30px rgba(255, 0, 0, 0.4)'
            }}>
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-bold">VIOLATIONS</span>
              </div>
              {cheatingDetected.slice(-3).map((v, i) => (
                <p key={i} className="text-red-300 text-xs">{v.type} at {v.time}</p>
              ))}
            </div>
          )}
        </div>

        {/* Main Interview Area */}
        <div className="lg:col-span-3 rounded-3xl p-8 border-2" style={{
          background: 'linear-gradient(135deg, rgba(0, 128, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(0, 245, 255, 0.3)',
          boxShadow: '0 0 60px rgba(0, 128, 255, 0.3), inset 0 0 30px rgba(255, 0, 255, 0.05)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black" style={{
              background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(0, 245, 255, 0.5)'
            }}>{interviewPhase === 'text' ? 'TEXT INTERVIEW' : 'VOICE INTERVIEW'}</h2>
            <div className="flex items-center space-x-3 px-4 py-2 rounded-xl" style={{
              background: 'rgba(255, 0, 0, 0.2)',
              border: '2px solid rgba(255, 0, 0, 0.5)',
              boxShadow: '0 0 20px rgba(255, 0, 0, 0.4)'
            }}>
              <div className="w-3 h-3 rounded-full animate-pulse" style={{
                background: 'radial-gradient(circle, #ff0000 0%, transparent 70%)',
                boxShadow: '0 0 15px #ff0000'
              }}></div>
              <span className="text-red-400 font-bold text-sm">RECORDING</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-white/60 text-sm mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          {/* Question */}
          <div className="rounded-2xl p-6 mb-6 border-2" style={{
            background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.15) 0%, rgba(255, 0, 255, 0.15) 100%)',
            borderColor: 'rgba(0, 245, 255, 0.4)',
            boxShadow: '0 0 40px rgba(0, 245, 255, 0.3), inset 0 0 20px rgba(255, 0, 255, 0.2)'
          }}>
            <div className="flex items-start space-x-3">
              {aiSpeaking && <Brain className="w-6 h-6 text-blue-400 animate-pulse flex-shrink-0 mt-1" />}
              <div className="flex-1">
                <span className="text-blue-400 text-xs font-bold uppercase">
                  {showFollowUp ? 'Follow-up Question' : questions[currentQuestion]?.type}
                </span>
                <p className="text-white text-xl font-medium mt-2">
                  {showFollowUp ? followUpQuestion?.followUpQuestion : questions[currentQuestion]?.question}
                </p>
                {showFollowUp && followUpQuestion?.reason && (
                  <p className="text-white/60 text-sm mt-2 italic">💡 {followUpQuestion.reason}</p>
                )}
              </div>
            </div>
          </div>

          {/* Conversation Log */}
          <div className="rounded-2xl p-6 mb-6 border-2 max-h-[300px] overflow-y-auto" style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(0, 245, 255, 0.3)',
            boxShadow: '0 0 30px rgba(0, 128, 255, 0.2), inset 0 0 15px rgba(0, 0, 0, 0.5)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold">Conversation</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-bold">Live</span>
              </div>
            </div>
            <div className="space-y-3">
              {conversationLog.map((log, i) => (
                <div key={i} className={`flex ${log.speaker === 'You' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 ${
                    log.speaker === 'You' 
                      ? 'bg-blue-600/30 border border-blue-500/30' 
                      : 'bg-purple-600/20 border border-purple-500/20'
                  }`}>
                    <p className="text-xs text-white/60 mb-1">{log.speaker} • {log.time}</p>
                    <p className="text-white text-sm">{log.text}</p>
                  </div>
                </div>
              ))}
              {currentAnswer && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl p-3 bg-blue-600/20 border border-blue-500/20">
                    <p className="text-xs text-white/60 mb-1">You • typing...</p>
                    <p className="text-white text-sm">{currentAnswer}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Voice Metrics */}
            {isListening && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-white/60 text-xs">Speech Rate</p>
                  <p className="text-white font-bold">{voiceMetrics.speechRate} wpm</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-white/60 text-xs">Pause</p>
                  <p className="text-white font-bold">{voiceMetrics.pauseDuration}s</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-white/60 text-xs">Words</p>
                  <p className="text-white font-bold">{currentAnswer.split(' ').length}</p>
                </div>
              </div>
            )}
          </div>

          {/* Text Input or Voice Info */}
          {interviewPhase === 'text' ? (
            <div className="rounded-2xl p-4 border-2" style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 245, 255, 0.15) 100%)',
              borderColor: 'rgba(0, 255, 136, 0.4)',
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)'
            }}>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-white font-bold">Text Interview Mode</p>
                    <p className="text-white/60 text-sm">Type your answer below and click submit</p>
                  </div>
                </div>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none resize-none"
                  rows={4}
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!currentAnswer.trim()}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          ) : interviewPhase === 'voice' ? (
            <div className="rounded-2xl p-4 border-2" style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 245, 255, 0.15) 100%)',
              borderColor: 'rgba(0, 255, 136, 0.4)',
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)'
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-white font-bold">Voice Interview Mode</p>
                    <p className="text-white/60 text-sm">Speak naturally - I'm always listening. Pause when done.</p>
                  </div>
                </div>
                {currentAnswer.trim() && (
                  <button
                    onClick={handleManualSubmit}
                    disabled={aiSpeaking}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-xl disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 border-2" style={{
              background: 'linear-gradient(135deg, rgba(255, 136, 0, 0.15) 0%, rgba(255, 0, 136, 0.15) 100%)',
              borderColor: 'rgba(255, 136, 0, 0.4)',
              boxShadow: '0 0 30px rgba(255, 136, 0, 0.3)'
            }}>
              <div className="text-center space-y-4">
                <p className="text-white font-bold text-lg">Ready for Voice Interview?</p>
                <p className="text-white/60">You've completed the text portion. Now let's continue with voice!</p>
                <button
                  onClick={startVoiceInterview}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold shadow-xl"
                >
                  🎤 START VOICE INTERVIEW
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="bg-white rounded-3xl p-10 max-w-md mx-4 text-center shadow-2xl border-4 border-green-200" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)'
          }}>
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Interview Completed!</h2>
            
            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Your responses have been analyzed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Results will be sent to your email</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Our team will contact you within 24-48 hours</span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">Thank you for your time and interest in our organization.</p>
            
            <div className="text-sm text-gray-500">
              Redirecting to dashboard in 5 seconds...
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default EnhancedAIAgent;
