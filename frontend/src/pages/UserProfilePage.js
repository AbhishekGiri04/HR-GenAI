import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Mail, Calendar, Shield, Award, Clock, MapPin, Edit, User, Upload } from 'lucide-react';

const Profile = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [showResumeSuccess, setShowResumeSuccess] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState([]);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    photoURL: '',
    skills: []
  });

  // Fetch real activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        // Fetch candidates for HR activity
        const response = await fetch('http://localhost:5001/api/candidates');
        const candidates = await response.json();
        
        // Generate activity from real data
        const activities = [];
        
        candidates.slice(0, 5).forEach((candidate, idx) => {
          const createdDate = new Date(candidate.createdAt);
          const now = new Date();
          const diffMs = now - createdDate;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          let timeAgo = '';
          if (diffMins < 60) timeAgo = `${diffMins} minutes ago`;
          else if (diffHours < 24) timeAgo = `${diffHours} hours ago`;
          else timeAgo = `${diffDays} days ago`;
          
          activities.push({
            action: `Reviewed ${candidate.name}'s profile`,
            time: timeAgo,
            type: 'interview',
            candidateId: candidate._id
          });
        });
        
        setRecentActivity(activities);
        
        // Calculate real stats for HR
        if (userRole === 'hr') {
          const totalCandidates = candidates.length;
          const avgScore = candidates.reduce((sum, c) => sum + (c.hiringProbability?.score || 0), 0) / totalCandidates || 0;
          const joinDate = user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Dec 2025';
          
          setStats([
            { label: 'Candidates Reviewed', value: totalCandidates.toString(), icon: Award },
            { label: 'Average Score', value: Math.round(avgScore).toString(), icon: Clock },
            { label: 'Success Rate', value: `${Math.round(avgScore)}%`, icon: Shield },
            { label: 'Active Since', value: joinDate, icon: Calendar }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch activity:', error);
        // Fallback to static data
        setRecentActivity([
          { action: 'No recent activity', time: 'Just now', type: 'settings' }
        ]);
      }
    };
    
    if (userRole === 'hr') {
      fetchActivityData();
    }
  }, [userRole, user]);

  // Load profile data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    } else {
      setProfileData({
        fullName: user?.displayName || 'Abhishek Giri',
        email: user?.email || 'abhishekgiri1978@gmail.com',
        phone: '+91 9876543210',
        location: 'Haridwar, Uttarakhand',
        bio: 'AI Engineer & Full Stack Developer',
        photoURL: user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email?.split('@')[0] || 'User')}&background=4F46E5&color=fff&size=128`,
        skills: ['HR Management', 'AI Recruitment', 'Talent Acquisition', 'Data Analysis', 'Team Leadership']
      });
    }
  }, [user]);

  // Only show HR stats for HR users
  // Stats are now fetched from real data above

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div 
            className="h-32 bg-cover bg-center"
            style={{
              backgroundImage: userRole === 'hr' 
                ? 'url(https://media.licdn.com/dms/image/v2/C5612AQERN8pDnTSl9g/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1520227892713?e=2147483647&v=beta&t=0N_VkxsWEomZo5OKZ3SzQbKgRIoB3Ez07K10SFBeiCU)'
                : 'url(https://media.licdn.com/dms/image/v2/D4E16AQFN0qpNTVGcQA/profile-displaybackgroundimage-shrink_200_800/profile-displaybackgroundimage-shrink_200_800/0/1698717759450?e=2147483647&v=beta&t=YIYcK6ulkKR926fARlR7uMy3duHcjgTiXY9wYEQ2Ock)'
            }}
          ></div>
          <div className="px-8 pb-8">
            <div className="flex items-end -mt-16 mb-6">
              <div className="relative">
                <img
                  src={profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName || 'User')}&background=4F46E5&color=fff&size=128`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    console.log('Profile image failed, using fallback');
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName || 'User')}&background=4F46E5&color=fff&size=128`;
                  }}
                />
                <label className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <Edit className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const newProfileData = { ...profileData, photoURL: event.target.result };
                          setProfileData(newProfileData);
                          localStorage.setItem('userProfile', JSON.stringify(newProfileData));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="ml-6 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">{profileData.fullName || user?.displayName || 'User'}</h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {profileData.email || user?.email}
                </p>
                <div className="flex items-center mt-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-600 text-sm font-semibold">Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/settings')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              {userRole === 'candidate' && (
                <label className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Upload Resume</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        console.log('Resume uploaded:', file.name);
                        setShowResumeSuccess(true);
                        setTimeout(() => {
                          setShowResumeSuccess(false);
                        }, 3000);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
                  <p className="text-gray-600">
                    {profileData.bio || 'No bio available. Update your profile in settings to add a bio.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills && profileData.skills.length > 0 ? (
                      profileData.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No skills added. Update your profile in settings to add skills.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Information</h2>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold break-all">{profileData.email || user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-semibold">Dec 2025</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Verification</p>
                      <p className="font-semibold text-green-600">Verified</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">{profileData.location || 'Remote'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => activity.candidateId && navigate(`/candidate/${activity.candidateId}`)}
                  >
                    <div className={`w-3 h-3 rounded-full mr-4 ${
                      activity.type === 'interview' ? 'bg-green-500' :
                      activity.type === 'settings' ? 'bg-blue-500' :
                      activity.type === 'report' ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Resume Success Notification */}
      {showResumeSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md" style={{animation: 'slideInFromRight 0.3s ease-out'}}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Resume Uploaded!</h3>
              <p className="text-gray-600 text-sm">Your resume has been uploaded successfully.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;