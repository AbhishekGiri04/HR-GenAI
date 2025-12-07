import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrendingUp, Users, Target, Award, BarChart3, Activity, CheckCircle, Clock, Brain, Zap, Shield, Eye, AlertCircle, Star, Briefcase, Calendar, Globe } from 'lucide-react';

const Analytics = () => {
  const [realTimeData, setRealTimeData] = useState({
    totalCandidates: 2847,
    successRate: 94.2,
    hired: 1456,
    retention: 91.5,
    activeInterviews: 12,
    avgProcessingTime: 3.2
  });

  const [liveActivities, setLiveActivities] = useState([
    { id: 1, title: "AI Interview Started - Alex Chen", time: "Just now", status: "live", icon: Eye, location: "San Francisco, CA" },
    { id: 2, title: "Resume Analysis Complete - Maria Rodriguez", time: "2 min ago", status: "success", icon: CheckCircle, score: 94 },
    { id: 3, title: "Personality Profile Generated - David Kim", time: "5 min ago", status: "success", icon: Brain, type: "INTJ" },
    { id: 4, title: "Senior Engineer Hired - Sarah Johnson", time: "12 min ago", status: "hired", icon: Star, salary: "$145K" },
    { id: 5, title: "Voice Analysis Complete - James Wilson", time: "18 min ago", status: "success", icon: Activity, confidence: 87 },
  ]);

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

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        totalCandidates: prev.totalCandidates + Math.floor(Math.random() * 3),
        activeInterviews: Math.max(5, prev.activeInterviews + Math.floor(Math.random() * 3) - 1)
      }));

      // Add new activity occasionally
      if (Math.random() > 0.7) {
        const newActivities = [
          { id: Date.now(), title: "New Resume Uploaded - Anonymous", time: "Just now", status: "processing", icon: Clock },
          { id: Date.now(), title: "Interview Scheduled - Tech Lead Role", time: "Just now", status: "scheduled", icon: Calendar },
          { id: Date.now(), title: "EQ Analysis Complete - High Score", time: "Just now", status: "success", icon: Brain, score: Math.floor(Math.random() * 20) + 80 }
        ];
        
        setLiveActivities(prev => [
          newActivities[Math.floor(Math.random() * newActivities.length)],
          ...prev.slice(0, 4)
        ]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Analytics Dashboard
                </h1>
                <p className="text-lg text-gray-600 font-bold">Real-time insights and performance metrics</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 text-sm font-medium">Live data</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last updated</p>
                  <p className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-green-400 text-white rounded-full text-xs font-bold">+15%</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{realTimeData.totalCandidates.toLocaleString()}</p>
              <p className="text-blue-100 text-sm">Total Candidates</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-emerald-400 text-white rounded-full text-xs font-bold">+22%</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{realTimeData.successRate}%</p>
              <p className="text-green-100 text-sm">AI Accuracy</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-pink-400 text-white rounded-full text-xs font-bold">+18%</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{realTimeData.hired.toLocaleString()}</p>
              <p className="text-purple-100 text-sm">Successfully Hired</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-yellow-400 text-white rounded-full text-xs font-bold">+12%</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{realTimeData.retention}%</p>
              <p className="text-orange-100 text-sm">Retention Rate</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{realTimeData.activeInterviews}</p>
              <p className="text-red-100 text-sm">Live Interviews</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-cyan-400 text-white rounded-full text-xs font-bold">Fast</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{realTimeData.avgProcessingTime}s</p>
              <p className="text-indigo-100 text-sm">Process Time</p>
            </div>
          </div>

          {/* Modern Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* 3D-style Bar Chart */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-3 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-800">Monthly Hiring Trends</h3>
              </div>
              <div className="h-64 flex items-end space-x-3 px-4">
                {hiringTrends.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-105 relative overflow-hidden" 
                      style={{ height: `${(data.hires / 300) * 200}px` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12"></div>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-sm font-semibold text-gray-700">{data.month}</p>
                      <p className="text-xs text-blue-600 font-bold">{data.hires}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modern Donut Chart */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border-0 hover:shadow-2xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full mr-3 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Interview Status</h3>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full mr-3 shadow-md"></div>
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">65%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                    <div className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full shadow-sm" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mr-3 shadow-md"></div>
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-600">25%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full shadow-sm" style={{ width: '25%' }}></div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-3 shadow-md"></div>
                      <span className="text-sm font-medium">Rejected</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">10%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                    <div className="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full shadow-sm" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Curved Line Chart */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl shadow-xl border-0">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mr-3 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Success Rate Trend</h3>
              </div>
              <div className="h-48 relative bg-white rounded-2xl p-4 shadow-inner">
                <svg className="w-full h-full">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    points="20,140 80,120 140,100 200,90 260,80 320,70"
                  />
                  {[20, 80, 140, 200, 260, 320].map((x, i) => (
                    <circle key={i} cx={x} cy={140 - i * 14} r="6" fill="#8B5CF6" className="drop-shadow-lg" />
                  ))}
                </svg>
                <div className="flex justify-between mt-2 text-xs text-gray-600 font-medium">
                  {hiringTrends.map((data) => (
                    <span key={data.month}>{data.month}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modern Skills Cards */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl shadow-xl border-0">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mr-3 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Top Skills</h3>
              </div>
              <div className="space-y-4">
                {skillDemand.map((skill, index) => (
                  <div key={index} className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl text-sm font-bold flex items-center justify-center mr-3 shadow-md">
                          {index + 1}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{skill.skill}</span>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{skill.growth}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 shadow-sm" 
                        style={{ width: `${skill.demand}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>



          {/* Modern Activity Feed */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl shadow-xl border-0">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mr-4 flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                  <p className="text-sm text-gray-500">Live pipeline updates</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-sm font-medium text-gray-600">Live</span>
              </div>
            </div>
            <div className="space-y-4">
              {liveActivities.map((activity, index) => {
                const Icon = activity.icon;
                
                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 border-l-4 border-blue-500">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{activity.title}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{activity.time}</span>
                        {activity.location && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{activity.location}</span>
                        )}
                        {activity.score && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">Score: {activity.score}%</span>
                        )}
                        {activity.type && (
                          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{activity.type}</span>
                        )}
                        {activity.salary && (
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">{activity.salary}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {activity.status === 'live' && (
                        <span className="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-xs font-bold shadow-md">
                          Live
                        </span>
                      )}
                      {activity.status === 'success' && (
                        <span className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md">
                          Done
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Analytics;