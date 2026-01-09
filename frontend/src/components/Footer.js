import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Github, Mail, Phone, MapPin, Heart, ExternalLink, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-30"></div>
                <img 
                  src="https://thumbs.dreamstime.com/b/letter-hr-logo-colorful-splash-background-combination-design-creative-industry-web-business-company-203790035.jpg"
                  alt="HR-GenAI Logo"
                  className="relative w-12 h-12 rounded-2xl shadow-lg"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">HR-GenAI</h3>
                <p className="text-slate-400 font-medium">Intelligent Recruitment Platform</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6 max-w-md">
              Revolutionary AI-powered hiring intelligence platform featuring Digital DNA profiling, 
              voice-based interviews with Huma AI, and predictive analytics that transforms traditional 
              recruitment into data-driven talent acquisition with 95% accuracy and bias-free evaluation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-slate-400 hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Reports</span>
                </Link>
              </li>
              <li>
                <Link to="/hr-dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Interviews</span>
                </Link>
              </li>
              <li>
                <a href="https://hrgen-dev.onrender.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Documentation</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Connect</h4>
            <div className="space-y-3">
              <a href="mailto:abhishekgiri1978@gmail.com" className="flex items-center text-slate-400 hover:text-white transition-colors group">
                <Mail className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                <span>abhishekgiri1978@gmail.com</span>
              </a>
              <a href="https://github.com/abhishekgiri04" target="_blank" rel="noopener noreferrer" className="flex items-center text-slate-400 hover:text-white transition-colors group">
                <Github className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                <span>GitHub</span>
              </a>
              <a href="https://t.me/AbhishekGiri7" target="_blank" rel="noopener noreferrer" className="flex items-center text-slate-400 hover:text-white transition-colors group">
                <svg className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span>Telegram</span>
              </a>
              <div className="flex items-center text-slate-400">
                <MapPin className="w-4 h-4 mr-3" />
                <span>Haridwar, Uttarakhand, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-4 mb-8">
          <a href="https://github.com/abhishekgiri04" target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-2xl transition-all hover:scale-110 group">
            <Github className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </a>
          <a href="https://linkedin.com/in/abhishek-giri04" target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-2xl transition-all hover:scale-110 group">
            <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </a>
          <a href="https://t.me/AbhishekGiri7" target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-2xl transition-all hover:scale-110 group">
            <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>
          <a href="mailto:abhishekgiri1978@gmail.com" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-2xl transition-all hover:scale-110 group">
            <Mail className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-slate-400 mb-4 md:mb-0">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>by Code Catalyst</span>
            </div>
            <div className="text-slate-400 text-sm">
              © {currentYear} HR-GenAI. Empowering smarter hiring decisions.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;