import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, TrendingUp } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <img 
              src="https://thumbs.dreamstime.com/b/letter-hr-logo-colorful-splash-background-combination-design-creative-industry-web-business-company-203790035.jpg" 
              alt="HR-GenAI" 
              className="h-12 w-12 rounded-lg shadow-md group-hover:shadow-lg transition-all"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">HR-GenAI</h1>
              <p className="text-xs text-gray-500 font-medium">AI-Powered Hiring Intelligence</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                isActive('/dashboard') || isActive('/') 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/analysis"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                isActive('/analysis') 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Analysis</span>
            </Link>
            <Link
              to="/analytics"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                isActive('/analytics') 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </Link>
          </nav>


        </div>
      </div>
    </header>
  );
};

export default Header;