const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class InterviewAIEngine {
  
  // 1. Interview Configuration
  async configureInterview(config) {
    const prompt = `You are an AI Interview Configuration Engine.

Create an interview structure using the following inputs:
- Interview Type: ${config.type}
- Duration: ${config.duration} minutes
- Difficulty Level: ${config.difficulty}
- Question Categories: ${config.categories.join(', ')}
- Estimated Questions: ${config.questionCount}
- Passing Score: ${config.passingScore}%
- Tech Stack: ${config.techStack.join(', ')}

Rules:
1. Each round must define: Round Name, Role Focus, Tech Stack Focus, Number of Questions, Evaluation Criteria
2. Support random question generation per candidate
3. Output interview structure in JSON format

Return only the JSON structure.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // 2. Resume Parsing & Candidate Profiling
  async parseResume(resumeText) {
    const prompt = `You are a Resume Intelligence Extractor.

From the given resume text:
1. Extract: Candidate Name, Education, Experience Level, Primary Tech Stack, Secondary Skills, Project Domains, Strength Indicators
2. Infer: Suitable Role Level (Intern/Junior/SDE/Senior), Interview Difficulty Recommendation
3. Return structured candidate profile in JSON format

Resume Text:
${resumeText}

Be precise. Do not hallucinate skills. Return only JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // 3. Interview Template Matching
  async matchTemplates(candidateProfile, availableTemplates) {
    const prompt = `You are an Interview Matching Engine.

Candidate Profile: ${JSON.stringify(candidateProfile)}
Available Templates: ${JSON.stringify(availableTemplates)}

Task:
1. Match candidate to most suitable templates
2. Rank templates by relevance
3. Explain why each template fits
4. Return top matching templates with confidence scores

Return JSON with matched templates and scores.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // 4. Round-Wise Question Generation (Anti-Cheating)
  async generateQuestions(candidateId, techStack, roundConfig, difficulty) {
    const prompt = `You are a Secure Interview Question Generator.

Inputs:
- Candidate ID: ${candidateId} (for uniqueness)
- Tech Stack: ${techStack.join(', ')}
- Round: ${roundConfig.name}
- Difficulty: ${difficulty}
- Question Count: ${roundConfig.questionCount}

Rules:
1. Generate UNIQUE questions for this specific candidate
2. Avoid commonly searchable questions
3. Mix: Conceptual, Practical, Scenario-based
4. Align with candidate's tech stack
5. Ensure questions cannot be copy-pasted from internet

Return JSON array of questions with expected answers and scoring criteria.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // 5. Real-Time Interviewer Response
  async getInterviewerResponse(context, candidateAnswer, questionData) {
    const prompt = `You are a professional human interviewer.

Context: ${JSON.stringify(context)}
Current Question: ${questionData.question}
Candidate Answer: ${candidateAnswer}

Behavior rules:
- Speak naturally and professionally
- Ask follow-up if answer is weak
- Encourage if candidate seems nervous
- Maintain real HR tone (not robotic)
- Adjust difficulty dynamically

Respond as interviewer would. Keep it conversational and human-like.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    });

    return response.choices[0].message.content;
  }

  // 6. Answer Evaluation & Scoring
  async evaluateAnswer(question, candidateAnswer, expectedAnswer, voiceMetrics = {}) {
    const prompt = `You are an Interview Evaluation Engine.

Question: ${question}
Expected Answer: ${expectedAnswer}
Candidate Answer: ${candidateAnswer}
Voice Metrics: ${JSON.stringify(voiceMetrics)}

Evaluate based on:
1. Technical Correctness (0–10)
2. Depth of Understanding (0–10)
3. Communication Clarity (0–10)
4. Confidence Level (0–10)
5. Voice Modulation & Fluency (0–10)

Rules:
- Penalize guessing
- Reward structured thinking
- Be unbiased

Return JSON with scores per category and brief evaluator notes.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // 7. Genome Profile Generation
  async generateGenomeProfile(interviewData, candidateProfile) {
    const prompt = `You are a Candidate Genome Profiler.

Interview Performance: ${JSON.stringify(interviewData)}
Candidate Profile: ${JSON.stringify(candidateProfile)}

Generate skill genome including:
1. Technical Strengths, Weak Areas, Communication Index, Confidence Index, Learning Potential
2. Classify as: Hire/Strong Hire/Hold/Reject
3. Provide improvement suggestions

Output must be visual-dashboard friendly JSON format.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // 8. HR Dashboard Summary
  async generateHRSummary(candidateData, interviewResults) {
    const prompt = `You are an HR Decision Assistant.

Candidate Data: ${JSON.stringify(candidateData)}
Interview Results: ${JSON.stringify(interviewResults)}

Generate concise HR report including:
- Candidate Overview
- Round-wise Scores
- Final Percentage
- Pass/Fail Status
- Hiring Recommendation
- Risk Flags (if any)

Keep it professional, data-driven, and unbiased. Return JSON format.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // 9. Randomization & Fairness Control
  async ensureFairness(candidateId, questionSet, allPreviousQuestions) {
    const prompt = `You are a Fairness & Randomization Controller.

Candidate ID: ${candidateId}
Proposed Questions: ${JSON.stringify(questionSet)}
Previous Questions Used: ${JSON.stringify(allPreviousQuestions)}

Ensure:
1. No identical question sets between candidates
2. Difficulty distribution remains consistent
3. Randomization doesn't reduce relevance

Return JSON with integrity status and any adjustments needed.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    return JSON.parse(response.choices[0].message.content);
  }
}

module.exports = InterviewAIEngine;