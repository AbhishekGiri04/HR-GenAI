import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Target, Zap, Shield, TrendingUp } from 'lucide-react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  const loadingTexts = [
    "Decoding Human Potential...",
    "Analyzing Digital DNA Patterns...",
    "Mapping Behavioral Intelligence...",
    "Predicting Future Performance...",
    "Eliminating Hiring Bias...",
    "Building Talent Genome...",
    "Almost Ready to Transform Hiring!"
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 40);

    const textInterval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, 600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="relative h-48 w-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
                <div className="text-6xl font-black text-white">🧬</div>
              </div>
              <img 
                src="https://assets-v2.lottiefiles.com/a/79ff67b0-1163-11ee-9c0e-cb44a51043f4/IgIvoaMw7t.gif" 
                alt="HR-GenAI Logo" 
                className="absolute inset-0 w-full h-full object-cover rounded-full opacity-90"
                loading="eager"
                onLoad={(e) => e.target.style.opacity = '1'}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
          HR-GenAI
        </h1>
        
        <div className="mb-8">
          <p className="text-2xl text-gray-400 font-light mb-2">
            The Future of Human Intelligence
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-500 font-semibold tracking-wider uppercase">
              Powered by Advanced AI
            </p>
          </div>
        </div>

        <div className="mb-10 h-8">
          <p className="text-xl text-white font-bold animate-pulse">
            {loadingTexts[textIndex]}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10 max-w-2xl mx-auto">
          <div className="bg-blue-500/10 backdrop-blur-xl rounded-full px-4 py-3 border border-blue-500/30 flex items-center justify-center space-x-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 text-sm font-semibold">AI-Powered</span>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-xl rounded-full px-4 py-3 border border-purple-500/30 flex items-center justify-center space-x-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300 text-sm font-semibold">95% Accurate</span>
          </div>
          <div className="bg-pink-500/10 backdrop-blur-xl rounded-full px-4 py-3 border border-pink-500/30 flex items-center justify-center space-x-2">
            <Zap className="w-5 h-5 text-pink-400" />
            <span className="text-gray-300 text-sm font-semibold">3 Sec Fast</span>
          </div>
          <div className="bg-green-500/10 backdrop-blur-xl rounded-full px-4 py-3 border border-green-500/30 flex items-center justify-center space-x-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm font-semibold">Bias-Free</span>
          </div>
          <div className="bg-orange-500/10 backdrop-blur-xl rounded-full px-4 py-3 border border-orange-500/30 flex items-center justify-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="text-gray-300 text-sm font-semibold">Predictive</span>
          </div>
          <div className="bg-indigo-500/10 backdrop-blur-xl rounded-full px-4 py-3 border border-indigo-500/30 flex items-center justify-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-gray-300 text-sm font-semibold">DNA Profiling</span>
          </div>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-blue-400 text-sm font-semibold">{Math.round(progress)}%</p>
            <p className="text-purple-400 text-sm font-semibold">Loading...</p>
          </div>
        </div>

        <p className="mt-8 text-gray-600 text-sm">
          Transforming Hiring Through Digital DNA Intelligence
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;