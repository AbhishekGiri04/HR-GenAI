<div align="center">

# 🚀 HR-GenAI API Documentation

[![API Version](https://img.shields.io/badge/API-v1.0-blue.svg)]()
[![Status](https://img.shields.io/badge/Status-Active-green.svg)]()
[![AI Powered](https://img.shields.io/badge/AI-GPT--4-orange.svg)]()

**Next-Generation AI-Powered HR Platform**

*Complete API reference for seamless platform integration*

</div>

---

## 🎯 Quick Start

```bash
# Base URLs
Development: http://localhost:5001
Production:  https://hrgen-dev.onrender.com

# Authentication
Authorization: Bearer your_jwt_token_here
```

---

## 📋 Core Endpoints

### 🔍 Resume Analysis
**`POST /api/candidates/analyze-resume`**

AI-powered resume parsing with GPT-4 intelligence

**Request:**
```bash
curl -X POST https://hrgen-dev.onrender.com/api/candidates/analyze-resume \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: multipart/form-data" \
  -F "resume=@candidate_resume.pdf"
```

**Response (200 OK):**
```json
{
  "success": true,
  "candidate": {
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "+1234567890",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": "3 years",
    "education": "Bachelor's in Computer Science",
    "extractionAccuracy": 95,
    "aiAnalysis": {
      "strengths": ["Strong technical skills", "Good communication"],
      "concerns": ["Limited leadership experience"],
      "culturalFit": 85
    }
  }
}
```

---

### 🧠 Start AI Interview
**`POST /api/interviews/start`**

Initiate intelligent interview session with Huma AI

**Request:**
```bash
curl -X POST https://hrgen-dev.onrender.com/api/interviews/start \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "candidate_id_here",
    "templateId": "template_id_here"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "interviewId": "interview_session_id",
  "humaGreeting": "Hello! I'm Huma, your AI interviewer. Ready to begin?",
  "firstQuestion": "Tell me about yourself and your background.",
  "sessionToken": "jwt_token_here"
}
```

---

### 📊 Candidate Analytics
**`GET /api/analytics/candidate/{candidateId}`**

Deep personality and performance insights with Digital DNA

**Request:**
```bash
curl -X GET https://hrgen-dev.onrender.com/api/analytics/candidate/candidate_id_here \
  -H "Authorization: Bearer ${API_KEY}"
```

**Response (200 OK):**
```json
{
  "candidateProfile": {
    "digitalDNA": {
      "personality": {
        "mbti": "ENFP",
        "traits": {
          "openness": 85,
          "conscientiousness": 78,
          "extraversion": 92,
          "agreeableness": 80,
          "neuroticism": 25
        }
      },
      "eqAnalysis": {
        "overallEQ": 8.5,
        "selfAwareness": 9,
        "empathy": 8,
        "stressManagement": 7
      }
    },
    "performancePrediction": {
      "jobFitScore": 88,
      "retentionProbability": 91.5,
      "culturalFitScore": 85
    }
  }
}
```

---

### 📧 Bulk Invitations
**`POST /api/invitations/bulk-invite`**

Send personalized interview invitations to multiple candidates

**Request:**
```bash
curl -X POST https://hrgen-dev.onrender.com/api/invitations/bulk-invite \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "candidates": [
      {"name": "John Doe", "email": "john@email.com"},
      {"name": "Jane Smith", "email": "jane@email.com"}
    ],
    "templateId": "template_id_here",
    "customMessage": "We are excited to interview you!"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "invitationsSent": 2,
  "details": [
    {"email": "john@email.com", "status": "sent"},
    {"email": "jane@email.com", "status": "sent"}
  ]
}
```

---

## 🔐 Authentication

All API endpoints require JWT authentication:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚡ HTTP Status Codes

| Code | Status | Description |
|:----:|:-------|:------------|
| `200` | ✅ **Success** | Request completed successfully |
| `400` | ❌ **Bad Request** | Invalid request parameters |
| `401` | 🔒 **Unauthorized** | Authentication required or invalid token |
| `404` | 🔍 **Not Found** | Resource does not exist |
| `429` | ⏱️ **Rate Limited** | Too many requests, slow down |
| `500` | 🔥 **Server Error** | Internal server error, contact support |

---

## 🎨 Key Features

- 🧠 **GPT-4 Integration** - Advanced AI-powered analysis
- 🎯 **Real-time Processing** - Instant candidate evaluation
- 📈 **Predictive Analytics** - 91.5% accurate retention forecasting
- 🔄 **Adaptive Interviews** - Dynamic question generation
- 🧬 **Digital DNA Profiling** - Comprehensive personality mapping
- 📊 **Performance Metrics** - Data-driven hiring decisions

---

## 🌍 Environments

| Environment | Base URL | Purpose |
|:------------|:---------|:--------|
| 🧪 **Development** | `http://localhost:5001` | Local testing |
| 🚀 **Production (Backend)** | `https://hrgen-dev.onrender.com` | Live API server |
| 🌐 **Production (Frontend)** | `https://hrgen-dev.vercel.app` | Live web platform |

---

<div align="center">

**🚀 Built with ❤️ for the future of HR**

*Transforming Recruitment Through AI-Powered Intelligence*

**© 2025 HR-GenAI | All Rights Reserved**

</div>
