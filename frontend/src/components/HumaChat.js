import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Minimize2, FileText, Calendar, Phone, HelpCircle, Clock, Users } from 'lucide-react';

const HumaChat = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm Huma, your AI-powered HR Assistant. I'm here to help you with HR policies, leave management, and workplace inquiries. How can I assist you today?",
      sender: 'huma',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { id: 'leave', icon: Calendar, text: 'Leave Policies', query: 'Tell me about leave policies' },
    { id: 'balance', icon: Clock, text: 'Leave Balance', query: 'How can I check my leave balance?' },
    { id: 'contact', icon: Phone, text: 'Contact HR', query: 'How do I contact HR department?' },
    { id: 'policies', icon: FileText, text: 'HR Policies', query: 'Show me available HR policies' },
    { id: 'benefits', icon: Users, text: 'Benefits', query: 'What employee benefits are available?' },
    { id: 'help', icon: HelpCircle, text: 'General Help', query: 'What can you help me with?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? 'https://hrgen-dev.onrender.com' 
        : 'http://localhost:5001';
        
      const response = await fetch(`${API_BASE}/api/huma/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          userId: localStorage.getItem('userId') || null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const humaMessage = {
        id: Date.now() + 1,
        text: data.success ? data.response : "I apologize, but I'm having trouble processing your request. Please try again or contact HR directly.",
        sender: 'huma',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, humaMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "⚠️ I'm experiencing connectivity issues. Please check your internet connection and try again, or contact HR directly at hr@hrgenai.com",
        sender: 'huma',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    sendMessage(action.query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggle}
          className="bg-white hover:bg-gray-50 text-blue-600 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-gray-200"
        >
          <Bot className="w-7 h-7 text-blue-600" />
        </button>
        <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Chat with Huma AI
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Huma AI</h3>
            <p className="text-xs opacity-90">HR Assistant • Online</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <Minimize2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'huma' && (
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <Bot size={14} className="text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="bg-white/20 p-1 rounded-full mt-1">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Quick Actions */}
        {showQuickActions && messages.length <= 2 && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Quick Actions</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 p-3 rounded-xl transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent size={16} className="text-blue-600 group-hover:text-blue-700" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                        {action.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-1 rounded-full">
                  <Bot size={14} className="text-blue-600" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-500">Huma is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about policies, leave balance, benefits..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-400">Powered by HR-GenAI • Secure & Confidential</p>
        </div>
      </div>
    </div>
  );
};

export default HumaChat;