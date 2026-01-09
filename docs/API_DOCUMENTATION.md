# 📡 HR-GenAI API Documentation

<div align="center">

## 🎯 Core Endpoints

Complete API reference for HR-GenAI platform integration

</div>

---

## 1️⃣ Resume Analysis

**Endpoint**: `POST /api/candidates/analyze-resume`

**Description**: Analyzes uploaded resume using GPT-4 and extracts candidate information.

**Request**:
```bash
curl -X POST http://localhost:5001/api/candidates/analyze-resume \
  -H "Content-Type: multipart/form-data" \
  -F "resume=@candidate_resume.pdf"
```

**Response** (200 OK):
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

## 2️⃣ Start AI Interview

**Endpoint**: `POST /api/interviews/start`

**Description**: Initiates AI interview session with Huma.

**Request**:
```bash
curl -X POST http://localhost:5001/api/interviews/start \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "candidate_id_here",
    "templateId": "template_id_here"
  }'
```

**Response**:
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

## 3️⃣ Get Candidate Analytics

**Endpoint**: `GET /api/analytics/candidate/{candidateId}`

**Request**:
```bash
curl -X GET http://localhost:5001/api/analytics/candidate/candidate_id_here
```

**Response**:
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

## 4️⃣ Send Bulk Invitations

**Endpoint**: `POST /api/invitations/bulk-invite`

**Request**:
```bash
curl -X POST http://localhost:5001/api/invitations/bulk-invite \
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

---

## 🔧 Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```bash
-H "Authorization: Bearer your_jwt_token_here"
```

---

## 🌐 Base URLs

- **Development**: `http://localhost:5001`
- **Production**: `https://hrgen-dev.onrender.com`

---

## 📊 Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

<div align="center">

**For more details, visit the main [README.md](../README.md)**

</div>