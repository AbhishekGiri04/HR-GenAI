import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ icon, title, value, change }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 rounded-xl">
          {icon}
        </div>
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{change}</span>
        </div>
      </div>
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1">from last month</p>
      </div>
    </div>
  );
};

export default StatsCard;