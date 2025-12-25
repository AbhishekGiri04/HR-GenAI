import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, TrendingUp, Brain, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/authContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, userRole } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setShowProfileMenu(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setShowLogoutModal(false);
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl sticky top-0 z-50 border-b border-slate-700/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <Link to="/dashboard" className="flex items-center space-x-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
              <img 
                src="https://thumbs.dreamstime.com/b/letter-hr-logo-colorful-splash-background-combination-design-creative-industry-web-business-company-203790035.jpg"
                alt="HR-GenAI Logo"
                className="relative w-12 h-12 rounded-2xl shadow-lg group-hover:scale-110 transition-all duration-300"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                HR-GenAI
              </h1>
              <p className="text-sm text-slate-300 font-medium">AI-Powered Hiring Intelligence</p>
            </div>
          </Link>

          {/* Enhanced Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className={`relative flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 group ${
                isActive('/dashboard') || isActive('/') 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Home</span>
              {(isActive('/dashboard') || isActive('/')) && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-30"></div>
              )}
            </Link>
            
            {userRole === 'hr' && (
              <>
                <Link
                  to="/analysis"
                  className={`relative flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 group ${
                    isActive('/analysis') 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Talent Pool</span>
                  {isActive('/analysis') && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-30"></div>
                  )}
                </Link>
                <Link
                  to="/analytics"
                  className={`relative flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 group ${
                    isActive('/analytics') 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Analytics</span>
                  {isActive('/analytics') && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-lg opacity-30"></div>
                  )}
                </Link>
                <Link
                  to="/hr-dashboard"
                  className={`relative flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 group ${
                    isActive('/hr-dashboard') 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Brain className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Assessment Hub</span>
                  {isActive('/hr-dashboard') && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur-lg opacity-30"></div>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Enhanced Profile Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-white font-bold">{user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-slate-400 text-sm">{user?.email || 'user@hrgenai.com'}</p>
              </div>
              
              {/* Enhanced Profile Avatar with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="relative group cursor-pointer focus:outline-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition-all duration-500"></div>
                  <div className="relative">
                    <img 
                      src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email?.split('@')[0] || 'User')}&background=4F46E5&color=fff&size=48`} 
                      alt={user?.displayName || 'User'} 
                      className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-slate-600 group-hover:border-blue-400 transition-all group-hover:scale-110"
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email?.split('@')[0] || 'User')}&background=4F46E5&color=fff&size=48`;
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
                  </div>
                  <ChevronDown className={`absolute -bottom-1 -right-6 w-4 h-4 text-slate-400 transition-all duration-300 ${showProfileMenu ? 'rotate-180 text-blue-400' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 py-2 z-50">
                    <div className="px-6 py-4 border-b border-slate-700">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=4F46E5&color=fff&size=56`} 
                          alt={user?.displayName || 'User'} 
                          className="w-14 h-14 rounded-xl object-cover border-2 border-slate-600"
                        />
                        <div>
                          <p className="text-white font-bold text-lg">{user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
                          <p className="text-slate-400 text-sm">{user?.email || 'user@hrgenai.com'}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-green-400 text-xs font-semibold">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link to="/settings">
                        <button 
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full flex items-center px-6 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300 group"
                        >
                          <Settings className="w-5 h-5 mr-4 group-hover:rotate-90 transition-transform duration-300" />
                          <div className="text-left">
                            <span className="font-semibold">Settings</span>
                            <p className="text-xs text-slate-500">Manage your account</p>
                          </div>
                        </button>
                      </Link>
                      <Link to="/profile">
                        <button 
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full flex items-center px-6 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300 group"
                        >
                          <User className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform duration-300" />
                          <div className="text-left">
                            <span className="font-semibold">Profile</span>
                            <p className="text-xs text-slate-500">View your profile</p>
                          </div>
                        </button>
                      </Link>
                      <hr className="my-2 border-slate-700" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-6 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group"
                      >
                        <LogOut className="w-5 h-5 mr-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        <div className="text-left">
                          <span className="font-semibold">Sign Out</span>
                          <p className="text-xs text-red-500">Logout from account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        ></div>
      )}
      
      {/* Sign Out Toast Notification */}
      {showLogoutModal && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md" style={{animation: 'slideInFromRight 0.3s ease-out'}}>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Out</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to sign out? You will need to log in again to access your account.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmLogout}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
      
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
    </header>
  );
};

export default Header;