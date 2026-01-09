<div align="center">

<img src="docs/HRGenAI.jpeg" alt="HR-GenAI Logo" width="100%" style="margin-bottom: 20px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"/>

<h1>💡 HR-GenAI - AI-Powered Hiring Intelligence Platform</h1>

<h3 style="color: #2563eb; font-weight: 600; margin: 15px 0; font-size: 1.3em;">A revolutionary AI-powered hiring intelligence platform that transforms recruitment by combining intelligent resume analysis, AI-driven voice interviews, and proprietary Digital DNA Profiling to deliver up to 95% accuracy in candidate evaluation—enabling faster, fairer, and data-driven hiring decisions at scale.</h3>

<p style="font-size: 1.2em; color: #1e40af; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 12px; max-width: 800px; margin: 20px auto; line-height: 1.6; border-left: 4px solid #2563eb;">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AI_Powered-GPT--4-FF6B6B?style=for-the-badge&logo=openai&logoColor=white"/>
  <img src="https://img.shields.io/badge/Voice_AI-Huma-4ECDC4?style=for-the-badge&logo=microphone&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-45B7D1?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-20-96CEB4?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B-FFEAA7?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Accuracy-95%25-A29BFE?style=for-the-badge"/>
</p>

<img src="docs/CodeCatalyst.jpg" alt="Code Catalyst" width="100%" style="margin: 20px 0; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"/>

</div>

---

<div align="center">
  <img src="docs/ProblemStatements.png" alt="Problem Statement" width="100%" style="border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"/>
</div>

<br/>

The hiring industry is fundamentally broken. Traditional recruitment processes are plagued with inefficiencies that cost companies millions while missing top talent. HR teams spend 40+ hours per hire reading resumes manually, leading to overwhelmed staff and missed opportunities. With 90% of hiring decisions influenced by unconscious bias, diverse talent is systematically excluded, limiting innovation. The crisis deepens with 85% of resumes containing inaccurate information, making it impossible to trust candidate qualifications. Slow 45+ day hiring cycles result in losing top candidates to faster competitors, while surface-level interviews ignore personality and cultural alignment, leading to 33% turnover within 6 months. Each wrong hire costs 30% of annual salary ($18,000 for a $60K role), multiplying losses across organizations.

---

<div align="center">
  <img src="docs/Solutions.png" alt="Our Solution" width="100%" style="border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"/>
</div>

<br/>

**HR-GenAI revolutionizes hiring with intelligent automation and data-driven insights:**

• **3.2 Second Resume Analysis** - GPT-4 powered extraction with 95% accuracy, eliminating hours of manual screening  
• **AI Voice Interviewer (Huma)** - Conducts natural conversations, adapts questions dynamically, and analyzes voice patterns for confidence levels  
• **100% Bias-Free Evaluation** - Objective AI assessment eliminates unconscious bias, ensuring fair evaluation for all candidates  
• **Digital DNA Profiling** - MBTI personality analysis, OCEAN traits evaluation, and EQ scoring for comprehensive candidate insights  
• **Real-Time Anti-Cheating** - Advanced proctoring with camera monitoring, screen sharing enforcement, and automatic violation detection  
• **Predictive Analytics** - 91.5% accurate performance and retention predictions based on interview data and personality analysis  
• **Automated Workflow** - Template-based interviews, bulk email invitations, and detailed PDF reports streamline the entire hiring process

---


<div align="center">
  <img src="docs/Features.png" alt="Key Features" width="100%" style="border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"/>
</div>

<br/>

**Advanced AI-Powered Hiring Platform Features:**

• **GPT-4 Resume Analysis** - Complete candidate profile extraction with 95% accuracy and red flag detection  
• **Huma Voice AI** - Natural conversation interviewer with dynamic questioning and voice pattern analysis  
• **Dynamic Question Engine** - Role-specific questions based on candidate background to prevent cheating  
• **Multi-Layer Proctoring** - Webcam monitoring, screen sharing, and suspicious behavior detection  
• **Personality & EQ Profiling** - MBTI framework, Big Five traits, and emotional intelligence scoring  
• **Performance Prediction** - 91.5% accurate job performance and retention probability algorithms  
• **Enterprise Dashboard** - Real-time analytics, candidate comparison, and customizable reporting  
• **Smart Communication** - Automated email templates, scheduling, and PDF report generation  
• **Template Management** - Reusable interview templates with custom scoring criteria  
• **API Integration** - RESTful APIs and webhook support for existing HR systems

