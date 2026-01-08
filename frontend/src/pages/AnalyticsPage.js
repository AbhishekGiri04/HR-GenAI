import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../config/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrendingUp, Users, Target, Award, BarChart3, Activity, CheckCircle, Clock, Brain, Zap, Shield, Eye, AlertCircle, Star, Briefcase, Calendar, Globe, ArrowUp, ArrowDown, Pulse, FileText, UserCheck, Mic, Upload } from 'lucide-react';
import wsClient from '../services/websocketService';

const Analytics = () => {
  const [realTimeData, setRealTimeData] = useState({
    totalCandidates: 2848,
    successRate: 94.2,
    hired: 1456,
    retention: 91.5,
    activeInterviews: 13,
    avgProcessingTime: 3.2
  });

  const [liveActivities, setLiveActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const activityIdRef = useRef(1000);

  const [hiringTrends] = useState([
    { month: 'Jan', hires: 145, applications: 890 },
    { month: 'Feb', hires: 167, applications: 1020 },
    { month: 'Mar', hires: 189, applications: 1150 },
    { month: 'Apr', hires: 203, applications: 1280 },
    { month: 'May', hires: 234, applications: 1420 },
    { month: 'Jun', hires: 267, applications: 1580 }
  ]);

  const [skillDemand] = useState([
    { skill: 'React.js', demand: 95, growth: '+23%' },
    { skill: 'Python', demand: 89, growth: '+18%' },
    { skill: 'Node.js', demand: 82, growth: '+15%' },
    { skill: 'AWS', demand: 78, growth: '+31%' },
    { skill: 'Machine Learning', demand: 74, growth: '+42%' }
  ]);

  // WebSocket connection and real-time updates
  useEffect(() => {
    // Try WebSocket connection but don't rely on it
    try {
      wsClient.connect();
      
      const handleActivity = (activity) => {
        const newActivity = {
          id: activityIdRef.current++,
          title: activity.title,
          candidate: activity.candidate,
          status: activity.status,
          icon: getIconForType(activity.type),
          details: activity.details,
          time: 'Just now',
          timestamp: Date.now()
        };
        
        setLiveActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      };
      
      const handleConnection = () => setIsConnected(true);
      const handleDisconnection = () => setIsConnected(false);
      
      wsClient.on('activity', handleActivity);
      wsClient.on('connected', handleConnection);
      wsClient.on('disconnected', handleDisconnection);
      
      return () => {
        wsClient.off('activity', handleActivity);
        wsClient.off('connected', handleConnection);
        wsClient.off('disconnected', handleDisconnection);
      };
    } catch (error) {
      console.log('WebSocket not available, using API polling');
      setIsConnected(false);
    }
  }, []);
  
  // Fetch real data from API
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // Fetch candidates directly
        const candidatesResponse = await fetch(`${API_URL}/api/candidates`);
        if (candidatesResponse.ok) {
          const candidates = await candidatesResponse.json();
          
          setRealTimeData(prev => ({
            ...prev,
            totalCandidates: candidates.length,
            hired: candidates.filter(c => c.interviewScore >= 80).length,
            activeInterviews: candidates.filter(c => c.status === 'interviewed').length
          }));
          
          // Convert recent candidates to activities
          const recentCandidates = candidates
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
          
          const activities = recentCandidates.map((candidate) => {
            if (candidate.interviewScore) {
              return {
                id: candidate._id,
                title: "Interview Completed",
                candidate: candidate.name,
                status: candidate.interviewScore >= 80 ? "success" : "processing",
                icon: CheckCircle,
                details: `Score: ${candidate.interviewScore}/100`,
                time: new Date(candidate.updatedAt).toLocaleTimeString(),
                timestamp: new Date(candidate.updatedAt).getTime()
              };
            } else {
              return {
                id: candidate._id,
                title: "Resume Processed",
                candidate: candidate.name,
                status: "success",
                icon: CheckCircle,
                details: `${candidate.skillDNA?.technicalSkills?.length || 0} skills identified`,
                time: new Date(candidate.createdAt).toLocaleTimeString(),
                timestamp: new Date(candidate.createdAt).getTime()
              };
            }
          });
          
          setLiveActivities(activities);
        }
      } catch (error) {
        console.log('Failed to fetch candidates:', error);
      }
    };
    
    fetchRealData();
    const interval = setInterval(fetchRealData, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const getIconForType = (type) => {
    switch (type) {
      case 'resume_upload': return Upload;
      case 'skills_extracted': return Brain;
      case 'profile_created': return UserCheck;
      case 'interview_started': return Mic;
      case 'candidate_hired': return Star;
      default: return Activity;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-600 font-medium mb-8">Real-time insights and performance metrics</p>
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-gray-700 font-bold text-lg">Live data</span>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">Last updated</p>
                <p className="text-xl font-black text-gray-900">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce shadow-lg"></div>
                <span className="text-gray-700 font-bold text-lg">{realTimeData.activeInterviews} Active Interviews</span>
              </div>
            </div>
          </div>

          {/* Real-time Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Candidates</p>
                  <p className="text-3xl font-black">{realTimeData.totalCandidates.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-black">{realTimeData.successRate.toFixed(1)}%</p>
                </div>
                <Target className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Hired</p>
                  <p className="text-3xl font-black">{realTimeData.hired.toLocaleString()}</p>
                </div>
                <Award className="w-8 h-8 text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg Processing</p>
                  <p className="text-3xl font-black">{realTimeData.avgProcessingTime}s</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </div>
          </div>



          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Hiring Trends Chart */}
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-blue-100">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Monthly Hiring Trends</h3>
              </div>
              <div className="h-72 flex items-end space-x-6 px-4">
                {hiringTrends.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-xl hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 transition-all duration-300 relative shadow-xl group-hover:shadow-2xl" 
                      style={{ height: `${(data.hires / 300) * 220}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {data.hires} hires
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm font-bold text-gray-700">{data.month}</p>
                      <p className="text-lg font-black text-blue-600">{data.hires}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Status */}
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-green-100">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Interview Status</h3>
              </div>
              <div className="space-y-6">
                <div className="group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-4 shadow-md"></div>
                      <span className="text-base font-semibold text-gray-700">Completed</span>
                    </div>
                    <span className="text-2xl font-black text-green-600">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full shadow-lg transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-4 shadow-md"></div>
                      <span className="text-base font-semibold text-gray-700">In Progress</span>
                    </div>
                    <span className="text-2xl font-black text-blue-600">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full shadow-lg transition-all duration-1000 ease-out" style={{ width: '25%' }}></div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-4 shadow-md"></div>
                      <span className="text-base font-semibold text-gray-700">Rejected</span>
                    </div>
                    <span className="text-2xl font-black text-red-600">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                    <div className="bg-gradient-to-r from-red-400 to-red-600 h-4 rounded-full shadow-lg transition-all duration-1000 ease-out" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success Rate Trend */}
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-purple-100">
              <div className="flex items-center justify-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Success Rate Trend</h3>
              </div>
              <div className="h-64 relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 shadow-inner flex items-center justify-center">
                <svg className="w-full max-w-md h-full" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 40 160 Q 100 140 160 120 T 280 100 T 360 80 L 360 180 L 40 180 Z"
                    fill="url(#gradient)"
                  />
                  <polyline
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="40,160 100,140 160,120 220,110 280,100 340,90 360,80"
                  />
                  {[40, 100, 160, 220, 280, 340, 360].map((x, i) => {
                    const y = 160 - i * 13;
                    const percentage = 85 + i * 2;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="6" fill="#8B5CF6" stroke="white" strokeWidth="3" className="drop-shadow-md" />
                        <text x={x} y={y - 15} textAnchor="middle" className="text-sm font-bold fill-purple-700">
                          {percentage}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="flex justify-center mt-6">
                <div className="flex justify-between w-full max-w-md text-sm font-semibold text-gray-600">
                  {hiringTrends.map((data) => (
                    <span key={data.month} className="text-center px-2">{data.month}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Skills */}
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-cyan-100">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Top Skills</h3>
              </div>
              <div className="space-y-5">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center shadow-md">
                        1
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <circle cx="12" cy="12" r="10" fill="#61DAFB"/>
                          <path d="M12,10.11C13.03,10.11 13.87,10.95 13.87,12C13.87,13 13.03,13.85 12,13.85C10.97,13.85 10.13,13 10.13,12C10.13,10.95 10.97,10.11 12,10.11M7.37,20C8,20.38 9.38,19.8 10.97,18.3C11.15,18.1 11.35,17.9 11.56,17.7C8.64,15.54 6.5,12.85 5.5,9.9C4.26,11.15 3.5,12.85 3.5,14.7C3.5,17.61 5.18,19.5 7.37,20M16.63,20C18.82,19.5 20.5,17.61 20.5,14.7C20.5,12.85 19.74,11.15 18.5,9.9C17.5,12.85 15.36,15.54 12.44,17.7C12.65,17.9 12.85,18.1 13.03,18.3C14.62,19.8 16,20.38 16.63,20M5.5,9.1C6.5,6.15 8.64,3.46 11.56,1.3C9.97,0.2 8.59,0.62 7.37,1C5.18,1.5 3.5,3.39 3.5,6.3C3.5,7.15 3.74,7.95 4.13,8.7C4.59,8.87 5.04,9 5.5,9.1M18.5,9.1C18.96,9 19.41,8.87 19.87,8.7C20.26,7.95 20.5,7.15 20.5,6.3C20.5,3.39 18.82,1.5 16.63,1C15.41,0.62 14.03,0.2 12.44,1.3C15.36,3.46 17.5,6.15 18.5,9.1Z" fill="white"/>
                        </svg>
                      </div>
                      <span className="text-base font-semibold text-gray-800">React.js</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000" style={{ width: '95%' }}></div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold min-w-[60px] text-center">+23%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-bold flex items-center justify-center shadow-md">
                        2
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="#3776ab"/>
                          <path d="M10.5,9.5C10.5,8.67 11.17,8 12,8C12.83,8 13.5,8.67 13.5,9.5C13.5,10.33 12.83,11 12,11C11.17,11 10.5,10.33 10.5,9.5M12,13C13.1,13 14,13.9 14,15V17H10V15C10,13.9 10.9,13 12,13Z" fill="#ffd43b"/>
                        </svg>
                      </div>
                      <span className="text-base font-semibold text-gray-800">Python</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000" style={{ width: '89%' }}></div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold min-w-[60px] text-center">+18%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-green-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-lg text-sm font-bold flex items-center justify-center shadow-md">
                        3
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <path d="M12,1.85C12,1.85 21.1,5.4 21.1,12C21.1,18.6 12,22.15 12,22.15C12,22.15 2.9,18.6 2.9,12C2.9,5.4 12,1.85 12,1.85M12,3.73L4.74,6.8C4.74,6.8 4.74,17.2 12,20.27C19.26,17.2 19.26,6.8 19.26,6.8L12,3.73Z" fill="#68a063"/>
                          <path d="M12,6.15C12,6.15 16.85,8.4 16.85,12C16.85,15.6 12,17.85 12,17.85C12,17.85 7.15,15.6 7.15,12C7.15,8.4 12,6.15 12,6.15Z" fill="#68a063"/>
                        </svg>
                      </div>
                      <span className="text-base font-semibold text-gray-800">Node.js</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: '82%' }}></div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold min-w-[60px] text-center">+15%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-orange-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg text-sm font-bold flex items-center justify-center shadow-md">
                        4
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <path d="M6.763,10.036c0.234-0.234,0.234-0.615,0-0.849c-0.234-0.234-0.615-0.234-0.849,0L2.447,12.653c-0.234,0.234-0.234,0.615,0,0.849l3.467,3.467c0.234,0.234,0.615,0.234,0.849,0c0.234-0.234,0.234-0.615,0-0.849L3.763,13.12h16.474c0.332,0,0.6-0.268,0.6-0.6s-0.268-0.6-0.6-0.6H3.763L6.763,10.036z" fill="#FF9900"/>
                          <path d="M17.237,13.964c-0.234,0.234-0.234,0.615,0,0.849c0.234,0.234,0.615,0.234,0.849,0l3.467-3.467c0.234-0.234,0.234-0.615,0-0.849l-3.467-3.467c-0.234-0.234-0.615-0.234-0.849,0c-0.234,0.234-0.234,0.615,0,0.849L20.237,10.88H3.763c-0.332,0-0.6,0.268-0.6,0.6s0.268,0.6,0.6,0.6h16.474L17.237,13.964z" fill="#FF9900"/>
                        </svg>
                      </div>
                      <span className="text-base font-semibold text-gray-800">AWS</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000" style={{ width: '78%' }}></div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold min-w-[60px] text-center">+31%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-bold flex items-center justify-center shadow-md">
                        5
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" fill="#673AB7"/>
                        </svg>
                      </div>
                      <span className="text-base font-semibold text-gray-800">Machine Learning</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000" style={{ width: '74%' }}></div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold min-w-[60px] text-center">+42%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="mt-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Live Activity Feed</h3>
                  <p className="text-sm text-gray-600">Real-time candidate pipeline updates</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-md`}></div>
                <span className="text-sm font-semibold text-gray-700">Real Data</span>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {liveActivities.length} Activities
                </div>
              </div>
            </div>
            
            {liveActivities.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {liveActivities.map((activity, index) => {
                  const IconComponent = activity.icon;
                  const getStatusColor = (status) => {
                    switch (status) {
                      case 'live': return 'from-red-500 to-pink-500';
                      case 'success': return 'from-green-500 to-emerald-500';
                      case 'processing': return 'from-blue-500 to-cyan-500';
                      case 'hired': return 'from-purple-500 to-indigo-500';
                      default: return 'from-gray-500 to-slate-500';
                    }
                  };
                  
                  const getStatusBg = (status) => {
                    switch (status) {
                      case 'live': return 'from-red-50 to-pink-50 border-red-200';
                      case 'success': return 'from-green-50 to-emerald-50 border-green-200';
                      case 'processing': return 'from-blue-50 to-cyan-50 border-blue-200';
                      case 'hired': return 'from-purple-50 to-indigo-50 border-purple-200';
                      default: return 'from-gray-50 to-slate-50 border-gray-200';
                    }
                  };

                  return (
                    <div 
                      key={activity.id} 
                      className={`bg-gradient-to-r ${getStatusBg(activity.status)} p-4 rounded-xl border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                      style={{
                        animation: index === 0 ? 'slideInFromRight 0.5s ease-out' : 'none'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${getStatusColor(activity.status)} rounded-xl flex items-center justify-center shadow-md`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-base font-bold text-gray-800">{activity.title}</h4>
                              <span className="text-sm font-semibold text-gray-600">• {activity.candidate}</span>
                              {activity.status === 'live' && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-bold text-red-600 uppercase">LIVE</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-500">{activity.time}</p>
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-bold mt-1 ${
                            activity.status === 'live' ? 'bg-red-100 text-red-700' :
                            activity.status === 'success' ? 'bg-green-100 text-green-700' :
                            activity.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            activity.status === 'hired' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {activity.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">Waiting for activity...</p>
                <p className="text-gray-400 text-sm mt-2">Live updates will appear here</p>
              </div>
            )}
          </div>
          
          <style jsx>{`
            @keyframes slideInFromRight {
              0% {
                transform: translateX(100%);
                opacity: 0;
              }
              100% {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Analytics;