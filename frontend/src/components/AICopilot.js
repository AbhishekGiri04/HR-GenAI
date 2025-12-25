import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Input, Switch, Tag, Tooltip, Modal, Upload } from 'antd';
import { 
  MicrophoneIcon, 
  StopIcon, 
  DocumentTextIcon,
  EyeSlashIcon,
  EyeIcon,
  CloudArrowUpIcon,
  ChatBubbleLeftRightIcon,
  CpuChipIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const { TextArea } = Input;

const EnhancedAICopilot = ({ 
  candidateData, 
  currentQuestion, 
  onSuggestionGenerated,
  stealthMode = false,
  onStealthToggle 
}) => {
  // Core state
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  
  // RAG state
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [citations, setCitations] = useState([]);
  const [contextSources, setContextSources] = useState([]);
  
  // UI state
  const [showChat, setShowChat] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  
  // Audio processing
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const transcriptionBufferRef = useRef('');
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'en-US';
      
      speechRecognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          transcriptionBufferRef.current += finalTranscript;
          setTranscription(prev => prev + finalTranscript);
          
          // Trigger AI analysis for substantial content
          if (transcriptionBufferRef.current.length > 50) {
            analyzeTranscription(transcriptionBufferRef.current);
            transcriptionBufferRef.current = '';
          }
        }
      };
      
      speechRecognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      // Setup audio context for level monitoring
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      
      // Start speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
      }
      
      setIsRecording(true);
      monitorAudioLevel();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsRecording(false);
    setAudioLevel(0);
    
    // Final analysis of accumulated transcription
    if (transcriptionBufferRef.current) {
      analyzeTranscription(transcriptionBufferRef.current);
      transcriptionBufferRef.current = '';
    }
  };
  
  // Monitor audio level
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(average / 128 * 100, 100));
      
      requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };
  
  // Analyze transcription with AI
  const analyzeTranscription = useCallback(async (text) => {
    if (!text.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai-copilot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: text,
          question: currentQuestion,
          candidateProfile: candidateData,
          ragEnabled: ragEnabled,
          uploadedDocs: uploadedDocs.map(doc => doc.name),
          context: chatHistory.slice(-5) // Last 5 messages for context
        })
      });
      
      if (response.ok) {
        const analysis = await response.json();
        
        setAiSuggestions(analysis.suggestions || '');
        setCitations(analysis.citations || []);
        setContextSources(analysis.sources || []);
        
        // Add to chat history
        const newMessage = {
          id: Date.now(),
          type: 'analysis',
          content: analysis.suggestions,
          timestamp: new Date().toISOString(),
          sources: analysis.sources
        };
        
        setChatHistory(prev => [...prev, newMessage]);
        
        if (onSuggestionGenerated) {
          onSuggestionGenerated(analysis);
        }
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentQuestion, candidateData, ragEnabled, uploadedDocs, chatHistory, isAnalyzing, onSuggestionGenerated]);
  
  // Manual AI query
  const queryAI = async () => {
    if (!currentInput.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai-copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentInput,
          question: currentQuestion,
          candidateProfile: candidateData,
          transcription: transcription,
          ragEnabled: ragEnabled,
          context: chatHistory
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: result.response,
          timestamp: new Date().toISOString(),
          sources: result.sources,
          citations: result.citations
        };
        
        setChatHistory(prev => [...prev, aiMessage]);
        setCitations(result.citations || []);
      }
    } catch (error) {
      console.error('AI query failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle document upload
  const handleDocumentUpload = async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('candidateId', candidateData?.id || 'anonymous');
    
    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        setUploadedDocs(prev => [...prev, {
          name: file.name,
          id: result.documentId,
          uploadedAt: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Document upload failed:', error);
    }
    
    return false; // Prevent default upload behavior
  };
  
  // Clear transcription
  const clearTranscription = () => {
    setTranscription('');
    transcriptionBufferRef.current = '';
    setChatHistory([]);
    setAiSuggestions('');
    setCitations([]);
  };
  
  // Add speaker label
  const addSpeakerLabel = (speaker) => {
    const label = `\n\n--- ${speaker} ---\n`;
    setTranscription(prev => prev + label);
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
            break;
          case 'Enter':
            e.preventDefault();
            if (showChat && currentInput.trim()) {
              queryAI();
            }
            break;
          case 's':
            e.preventDefault();
            if (onStealthToggle) {
              onStealthToggle();
            }
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRecording, showChat, currentInput, onStealthToggle]);
  
  // Stealth mode rendering
  if (stealthMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Tooltip title="Show Copilot (Ctrl+S)">
          <Button
            shape="circle"
            size="large"
            icon={<EyeIcon className="w-5 h-5" />}
            onClick={onStealthToggle}
            className="shadow-lg bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
          />
        </Tooltip>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <Card size="small">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CpuChipIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium">AI Copilot</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm">RAG</span>
              <Switch 
                size="small"
                checked={ragEnabled} 
                onChange={setRagEnabled}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tooltip title="Upload Documents">
              <Button
                size="small"
                icon={<CloudArrowUpIcon className="w-4 h-4" />}
                onClick={() => setShowUpload(true)}
              />
            </Tooltip>
            
            <Tooltip title="Toggle Chat">
              <Button
                size="small"
                icon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
                onClick={() => setShowChat(!showChat)}
                type={showChat ? 'primary' : 'default'}
              />
            </Tooltip>
            
            <Tooltip title="Stealth Mode (Ctrl+S)">
              <Button
                size="small"
                icon={<EyeSlashIcon className="w-4 h-4" />}
                onClick={onStealthToggle}
              />
            </Tooltip>
          </div>
        </div>
      </Card>
      
      {/* Recording Controls */}
      <Card size="small">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Voice Transcription</span>
            <Button
              size="small"
              type={isRecording ? 'danger' : 'primary'}
              icon={isRecording ? <StopIcon className="w-4 h-4" /> : <MicrophoneIcon className="w-4 h-4" />}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? 'Stop' : 'Record'} (Ctrl+R)
            </Button>
          </div>
          
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600">Recording...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Transcription Display */}
      {transcription && (
        <Card 
          size="small" 
          title="Live Transcription"
          extra={
            <Button size="small" onClick={clearTranscription}>
              Clear
            </Button>
          }
        >
          <TextArea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            rows={4}
            className="text-sm"
            placeholder="Transcribed speech will appear here..."
          />
          
          <div className="flex space-x-2 mt-2">
            <Button
              size="small"
              onClick={() => addSpeakerLabel('INTERVIEWER')}
              className="text-xs"
            >
              Mark Interviewer
            </Button>
            <Button
              size="small"
              onClick={() => addSpeakerLabel('CANDIDATE')}
              className="text-xs"
            >
              Mark Candidate
            </Button>
          </div>
        </Card>
      )}
      
      {/* AI Suggestions */}
      {aiSuggestions && (
        <Card 
          size="small" 
          title={
            <div className="flex items-center space-x-2">
              <LightBulbIcon className="w-4 h-4 text-yellow-500" />
              <span>AI Suggestions</span>
              {isAnalyzing && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
            </div>
          }
        >
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {aiSuggestions}
          </div>
          
          {citations.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs font-medium text-gray-600 mb-2">Sources:</div>
              <div className="space-y-1">
                {citations.map((citation, index) => (
                  <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="font-medium">{citation.source}</div>
                    <div className="text-gray-600">{citation.snippet}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
      
      {/* Chat Interface */}
      {showChat && (
        <Card size="small" title="AI Chat">
          <div className="space-y-3">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded text-sm ${
                    message.type === 'user' 
                      ? 'bg-blue-50 text-blue-800 ml-4' 
                      : 'bg-gray-50 text-gray-800 mr-4'
                  }`}
                >
                  <div className="font-medium mb-1">
                    {message.type === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div>{message.content}</div>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-1 text-xs text-gray-600">
                      Sources: {message.sources.map(s => s.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Ask AI for help... (Ctrl+Enter to send)"
                onPressEnter={(e) => {
                  if (e.ctrlKey) {
                    queryAI();
                  }
                }}
              />
              <Button
                type="primary"
                onClick={queryAI}
                loading={isAnalyzing}
                disabled={!currentInput.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Uploaded Documents */}
      {uploadedDocs.length > 0 && (
        <Card size="small" title="Uploaded Documents">
          <div className="space-y-2">
            {uploadedDocs.map((doc, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                  <span>{doc.name}</span>
                </div>
                <Tag size="small" color="green">Processed</Tag>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Upload Modal */}
      <Modal
        title="Upload Documents"
        open={showUpload}
        onCancel={() => setShowUpload(false)}
        footer={null}
      >
        <Upload.Dragger
          beforeUpload={handleDocumentUpload}
          multiple
          accept=".pdf,.doc,.docx,.txt"
        >
          <p className="ant-upload-drag-icon">
            <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400" />
          </p>
          <p className="ant-upload-text">Click or drag files to upload</p>
          <p className="ant-upload-hint">
            Support PDF, DOC, DOCX, TXT files for RAG enhancement
          </p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
};

export default EnhancedAICopilot;