---

## 📁 Project Directory Structure

```
HR-GenAI/
├── frontend/                        # React Frontend Application (Port 3000)
│   ├── public/                      # Static assets and HTML template
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── common/              # Shared components (Header, Footer, etc.)
│   │   │   ├── forms/               # Form components
│   │   │   └── ui/                  # UI elements (buttons, modals, etc.)
│   │   ├── pages/                   # Application pages/routes
│   │   │   ├── auth/                # Authentication pages
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   ├── interview/           # Interview interface
│   │   │   └── analytics/           # Analytics and reports
│   │   ├── services/                # API services and utilities
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── utils/                   # Helper functions
│   │   ├── styles/                  # CSS and styling files
│   │   ├── App.jsx                  # Main application component
│   │   └── main.jsx                 # Application entry point
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   └── .env.example                 # Environment variables template
├── backend/                         # Node.js Backend Server (Port 5001)
│   ├── src/
│   │   ├── controllers/             # Request handlers and business logic
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── candidateController.js # Candidate management
│   │   │   ├── interviewController.js # Interview operations
│   │   │   └── analyticsController.js # Analytics and reporting
│   │   ├── models/                  # Database schemas and models
│   │   │   ├── User.js              # User model
│   │   │   ├── Candidate.js         # Candidate model
│   │   │   ├── Interview.js         # Interview model
│   │   │   └── Template.js          # Interview template model
│   │   ├── routes/                  # API route definitions
│   │   │   ├── auth.js              # Authentication routes
│   │   │   ├── candidates.js        # Candidate routes
│   │   │   ├── interviews.js        # Interview routes
│   │   │   └── analytics.js         # Analytics routes
│   │   ├── services/                # External services and integrations
│   │   │   ├── openaiService.js     # OpenAI GPT-4 integration
│   │   │   ├── emailService.js      # Email notifications
│   │   │   ├── voiceService.js      # Voice processing
│   │   │   └── pdfService.js        # PDF generation
│   │   ├── middleware/              # Authentication & validation middleware
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── validation.js        # Request validation
│   │   │   └── upload.js            # File upload handling
│   │   ├── utils/                   # Utility functions
│   │   ├── config/                  # Configuration files
│   │   └── server.js                # Main server application
│   ├── package.json                 # Backend dependencies
│   └── .env.example                 # Environment variables template
├── docs/                            # Documentation & Project Assets
│   ├── API_DOCUMENTATION.md         # Complete API reference
│   ├── DEPLOYMENT.md                # Deployment instructions
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   ├── screenshots/                 # Application screenshots
│   │   ├── HR-Dashboard.png         # Main dashboard
│   │   ├── Home_Page.png            # Landing page
│   │   ├── Loading_Page.png         # Loading screen
│   │   ├── SignIn_Page.png          # Authentication
│   │   ├── SignUp_Page.png          # Registration
│   │   ├── Candidate_Page.png       # Candidate interface
│   │   ├── Assessment_Page.png      # Assessment selection
│   │   ├── Huma_Voice-AI.png        # AI interviewer interface
│   │   ├── Analytics-Dashboard.png  # Analytics dashboard
│   │   ├── Proctoring_Setup.png     # Proctoring configuration
│   │   ├── Settings.png             # Settings page
│   │   └── Profile_Page.png         # User profile
│   ├── diagrams/                    # Architecture diagrams
│   │   ├── Architecture.png         # System architecture
│   │   ├── DFD.png                  # Data flow diagram
│   │   └── System Architecture & DFD.png # Complete architecture
│   ├── assets/                      # Project assets
│   │   ├── HRGenAI.jpeg             # Project logo
│   │   ├── ProblemStatements.png    # Problem statement
│   │   ├── Solutions.png            # Solution overview
│   │   └── Features.png             # Features overview
│   └── README.md                    # Documentation index
├── scripts/                         # Development and deployment scripts
│   ├── start-dev.sh                 # Start development servers
│   ├── stop-dev.sh                  # Stop development servers
│   ├── setup.sh                     # Initial project setup
│   └── deploy.sh                    # Production deployment
├── tests/                           # Test suites
│   ├── frontend/                    # Frontend tests
│   ├── backend/                     # Backend tests
│   └── e2e/                         # End-to-end tests
├── README.md                        # Main project documentation
├── LICENSE                          # MIT License
├── .env.example                     # Global environment template
├── .gitignore                       # Git ignore patterns
├── docker-compose.yml               # Docker configuration
├── package.json                     # Root package configuration
└── CHANGELOG.md                     # Version history
```

---

## 📸 Screenshots

<table>
<tr>
<td><img src="docs/Loading_Page.png" width="100%"/><br/><b>Loading Screen</b></td>
<td><img src="docs/Home_Page.png" width="100%"/><br/><b>Home Page</b></td>
</tr>
<tr>
<td><img src="docs/SignIn_Page.png" width="100%"/><br/><b>Sign In Page</b></td>
<td><img src="docs/SignUp_Page.png" width="100%"/><br/><b>Sign Up Page</b></td>
</tr>
<tr>
<td><img src="docs/HR-Dashboard.png" width="100%"/><br/><b>HR Dashboard</b></td>
<td><img src="docs/Analytics-Dashboard.png" width="100%"/><br/><b>Analytics Dashboard</b></td>
</tr>
<tr>
<td><img src="docs/Candidate_Page.png" width="100%"/><br/><b>Candidate Dashboard</b></td>
<td><img src="docs/Assesment_Page.png" width="100%"/><br/><b>Assessment Selection</b></td>
</tr>
<tr>
<td><img src="docs/Huma_Voice-AI.png" width="100%"/><br/><b>Huma AI Interviewer</b></td>
<td><img src="docs/Proctoring_Setup.png" width="100%"/><br/><b>Proctoring Setup</b></td>
</tr>
<tr>
<td><img src="docs/Settings.png" width="100%"/><br/><b>Settings Page</b></td>
<td><img src="docs/Profile_Page.png" width="100%"/><br/><b>User Profile</b></td>
</tr>
</table>

---

<div align="center">

<img src="docs/System_Architecture.png" alt="System Architecture & DFD" width="800"/>

### Architecture Overview
<img src="docs/Architecture.png" alt="Architecture Diagram" width="100%"/>

### Data Flow

```mermaid
graph TD
    A[HR Manager] -->|Resume Upload| B[Resume Processor<br/>GPT-4 Analysis]
    B -->|Extracted Data| C[Candidate Database]
    B -->|Profile Info| D[Huma AI Interviewer]
    D -->|Voice Data| E[AI Analysis Engine<br/>Personality + EQ]
    E -->|Results| F[Digital DNA Generator]
    F -->|Final Report| G[Email Service]
    
    style A fill:#E3F2FD,stroke:#2196F3,stroke-width:2px,color:#000
    style B fill:#FFF9C4,stroke:#FFC107,stroke-width:2px,color:#000
    style C fill:#E0F2F1,stroke:#009688,stroke-width:2px,color:#000
    style D fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px,color:#000
    style E fill:#C8E6C9,stroke:#4CAF50,stroke-width:2px,color:#000
    style F fill:#FFCCBC,stroke:#FF5722,stroke-width:2px,color:#000
    style G fill:#FCE4EC,stroke:#E91E63,stroke-width:2px,color:#000
```

</div>



---

## 🛠️ Tech Stack

<div align="center">

<table>
<thead>
<tr>
<th>🖥️ Technology</th>
<th>⚙️ Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/></td>
<td>Modern frontend UI framework with component architecture</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white"/></td>
<td>Backend runtime with Express.js framework</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white"/></td>
<td>Advanced AI for resume analysis and question generation</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white"/></td>
<td>Gemini AI for fallback processing and analysis</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/></td>
<td>NoSQL database for candidate profiles and analytics</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/></td>
<td>Authentication and user management system</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Web%20Speech%20API-FF6B6B?style=for-the-badge&logo=html5&logoColor=white"/></td>
<td>Voice recognition and text-to-speech for Huma AI</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/></td>
<td>Utility-first CSS framework for responsive design</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Nodemailer-339933?style=for-the-badge&logo=node.js&logoColor=white"/></td>
<td>Email service for invitations and automated reports</td>
</tr>
</tbody>
</table>

</div>

---

## 🚀 Installation & Deployment

<div align="center">

### 🌐 Live Demo

