const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Question Bank by Role
const QUESTION_BANK = {
  'Frontend Developer': {
    technical: [
      'What are semantic tags in HTML and why are they important?',
      'What is the difference between Flexbox and Grid in CSS?',
      'How do you implement responsive design?',
      'What is the difference between var, let, and const in JavaScript?',
      'What is event bubbling and event capturing?',
      'What is the difference between state and props in React?',
      'What is the use case of useEffect hook in React?',
      'What is Virtual DOM?',
      'What is a Single Page Application (SPA)?',
      'Name 3 ways to improve website performance.'
    ],
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React.js', 'Bootstrap', 'Material UI', 'Responsive Design', 'SPA']
  },
  'Backend Developer': {
    technical: [
      'What is the main role of a backend developer?',
      'What is REST API? Explain common HTTP methods.',
      'Explain the flow of MVC architecture.',
      'What is the difference between list and tuple in Python?',
      'How does routing work in Flask?',
      'What is exception handling in Java?',
      'What is the difference between JVM, JDK, and JRE in Java?',
      'How does Node.js work asynchronously?',
      'What is middleware?',
      'What security measures would you take for an API?'
    ],
    skills: ['Python', 'Java', 'Node.js', 'Flask', 'Spring', 'Express.js', 'REST APIs', 'MVC Architecture']
  },
  'Full Stack Developer': {
    technical: [
      'Explain the end-to-end workflow of a full stack developer.',
      'How does data flow between frontend and backend?',
      'What is async/await in JavaScript?',
      'What are decorators in Python?',
      'What is JOIN in SQL? Explain types.',
      'What is the difference between MongoDB and MySQL?',
      'What is the difference between Authentication and Authorization?',
      'What is the role of status codes in REST API?',
      'What is branching strategy in Git?',
      'Explain the basic process of production deployment.'
    ],
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Flask', 'REST APIs', 'MySQL', 'MongoDB', 'Git']
  },
  'Software Developer': {
    technical: [
      'What is the major difference between C and C++?',
      'Explain the 4 pillars of OOP.',
      'What is the difference between interface and abstract class in Java?',
      'How does memory management work in C?',
      'What is a pointer?',
      'What is the difference between Stack and Heap memory?',
      'What is time complexity?',
      'What is recursion?',
      'What is the difference between compile time and runtime error?',
      'Give a real-life example where OOP is used.'
    ],
    skills: ['C', 'C++', 'Java', 'DSA', 'OOP', 'Algorithms', 'OS', 'DBMS']
  },
  'Data Structures & Algorithms': {
    technical: [
      'What is the difference between Array and Linked List?',
      'Give a real-life example of Stack.',
      'What are the types of Queue?',
      'What is the difference between Binary Tree and BST?',
      'What is the difference between DFS and BFS?',
      'What is the difference between Bubble sort and Quick sort?',
      'How do you calculate time complexity?',
      'What is hashing?',
      'What is the difference between Recursion and Iteration?',
      'Explain a real problem where you used DSA.'
    ],
    skills: ['C++', 'Java', 'Python', 'Arrays', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph', 'Sorting']
  },
  'Machine Learning': {
    technical: [
      'What is Machine Learning?',
      'What is the difference between Supervised and Unsupervised learning?',
      'What is the difference between Regression and Classification?',
      'What is overfitting?',
      'Why do we do train-test split?',
      'What are Accuracy, Precision, and Recall?',
      'What is the difference between TensorFlow and PyTorch?',
      'What is NLP?',
      'Give a real use case of Computer Vision.',
      'How do you deploy an ML model?'
    ],
    skills: ['Python', 'SQL', 'ML', 'AI', 'Deep Learning', 'NLP', 'CV', 'TensorFlow', 'PyTorch']
  },
  'Database Developer': {
    technical: [
      'What is the difference between SQL and NoSQL?',
      'What is Primary key and Foreign key?',
      'What is normalization?',
      'What is indexing?',
      'Explain ACID properties.',
      'What is a stored procedure?',
      'What is deadlock?',
      'How do you optimize a database?',
      'What is a transaction?',
      'Explain the role of database in a real project.'
    ],
    skills: ['SQL', 'Python', 'Java', 'MySQL', 'MongoDB', 'PostgreSQL', 'Database Design']
  }
};

// Behavioral Questions (Common for all roles)
const BEHAVIORAL_QUESTIONS = {
  leadership: [
    'Describe a situation where you led a team.',
    'How would you handle a team member with weak performance?',
    'Have you ever made a decision that the team did not like? What was the result?',
    'What is the difference between a leader and a manager?',
    'Give an example of decision making under pressure.',
    'How do you ensure that the team stays motivated?',
    'What should be the role of a leader during conflict?',
    'Have you ever mentored a junior?',
    'How do you handle the team after a failure?',
    'How would you describe your leadership style?'
  ],
  cultural_fit: [
    'What does company culture mean to you?',
    'How do you feel about working in a fast-paced environment?',
    'What would you do if you found the company process inefficient?',
    'Have you ever worked outside your comfort zone?',
    'What are work ethics to you?',
    'How would you adjust if the team culture does not match yours?',
    'How do you handle feedback?',
    'How do you view diversity and inclusion?',
    'How do company values influence your decisions?',
    'What is your expectation from the team and manager?'
  ],
  problem_solving: [
    'Give an example of a complex problem you solved.',
    'What approach do you follow when the solution is not immediately clear?',
    'How do you break down a problem?',
    'Have you ever given a wrong solution? What did you learn?',
    'How do you use logical thinking?',
    'How do you choose the best solution from multiple options?',
    'What would you do if you had to make a decision without data?',
    'What is your strategy during debugging?',
    'Give an example of problem solving under pressure.',
    'How do you improve your problem solving skills?'
  ],
  communication: [
    'How would you explain a technical concept to a non-technical person?',
    'Have you ever had a misunderstanding? How did you resolve it?',
    'How do you present your point in team meetings?',
    'What is your reaction if your idea gets rejected?',
    'What is the difference between email and verbal communication?',
    'How do you manage communication with a remote team?',
    'What is active listening?',
    'What is the right way to give feedback?',
    'Do you have experience communicating with clients?',
    'How does effective communication improve your work?'
  ],
  teamwork: [
    'Do you prefer working in a team or solo? Why?',
    'Give an example of team conflict and how you solved it.',
    'What would you do if a team member does not cooperate?',
    'How do you define your role in the team?',
    'Have you worked with a cross-functional team?',
    'What do you think about credit sharing?',
    'How do you measure your contribution to team success?',
    'Have you ever covered someone else\'s work?',
    'What is your approach when you disagree with a team decision?',
    'How do you improve team productivity?'
  ],
  time_management: [
    'How do you manage multiple deadlines?',
    'How do you decide priorities?',
    'Have you ever had a last-minute requirement? What did you do?',
    'Give an example of adapting to change.',
    'How do you handle work in stressful situations?',
    'What is work-life balance to you?',
    'What is your strategy when the workload is high?',
    'What is your approach to learning new technology?',
    'How do you bounce back after failure?',
    'How would you adapt if your role changes slightly?'
  ]
};

// Shuffle array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate Interview Template based on Job Role
 */
async function generateInterviewTemplate(jobRole) {
  let roleData = QUESTION_BANK[jobRole];
  
  if (!roleData) {
    const roleKey = Object.keys(QUESTION_BANK).find(key => 
      jobRole.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(jobRole.toLowerCase())
    );
    roleData = roleKey ? QUESTION_BANK[roleKey] : null;
  }
  
  if (!roleData) {
    roleData = QUESTION_BANK['Software Developer'];
  }

  // Select 5 random technical questions (voice)
  const technicalQuestions = shuffle(roleData.technical).slice(0, 5);
  
  // Select 3 random behavioral questions (text)
  const allBehavioral = Object.values(BEHAVIORAL_QUESTIONS).flat();
  const behavioralQuestions = shuffle(allBehavioral).slice(0, 3);

  const questions = [
    ...technicalQuestions.map((q, i) => ({
      id: i + 1,
      question: q,
      category: 'Technical Skills',
      type: 'voice',
      points: 15,
      difficulty: 'medium'
    })),
    ...behavioralQuestions.map((q, i) => ({
      id: technicalQuestions.length + i + 1,
      question: q,
      category: 'Behavioral',
      type: 'text',
      points: 10,
      difficulty: 'medium'
    }))
  ];

  return {
    name: `AI Interview - ${jobRole}`,
    difficulty: 'medium',
    duration: 30,
    categories: ['Technical Skills', 'Behavioral'],
    passingScore: 70,
    techStack: roleData.skills,
    questions: shuffle(questions),
    totalQuestions: questions.length
  };
}

/**
 * Generate personalized offer or rejection message
 */
async function generateSmartMessage(type, candidate) {
  const { name, skills = [], interviewScore = 0, jobRole = 'Software Developer' } = candidate;
  
  const skillsList = Array.isArray(skills) ? skills.join(', ') : skills;
  
  const prompts = {
    offer: `Write a warm, professional congratulatory offer letter email for ${name} who applied for ${jobRole} position. 
    
Candidate Details:
- Name: ${name}
- Skills: ${skillsList}
- Interview Score: ${interviewScore}%

Requirements:
- Start with congratulations
- Mention their impressive skills
- Highlight their strong interview performance
- Welcome them to the team
- Mention next steps
- Max 150 words

Format: Email body only (no subject line)`,

    rejection: `Write a polite, encouraging rejection email for ${name} who applied for ${jobRole} position.

Requirements:
- Thank them for their time
- Appreciate their effort
- Encourage them to apply again
- Wish them success
- Max 100 words

Format: Email body only (no subject line)`
  };

  try {
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompts[type] }],
        temperature: 0.7,
        max_tokens: 300
      });
      return response.choices[0].message.content.trim();
    }
    
    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompts[type]);
      return result.response.text().trim();
    }

    return type === 'offer' 
      ? `Dear ${name},\n\nCongratulations! We're thrilled to offer you the ${jobRole} position. Your impressive skills and outstanding interview performance (${interviewScore}%) made you stand out.\n\nWelcome to the team! Our HR will contact you soon.\n\nBest regards,\nHR Team`
      : `Dear ${name},\n\nThank you for your interest in the ${jobRole} position. After careful consideration, we've decided to move forward with other candidates.\n\nWe appreciate your effort and encourage you to apply for future opportunities.\n\nBest wishes,\nHR Team`;

  } catch (error) {
    console.error('Error generating smart message:', error);
    return type === 'offer'
      ? `Dear ${name},\n\nCongratulations on your offer for ${jobRole}!`
      : `Dear ${name},\n\nThank you for your application.`;
  }
}

module.exports = {
  generateInterviewTemplate,
  generateSmartMessage
};
