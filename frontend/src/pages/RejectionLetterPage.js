import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle, Download, Mail, User, Phone, MapPin, TrendingUp, BookOpen } from 'lucide-react';

const RejectionLetterPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  // Mock data - replace with actual API call
  const candidateData = {
    name: "Sidh Khurana",
    email: "sidhkhurana06@gmail.com",
    phone: "+91-8535024844",
    location: "Uttar Pradesh (246763)",
    score: 26,
    strengths: ["Technical Knowledge", "Problem Solving", "Communication"]
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-4">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You for Your Interest</h1>
          <p className="text-gray-600">Your interview results and feedback</p>
        </div>

        {/* Rejection Letter */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Company Header */}
          <div className="border-b border-gray-200 pb-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">HR-GenAI</h2>
                <p className="text-gray-600">AI-Powered Hiring Intelligence Platform</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Date: {currentDate}</p>
              </div>
            </div>
          </div>

          {/* Candidate Info */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Candidate</p>
                  <p className="font-semibold text-gray-900">{candidateData.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{candidateData.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{candidateData.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold text-gray-900">{candidateData.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Letter Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Subject: Interview Results - Thank You</h3>
              <p className="text-gray-700 leading-relaxed">
                Dear {candidateData.name},
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Thank you for your interest in HR-GenAI and for taking the time to participate in our comprehensive 
              AI-powered interview process. We appreciate the effort you put into showcasing your skills and experience.
            </p>

            {/* Interview Results */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Your Interview Performance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{candidateData.score}/100</p>
                  <p className="text-sm text-blue-700">Overall Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">Moderate</p>
                  <p className="text-sm text-blue-700">Growth Potential</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">Assessed</p>
                  <p className="text-sm text-blue-700">Multiple Areas</p>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-bold text-green-800 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Areas of Strength
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {candidateData.strengths.map((strength, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <p className="font-semibold text-green-800">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">
              After careful consideration of your interview performance and our current requirements, we have 
              decided to move forward with candidates whose qualifications more closely align with our immediate needs.
            </p>

            <p className="text-gray-700 leading-relaxed">
              This decision does not reflect your overall capabilities or potential. We encourage you to continue 
              developing your skills and consider applying for future opportunities that may be a better match for 
              your expertise.
            </p>

            {/* Recommendations */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h4 className="font-bold text-yellow-800 mb-4">Recommendations for Future Growth</h4>
              <ul className="space-y-2 text-yellow-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Continue building technical expertise in your field of interest
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Consider additional certifications or professional development courses
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Gain more hands-on experience through projects or internships
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Stay updated with our career opportunities for future openings
                </li>
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed">
              We appreciate your time and effort throughout this process, and we wish you the very best in your 
              career endeavors. Thank you for considering HR-GenAI as a potential employer.
            </p>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-gray-700 mb-2">Best regards,</p>
              <p className="font-bold text-gray-900">HR Team</p>
              <p className="text-gray-600">HR-GenAI</p>
              <p className="text-sm text-gray-500 mt-4">
                This is an automated letter generated by the HR-GenAI platform.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors">
            <Download className="w-5 h-5" />
            <span>Download Letter</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionLetterPage;