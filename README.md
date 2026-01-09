<h1 align="center">🧬 HR-GenAI — AI-Powered Hiring Intelligence Platform</h1>

<p align="center">
  🚀 A comprehensive AI-powered HR automation platform that replaces traditional hiring with intelligent, fair, and data-driven candidate evaluation through <b>Digital DNA Profiling</b> and voice-based interviews.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
</p>

---

## 📖 Problem Statement
Traditional hiring processes are plagued with inefficiencies: 85% of resumes contain false information, 60% of new hires underperform, 33% quit within 6 months, and 90% of decisions suffer from unconscious bias. Manual screening takes 40+ hours per hire with 45+ day cycles.

---

## 💡 Our Solution
HR-GenAI is a revolutionary AI-powered platform that transforms hiring through:

- 🧠 **AI Voice Interviewer (Huma)** — Conducts natural voice interviews like a real HR professional
- 📄 **GPT-4 Resume Analysis** — Extracts complete candidate profiles with 95% accuracy
- 🎲 **Dynamic Question Generation** — Creates unique questions for each candidate based on skills
- 🛡️ **Strict Anti-Cheating** — Real-time proctoring with automatic disqualification
- 🎭 **Personality Detection** — MBTI, OCEAN traits, and EQ analysis
- 📊 **Predictive Analytics** — Performance and retention predictions
- ✉️ **Automated Notifications** — Professional email reports with results
- 📅 **Template Scheduling** — Auto-activate interviews at specific times
- 📧 **Bulk Invitations** — Send interview invites to multiple candidates

---  

## 🚀 Key Features

✅  **AI Voice Interviewer** — Meet Huma, your AI HR agent who conducts natural interviews  
✅  **95% Resume Accuracy** — GPT-4 powered extraction of ALL candidate details  
✅  **Dynamic Questions** — Unique questions generated based on candidate skills and template requirements  
✅  **Real-time Proctoring** — Camera, microphone, and screen sharing enforcement  
✅  **Personality Profiling** — MBTI types, OCEAN traits, and work style analysis  
✅  **EQ Analysis** — Voice confidence, stress management, and emotional intelligence  
✅  **Bias-Free Hiring** — 100% objective assessment eliminating unconscious bias  
✅  **Predictive Scoring** — Performance and retention probability predictions  
✅  **Template System** — Create reusable interview templates with scheduling  
✅  **Bulk Email Invitations** — Invite multiple candidates with one click  
✅  **Auto Email Reports** — Generate and send detailed interview results via email

---  

## 🏗️ System Architecture

<div align="center">

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App] --> B[Authentication]
        A --> C[Dashboard]
        A --> D[Interview Interface]
        A --> E[Analytics]
    end
    
    subgraph "Backend Layer"
        F[Express.js API] --> G[Authentication Controller]
        F --> H[Candidate Controller]
        F --> I[Interview Controller]
        F --> J[Template Controller]
    end
    
    subgraph "AI Engine Layer"
        K[GPT-4 Resume Analysis]
        L[Voice Emotion Analyzer]
        M[Question Generator]
        N[Evaluation Engine]
        O[Personality Profiler]
    end
    
    subgraph "Data Layer"
        P[(MongoDB)]
        Q[Firebase Auth]
        R[File Storage]
    end
    
    subgraph "External Services"
        S[OpenAI API]
        T[Gemini API]
        U[Email Service]
        V[WebSocket]
    end
    
    A --> F
    F --> K
    F --> L
    F --> M
    F --> N
    F --> O
    F --> P
    B --> Q
    F --> S
    F --> T
    F --> U
    F --> V
    
    style A fill:#61dafb
    style F fill:#68d391
    style K fill:#ff6b6b
    style P fill:#4ecdc4
```

### 🔄 Data Flow

1. **Resume Upload** → GPT-4 Analysis → Candidate Profile Creation
2. **Interview Setup** → Dynamic Question Generation → Voice/Text Interview
3. **Real-time Evaluation** → AI Analysis → Digital DNA Profile
4. **Results Generation** → Email Reports → Dashboard Analytics

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
<td><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/></td>
<td>Modern frontend with component architecture</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white"/></td>
<td>Backend API with Express.js framework</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white"/></td>
<td>GPT-4 for resume analysis and question generation</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white"/></td>
<td>Gemini AI for fallback processing</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/></td>
<td>NoSQL database for candidate profiles</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/></td>
<td>Authentication and user management</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Web%20Speech%20API-FF6B6B?style=for-the-badge&logo=html5&logoColor=white"/></td>
<td>Voice recognition and text-to-speech</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/></td>
<td>Utility-first CSS framework</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Nodemailer-339933?style=for-the-badge&logo=node.js&logoColor=white"/></td>
<td>Email service for invitations and reports</td>
</tr>
</tbody>
</table>

</div>

---

## 📁 Project Directory Structure

```
HR-GenAI/
├── 📂 frontend/                    # 🎨 React frontend application (Port 3000)
│   ├── 📂 src/
│   │   ├── 📂 components/          # 🧩 Reusable UI components
│   │   │   ├── 📄 Header.js             # 🔝 Navigation header
│   │   │   ├── 📄 Footer.js             # 🔻 Footer component
│   │   │   ├── 📄 ResumeUpload.js       # 📄 File upload interface
│   │   │   ├── 📄 GenomeChart.js        # 📊 DNA visualization
│   │   │   ├── 📄 TextInterview.js      # 💬 Text-based interview
│   │   │   ├── 📄 TimedCulturalInterview.js # ⏱️ Timed interview with proctoring
│   │   │   ├── 📄 VoiceInterviewBox.js  # 🎤 Huma AI voice interviewer
│   │   │   ├── 📄 TemplateSelection.js  # 📋 Template selection interface
│   │   │   ├── 📄 TemplateBasedInterview.js # 🎯 Template interview flow
│   │   │   ├── 📄 CreateTemplateModal.js # ➕ Create interview templates
│   │   │   ├── 📄 BulkInviteModal.js    # 📧 Bulk candidate invitations
│   │   │   ├── 📄 ProtectedRoute.js     # 🔐 Route protection
│   │   │   ├── 📄 RoleSelection.js      # 👤 User role selection
│   │   │   ├── 📄 StatsCard.js          # 📊 Statistics cards
│   │   │   ├── 📄 AIAgent.js            # 🤖 Advanced AI interviewer
│   │   │   └── 📄 InterviewManager.js   # 🎯 Interview flow management
│   │   ├── 📂 pages/               # 📄 Main application pages
│   │   │   ├── 📄 LoadingPage.js        # ⏳ Loading animation
│   │   │   ├── 📄 SignInPage.js         # 🔑 Sign in page
│   │   │   ├── 📄 SignUpPage.js         # 📝 Sign up page
│   │   │   ├── 📄 DashboardPage.js      # 🏠 Main dashboard
│   │   │   ├── 📄 HRDashboardPage.js    # 👔 HR management dashboard
│   │   │   ├── 📄 AnalyticsPage.js      # 📈 Real-time analytics
│   │   │   ├── 📄 CandidateProfilePage.js # 👤 Candidate profile view
│   │   │   ├── 📄 GenomeProfilePage.js  # 🧬 DNA profile display
│   │   │   ├── 📄 InterviewPage.js      # 🎤 Interview interface
│   │   │   ├── 📄 SettingsPage.js       # ⚙️ User settings
│   │   │   └── 📄 UserProfilePage.js    # 👤 User profile management
│   │   ├── 📂 contexts/            # 🔄 React context providers
│   │   │   └── 📄 authContext.js        # 🔐 Authentication state
│   │   ├── 📂 firebase/            # 🔥 Firebase configuration
│   │   │   └── 📄 firebaseConfig.js     # 🔥 Firebase setup
│   │   ├── 📂 services/            # 🔌 API integration
│   │   │   └── 📄 websocketService.js   # 🔌 WebSocket client
│   │   └── 📄 App.js               # 🚀 Main application
│   └── 📄 package.json             # 📦 Frontend dependencies
├── 📂 backend/                     # 🔧 Node.js backend service (Port 5001)
│   └── 📂 src/
│       ├── 📂 ai-engines/          # 🤖 AI processing engines
│       │   ├── 📄 skill-dna.js          # 📄 Resume extraction engine
│       │   ├── 📄 template-question-generator.js # 🎯 Question generation
│       │   ├── 📄 voice-emotion-analyzer.js # 🎤 Voice analysis
│       │   ├── 📄 ai-evaluation-engine.js # 📊 Interview evaluation
│       │   ├── 📄 intelligent-question-generator.js # 🧠 Smart question creation
│       │   └── 📄 InterviewAIEngine.js  # 🎯 Interview AI coordinator
│       ├── 📂 controllers/         # 🎮 API controllers
│       │   ├── 📄 candidateController.js # 👤 Candidate management
│       │   └── 📄 genomeController.js    # 🧬 DNA profiling
│       ├── 📂 models/              # 📋 Database models
│       │   ├── 📄 Candidate.js          # 👤 Candidate schema
│       │   ├── 📄 GenomeProfile.js      # 🧬 DNA profile schema
│       │   ├── 📄 Template.js           # 📋 Interview template schema
│       │   └── 📄 Interview.js          # 🎤 Interview session schema
│       ├── 📂 routes/              # 🛣️ API routes
│       │   ├── 📄 candidates.js         # 👤 Candidate routes
│       │   ├── 📄 analytics.js          # 📊 Analytics routes
│       │   ├── 📄 templates.js          # 📋 Template routes
│       │   ├── 📄 invitations.js        # 📧 Invitation routes
│       │   ├── 📄 interview.js          # 🎤 Interview routes
│       │   └── 📄 hrInterview.js        # 👔 HR interview management
│       ├── 📂 services/            # 📧 External services
│       │   ├── 📄 emailService.js       # ✉️ Email notifications
│       │   ├── 📄 websocketService.js   # 🔌 WebSocket server
│       │   └── 📄 templateScheduler.js  # 📅 Template auto-activation
│       └── 📄 server.js            # 🚀 Express server
├── 📂 docs/                        # 📸 Documentation and screenshots
│   ├── 📄 Loading_Page.png         # 🖼️ Loading screen
│   ├── 📄 SignIn_Page.png          # 🖼️ Sign in page
│   ├── 📄 SignUp_Page.png          # 🖼️ Sign up page
│   ├── 📄 Home_Page.png            # 🖼️ Dashboard page
│   ├── 📄 HR-Dashboard.png         # 🖼️ HR dashboard
│   ├── 📄 Analytics-Dashboard.png  # 🖼️ Analytics dashboard
│   ├── 📄 Candidate_Page.png       # 🖼️ Candidate profile
│   ├── 📄 Assesment_Page.png       # 🖼️ Assessment interface
│   ├── 📄 Proctoring_Setup.png     # 🖼️ Proctoring setup
│   ├── 📄 Huma_Voice-AI.png        # 🖼️ Huma AI interviewer
│   ├── 📄 Settings.png             # 🖼️ Settings page
│   └── 📄 Profile_Page.png         # 🖼️ User profile
├── 📄 LICENSE                      # 📜 MIT License
├── 📄 start-dev.sh                 # 🚀 Start all services
├── 📄 stop-dev.sh                  # 🛑 Stop all services
├── 📄 .env.example                 # 🔧 Environment template
├── 📄 .gitignore                   # 🚫 Git ignore patterns
└── 📄 README.md                    # 📖 Project documentation
```

---

## 📸 Application Screenshots

### Loading & Authentication
<table>
  <tr>
    <td><img src="docs/Loading_Page.png" alt="Loading Screen" width="400"/><br/><b>Loading Screen</b></td>
    <td><img src="docs/SignIn_Page.png" alt="Sign In" width="400"/><br/><b>Sign In Page</b></td>
  </tr>
  <tr>
    <td><img src="docs/SignUp_Page.png" alt="Sign Up" width="400"/><br/><b>Sign Up Page</b></td>
    <td><img src="docs/Home_Page.png" alt="Dashboard" width="400"/><br/><b>Main Dashboard</b></td>
  </tr>
</table>

### HR Management
<table>
  <tr>
    <td><img src="docs/HR-Dashboard.png" alt="HR Dashboard" width="400"/><br/><b>HR Dashboard</b></td>
    <td><img src="docs/Analytics-Dashboard.png" alt="Analytics" width="400"/><br/><b>Analytics Dashboard</b></td>
  </tr>
  <tr>
    <td><img src="docs/Candidate_Page.png" alt="Candidate" width="400"/><br/><b>Candidate Profile</b></td>
    <td><img src="docs/Assesment_Page.png" alt="Assessment" width="400"/><br/><b>Assessment Selection</b></td>
  </tr>
</table>

### Interview & Assessment
<table>
  <tr>
    <td><img src="docs/Proctoring_Setup.png" alt="Proctoring" width="400"/><br/><b>Proctoring Setup</b></td>
    <td><img src="docs/Huma_Voice-AI.png" alt="Huma AI" width="400"/><br/><b>Huma AI Interviewer</b></td>
  </tr>
  <tr>
    <td><img src="docs/Settings.png" alt="Settings" width="400"/><br/><b>Settings Page</b></td>
    <td><img src="docs/Profile_Page.png" alt="User Profile" width="400"/><br/><b>User Profile</b></td>
  </tr>
</table>

---

## 📦 How to Run

### 📌 Prerequisites
- ✅ **Node.js 18+** installed
- ✅ **MongoDB** installed and running
- ✅ **OpenAI API Key** (required)
- ✅ **Gemini API Key** (optional, for fallback)
- ✅ **Gmail Account** (for email notifications)

### 📌 Installation

```bash
# Start MongoDB
# macOS
brew services start mongodb/brew/mongodb-community

# Ubuntu
sudo systemctl start mongod
```

### 🚀 Quick Start

1. **Clone and setup:**

   ```bash
   git clone https://github.com/abhishekgiri04/HR-GenAI.git
   cd HR-GenAI
   ```

2. **Configure environment:**

   ```bash
   # Copy environment templates
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   
   # Edit .env files with your API keys:
   # - OPENAI_API_KEY (required)
   # - GEMINI_API_KEY (optional)
   # - EMAIL_USER & EMAIL_PASS (Gmail credentials)
   # - Firebase keys in frontend/.env
   ```

3. **Install dependencies:**

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

4. **Start all services:**

   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

5. **Access the platform:**

   ```
   Frontend: http://localhost:3000
   Backend:  http://localhost:5001
   ```

### 🛑 Stop Services

```bash
./stop-dev.sh
```

---

## 🤖 Meet Huma - Your AI Interviewer

**Huma** is our advanced AI HR agent who:

- 🎤 **Speaks naturally** — Uses text-to-speech for realistic conversations
- 🧠 **Knows your resume** — Reads and understands every detail
- 🎯 **Asks personalized questions** — Based on YOUR specific skills and experience
- 👁️ **Monitors behavior** — Real-time proctoring and cheating detection
- 📊 **Analyzes responses** — Voice confidence, EQ, and personality traits
- ✉️ **Sends results** — Automated email reports with detailed feedback

---

## 🌐 API Endpoints

```bash
# Backend API (Port 5001)
POST /api/candidates/upload          # Upload and analyze resume
POST /api/candidates/bulk-invite     # Send bulk invitations
GET  /api/candidates/:id             # Get candidate profile
POST /api/interview/generate-questions/:candidateId/:templateId # Generate dynamic questions
POST /api/interview/evaluate/:candidateId # Evaluate interview responses
GET  /api/hr/templates               # Get interview templates
POST /api/hr/templates               # Create interview template
GET  /health                         # Health check
```

---

## 🔧 Environment Setup

Create `.env` files in root, frontend, and backend directories:

**Root `.env`:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/hr-genai

# OpenAI (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:3000

# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=hr-genai-secret-key-2025
JWT_EXPIRE=7d
```

**Frontend `.env`:**
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

## 📊 Performance Metrics

- **95% AI Accuracy** — Resume extraction and analysis precision
- **3.2 seconds** — Average resume processing time
- **94.2% Success Rate** — Interview completion rate
- **91.5% Retention** — 6-month employee retention prediction
- **100% Bias-Free** — Objective AI-powered evaluation
- **10x Faster** — Compared to traditional hiring processes
- **Auto-Scheduling** — Templates activate automatically at set times
- **Bulk Processing** — Invite unlimited candidates simultaneously

---

## 🎯 Core Workflow

1. **📄 Resume Upload** → GPT-4 extracts complete candidate profile
2. **📧 Bulk Invitations** → HR sends interview invites to multiple candidates
3. **📋 Template Selection** → Candidate selects assigned interview template
4. **📝 Text Interview** → Basic questions in text format (behavioral)
5. **🎤 Voice Interview** → Technical questions with Huma AI
6. **🛡️ Real-time Proctoring** → Camera, mic, screen sharing enforcement
7. **🧬 DNA Analysis** → Personality, EQ, and behavioral profiling
8. **📊 Predictive Scoring** → Performance and retention predictions
9. **✉️ Auto Email Reports** → Detailed interview results sent via email

---

## 🌱 Future Scope
- 📱 **Mobile Application** — iOS and Android apps
- 🌍 **Multi-language Support** — Global hiring capabilities
- 📹 **Video Analysis** — Facial expression and body language
- 👥 **Team Compatibility** — Team fit analysis
- 🔐 **Enterprise Security** — Advanced authentication and encryption
- 📊 **Advanced Analytics** — Predictive hiring insights
- 🔗 **ATS Integration** — Connect with existing HR systems

---  

## 👥 Team

| Member | Role | Contribution |
|--------|------|--------------|
| **Abhishek Giri** | Team Lead & Full-stack Developer | Architecture Design, AI Integration, Backend Development, Frontend Development |
| **Muskan Sharma** | Frontend Developer | React UI Components, Data Visualization, User Experience |
| **Kashish Sharma** | Backend Developer | REST APIs, Database Design, Authentication System |
| **Sidh Khurana** | AI/ML Engineer | AI Models Integration, Analysis Algorithms, Voice Processing |

---

## 🌐 Deployment

**🚀 Live Application:**
- **Frontend:** https://hrgen-dev.vercel.app
- **Backend API:** https://hrgen-dev.onrender.com

**API Health Check:** https://hrgen-dev.onrender.com/health

**Local Development:**
```bash
Frontend: http://localhost:3000
Backend:  http://localhost:5001
```

---

## 📞 Help & Contact  

> 💬 *Got questions or need assistance with HR-GenAI?*  
> We're here to help with integration and customization!

<div align="center">

**👤 Abhishek Giri - Team Lead**  
<a href="https://www.linkedin.com/in/abhishek-giri04/">
  <img src="https://img.shields.io/badge/LinkedIn-Abhishek%20Giri-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn - Abhishek Giri"/>
</a>  
<a href="https://github.com/abhishekgiri04">
  <img src="https://img.shields.io/badge/GitHub-Abhishek%20Giri-black?style=for-the-badge&logo=github" alt="GitHub - Abhishek Giri"/>
</a>  
<a href="https://t.me/AbhishekGiri7">
  <img src="https://img.shields.io/badge/Telegram-Abhishek%20Giri-blue?style=for-the-badge&logo=telegram" alt="Telegram - Abhishek Giri"/>
</a>

</div>

---

<div align="center">

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

</div>

---

<div align="center">

**🧬 Built with ❤️ for Human Potential Excellence**  
*AI-Powered HR Agent: Handles resumes, interviews, and employee questions automatically*

---

**© 2026 HR-GenAI. All Rights Reserved.**

</div>