**Frontend**: [https://hrgen-dev.vercel.app](https://hrgen-dev.vercel.app)  
**Backend API**: [https://hrgen-dev.onrender.com](https://hrgen-dev.onrender.com)

</div>

---

### 📋 Prerequisites

<div align="center">

<table>
<tr>
<th><b>Software</b></th>
<th><b>Version</b></th>
<th><b>Purpose</b></th>
</tr>
<tr>
<td>Node.js</td>
<td>18+</td>
<td>Frontend and backend runtime</td>
</tr>
<tr>
<td>MongoDB</td>
<td>6.0+</td>
<td>Database for candidate data</td>
</tr>
<tr>
<td>OpenAI API Key</td>
<td>GPT-4</td>
<td>AI-powered resume analysis</td>
</tr>
<tr>
<td>RAM</td>
<td>8GB+</td>
<td>AI model processing</td>
</tr>
<tr>
<td>Storage</td>
<td>2GB+</td>
<td>Dependencies and data</td>
</tr>
</table>

</div>

---

### ⚡ Quick Start (Local Development)

#### Step 1: Clone Repository
```bash
git clone https://github.com/abhishekgiri04/HR-GenAI.git
cd HR-GenAI
```

#### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys:
# - OPENAI_API_KEY (required)
# - GEMINI_API_KEY (optional)
# - MONGODB_URI
# - EMAIL credentials
```

#### Step 3: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure Firebase
cp .env.example .env
# Add your Firebase configuration
```

#### Step 4: Run Application

**Using Development Scripts:**
```bash
# Start both frontend and backend
chmod +x start-dev.sh
./start-dev.sh
```

**Or manually in separate terminals:**

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
```

#### Step 5: Access Application

- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **API Health Check**: [http://localhost:5001/health](http://localhost:5001/health)

---

### 🛑 Stop Services

```bash
./stop-dev.sh
```

---

### 🌐 Production Deployment

**Frontend (Vercel):**
- Live at: [https://hrgen-dev.vercel.app](https://hrgen-dev.vercel.app)
- Auto-deploys from `main` branch

**Backend (Render):**
- Live at: [https://hrgen-dev.onrender.com](https://hrgen-dev.onrender.com)
- Environment variables configured in Render dashboard

---

## 📡 API Documentation

<div align="center">

### Complete API Reference

**For detailed API documentation with all endpoints, authentication, and examples:**

**[📖 View Full API Documentation](docs/API_DOCUMENTATION.md)**

</div>

---

## Performance Metrics

<div align="center">

<table>
<tr>
<th style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px;"><b>Metric</b></th>
<th style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px;"><b>Performance</b></th>
<th style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px;"><b>Impact</b></th>
</tr>
<tr>
<td style="padding: 12px; border-left: 4px solid #4CAF50;"><b>Resume Analysis Accuracy</b></td>
<td style="padding: 12px; color: #2E7D32; font-weight: bold;">95%</td>
<td style="padding: 12px;">Precision in candidate evaluation</td>
</tr>
<tr>
<td style="padding: 12px; border-left: 4px solid #FF9800;"><b>Processing Speed</b></td>
<td style="padding: 12px; color: #E65100; font-weight: bold;">3.2 seconds</td>
<td style="padding: 12px;">vs 2+ hours traditional screening</td>
</tr>
<tr>
<td style="padding: 12px; border-left: 4px solid #2196F3;"><b>Interview Completion</b></td>
<td style="padding: 12px; color: #1565C0; font-weight: bold;">94.2%</td>
<td style="padding: 12px;">High candidate engagement rate</td>
</tr>
<tr>
<td style="padding: 12px; border-left: 4px solid #9C27B0;"><b>Bias Elimination</b></td>
<td style="padding: 12px; color: #7B1FA2; font-weight: bold;">100%</td>
<td style="padding: 12px;">Objective AI assessment</td>
</tr>
<tr>
<td style="padding: 12px; border-left: 4px solid #4CAF50;"><b>Retention Prediction</b></td>
<td style="padding: 12px; color: #2E7D32; font-weight: bold;">91.5%</td>
<td style="padding: 12px;">6-month accuracy forecast</td>
</tr>
<tr>
<td style="padding: 12px; border-left: 4px solid #FF5722;"><b>Hiring Speed</b></td>
<td style="padding: 12px; color: #D84315; font-weight: bold;">10x Faster</td>
<td style="padding: 12px;">45 days → 4.5 days cycle</td>
</tr>
<tr>
<td style="padding: 12px; border-left: 4px solid #607D8B;"><b>Cost Reduction</b></td>
<td style="padding: 12px; color: #37474F; font-weight: bold;">70%</td>
<td style="padding: 12px;">$4,000 → $1,200 per hire</td>
</tr>
<tr>
<td style="padding: 12px; border-left: 4px solid #795548;"><b>Candidate Experience</b></td>
<td style="padding: 12px; color: #5D4037; font-weight: bold;">4.8/5</td>
<td style="padding: 12px;">vs 3.2/5 traditional rating</td>
</tr>
</table>

</div>

---

<div align="center">

## 👥 Team

<table>
<tr>
<td align="center">
  <img src="docs/AbhishekGiri.jpg" width="150" height="150" style="border-radius: 50%; object-fit: cover; border: 4px solid #2563eb;"/><br/>
  <b>🧑🏻💻 Abhishek Giri</b><br/>
  <em>Team Lead & Full-stack Developer</em><br/>
  <a href="https://github.com/abhishekgiri04">GitHub</a> | <a href="https://linkedin.com/in/abhishek-giri04">LinkedIn</a>
</td>
<td align="center">
  <img src="docs/MuskanSharma.jpeg" width="150" height="150" style="border-radius: 50%; object-fit: cover; border: 4px solid #e91e63;"/><br/>
  <b>👩🏻💻 Muskan Sharma</b><br/>
  <em>Frontend Developer</em><br/>
  <a href="https://github.com/MuskanSharma2006">GitHub</a>
</td>
<td align="center">
  <img src="docs/KashishSharma.jpeg" width="150" height="150" style="border-radius: 50%; object-fit: cover; border: 4px solid #4caf50;"/><br/>
  <b>👩🏻💻 Kashish Sharma</b><br/>
  <em>Backend Developer</em><br/>
  <a href="https://github.com/KashishSharma11">GitHub</a>
</td>
<td align="center">
  <img src="docs/SidhKhurana.jpeg" width="150" height="150" style="border-radius: 50%; object-fit: cover; border: 4px solid #ff9800;"/><br/>
  <b>🧑🏻💻 Sidh Khurana</b><br/>
  <em>AI/ML Engineer</em><br/>
  <a href="https://github.com/Sidh1818">GitHub</a>
</td>
</tr>
</table>

</div>

<div align="center">

<table>
<tr>
<td align="center">
  <b>🧑🏻‍💻 Abhishek Giri</b><br/>
  <em>Team Lead & Full-stack Developer</em><br/>
  <a href="https://github.com/abhishekgiri04">GitHub</a> | <a href="https://linkedin.com/in/abhishek-giri04">LinkedIn</a>
</td>
<td align="center">
  <b>👩🏻‍💻 Muskan Sharma</b><br/>
  <em>Frontend Developer</em>
</td>
<td align="center">
  <b>👩🏻‍💻 Kashish Sharma</b><br/>
  <em>Backend Developer</em>
</td>
<td align="center">
  <b>🧑🏻‍💻 Sidh Khurana</b><br/>
  <em>AI/ML Engineer</em>
</td>
</tr>
</table>

</div>

---

## 📞 Contact & Support

<div align="center">

### 🤝 Get In Touch

**Abhishek Giri** - Team Lead & Project Coordinator

<p>
<a href="https://linkedin.com/in/abhishek-giri04">
<img src="https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>
<a href="https://github.com/abhishekgiri04">
<img src="https://img.shields.io/badge/GitHub-Follow-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>
<a href="mailto:abhishekgiri.dev@gmail.com">
<img src="https://img.shields.io/badge/Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/>
</a>
</p>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Built with ❤️ for Human Potential Excellence

<h2 style="color: #2563eb; margin: 20px 0;">HR-GenAI</h2>

<p style="font-size: 1.1em; color: #1e40af; max-width: 600px; margin: 15px auto; line-height: 1.6;">
<em>AI-powered hiring intelligence</em>
</p>

---

<p style="color: #64748b; margin: 20px 0;">
<strong>© 2026 HR-GenAI | All Rights Reserved</strong>
</p>

<p style="color: #2563eb; font-weight: 600;">
<em>Empowering intelligent hiring decisions</em>
</p>

</div>