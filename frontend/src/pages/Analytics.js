import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrendingUp, Users, Target, Award, BarChart3, Activity, CheckCircle, Clock } from 'lucide-react';

const Analytics = () => {
  const activities = [
    { title: "Senior Developer Position Filled", time: "2 hours ago", status: "success", icon: CheckCircle },
    { title: "AI Interview Completed - John Doe", time: "4 hours ago", status: "success", icon: CheckCircle },
    { title: "Resume Analysis - 5 Candidates", time: "6 hours ago", status: "processing", icon: Clock },
    { title: "Team Lead Hired - Sarah Smith", time: "1 day ago", status: "success", icon: CheckCircle },
    { title: "Genome Profile Generated", time: "1 day ago", status: "success", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">Comprehensive insights and performance metrics</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">+15%</span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Candidates</p>
              <p className="text-3xl font-bold text-gray-900">2,847</p>
              <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">+22%</span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">94.2%</p>
              <p className="text-xs text-gray-500 mt-2">AI accuracy score</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">+18%</span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Hired</p>
              <p className="text-3xl font-bold text-gray-900">1,456</p>
              <p className="text-xs text-gray-500 mt-2">This quarter</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">+12%</span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Retention</p>
              <p className="text-3xl font-bold text-gray-900">91.5%</p>
              <p className="text-xs text-gray-500 mt-2">6-month average</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Hiring Trends</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-gray-300">
                <Activity className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 font-semibold">Chart Visualization</p>
                <p className="text-gray-400 text-sm">Coming Soon</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Performance Distribution</h3>
                <Target className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-gray-300">
                <Activity className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 font-semibold">Chart Visualization</p>
                <p className="text-gray-400 text-sm">Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <span className="text-sm text-gray-500">Last 24 hours</span>
            </div>
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          activity.status === 'success' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      activity.status === 'success' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {activity.status === 'success' ? 'Completed' : 'Processing'}
                    </span>
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