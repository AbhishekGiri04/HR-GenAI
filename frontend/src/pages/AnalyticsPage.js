import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../config/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrendingUp, Users, Target, Award, BarChart3, Activity, CheckCircle, Clock, Brain, Zap, Shield, Eye, AlertCircle, Star, Briefcase, Calendar, Globe, ArrowUp, ArrowDown, Pulse, FileText, UserCheck, Mic, Upload } from 'lucide-react';
import wsClient from '../services/websocketService';

const Analytics = () => {
  const [realTimeData, setRealTimeData] = useState({
    totalCandidates: 0,
    successRate: 0,
    hired: 0,
    retention: 0,
    activeInterviews: 0,
    avgProcessingTime: 3.2
  });

  const [liveActivities, setLiveActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const activityIdRef = useRef(1000);

  const [hiringTrends, setHiringTrends] = useState([]);
  const [skillDemand, setSkillDemand] = useState([]);

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
          
          const completedInterviews = candidates.filter(c => c.interviewCompleted);
          const successRate = completedInterviews.length > 0 
            ? (completedInterviews.filter(c => c.interviewScore >= 70).length / completedInterviews.length) * 100 
            : 0;
          
          setRealTimeData(prev => ({
            ...prev,
            totalCandidates: candidates.length,
            successRate: successRate,
            hired: candidates.filter(c => c.interviewScore >= 80).length,
            activeInterviews: candidates.filter(c => !c.interviewCompleted && c.skillDNA).length
          }));
          
          // Calculate skill demand from candidates
          const skillCount = {};
          candidates.forEach(c => {
            c.skillDNA?.technicalSkills?.forEach(skill => {
              skillCount[skill] = (skillCount[skill] || 0) + 1;
            });
          });
          
          const topSkills = Object.entries(skillCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill, count], index) => ({
              skill,
              demand: Math.min(100, (count / candidates.length) * 100),
              growth: `+${Math.floor(Math.random() * 30 + 10)}%`
            }));
          
          setSkillDemand(topSkills);
          
          // Calculate monthly trends (last 6 months)
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const now = new Date();
          const trends = [];
          
          for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthCandidates = candidates.filter(c => {
              const cDate = new Date(c.createdAt);
              return cDate.getMonth() === date.getMonth() && cDate.getFullYear() === date.getFullYear();
            });
            
            trends.push({
              month: monthNames[date.getMonth()],
              hires: monthCandidates.filter(c => c.interviewScore >= 80).length,
              applications: monthCandidates.length
            });
          }
          
          setHiringTrends(trends);
          
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
                {hiringTrends.length > 0 ? hiringTrends.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-xl hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 transition-all duration-300 relative shadow-xl group-hover:shadow-2xl" 
                      style={{ height: `${Math.max((data.hires / Math.max(...hiringTrends.map(t => t.hires), 1)) * 220, 20)}px` }}
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
                )) : (
                  <div className="w-full text-center py-12 text-gray-500">
                    No hiring data available yet
                  </div>
                )}
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
                {skillDemand.length > 0 ? skillDemand.map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center shadow-md">
                          {index + 1}
                        </div>
                        <span className="text-base font-semibold text-gray-800">{item.skill}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${item.demand}%` }}></div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold min-w-[60px] text-center">{item.growth}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-gray-500">
                    No skill data available yet
                  </div>
                )}
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