import React from 'react';
import { Github, Linkedin, Send, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="https://thumbs.dreamstime.com/b/letter-hr-logo-colorful-splash-background-combination-design-creative-industry-web-business-company-203790035.jpg" 
                alt="HR-GenAI" 
                className="h-10 w-10 rounded-lg"
              />
              <div>
                <h3 className="text-white font-bold text-lg">HR-GenAI</h3>
                <p className="text-sm text-gray-400">Transforming Hiring Through Digital DNA Intelligence</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              AI-powered hiring intelligence system that builds a "Digital DNA Profile" for every candidate, 
              measuring human potential through behavioral analysis and predictive performance scoring.
            </p>
            <div className="flex items-center space-x-2 text-gray-400 text-xs">
              <span className="px-2 py-1 bg-gray-800 rounded">Powered by OpenAI GPT-4</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/dashboard" className="text-gray-400 hover:text-blue-400 transition-colors">Dashboard</a></li>
              <li><a href="/analysis" className="text-gray-400 hover:text-blue-400 transition-colors">Analysis</a></li>
              <li><a href="/analytics" className="text-gray-400 hover:text-blue-400 transition-colors">Analytics</a></li>
              <li><a href="/docs" className="text-gray-400 hover:text-blue-400 transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex space-x-2">
              <a 
                href="https://github.com/abhishekgiri04" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/in/abhishek-giri04" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://t.me/AbhishekGiri7"
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-400 flex items-center">
            Built with <Heart className="w-4 h-4 mx-1 text-red-500" /> by HR-GenAI Team
          </p>
          <p className="text-gray-400 mt-2 md:mt-0">
            © 2025 HR-GenAI. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;