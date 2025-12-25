const express = require('express');
const Groq = require('groq-sdk');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const router = express.Router();

// Initialize AI services only if API keys are available
let groq = null;
let openai = null;
let pinecone = null;
let pineconeIndex = null;

if (process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Initialize Pinecone
const initializePinecone = async () => {
  if (!pinecone && process.env.PINECONE_API_KEY) {
    try {
      pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
      
      const indexName = 'hr-interview-knowledge';
      pineconeIndex = pinecone.index(indexName);
    } catch (error) {
      console.error('Error initializing Pinecone:', error);
    }
  }
};

// Create embedding using OpenAI
const createEmbedding = async (text) => {
  if (!openai) return null;
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    return null;
  }
};

// Search for similar content in Pinecone
const searchSimilarContent = async (query, topK = 5) => {
  if (!pineconeIndex) return [];

  try {
    const embedding = await createEmbedding(query);
    if (!embedding) return [];

    const searchResponse = await pineconeIndex.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    return searchResponse.matches || [];
  } catch (error) {
    console.error('Error searching similar content:', error);
    return [];
  }
};

// Enhanced AI completion with RAG
router.post('/completion', async (req, res) => {
  try {
    const { prompt, bg, flag, candidateData } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!groq) {
      return res.status(503).json({ 
        error: 'AI service not configured. Please add GROQ_API_KEY to environment variables.' 
      });
    }

    await initializePinecone();
    
    // Search for relevant context using RAG
    const similarDocs = await searchSimilarContent(prompt);
    
    let enhancedPrompt = prompt;
    let citations = [];
    
    if (similarDocs.length > 0) {
      const relevantTexts = similarDocs
        .filter(doc => doc.score > 0.7)
        .map(doc => doc.metadata.text)
        .slice(0, 3);
      
      if (relevantTexts.length > 0) {
        enhancedPrompt += '\n\nRelevant Context:\n' + relevantTexts.join('\n\n');
        
        citations = similarDocs.map(doc => ({
          text: doc.metadata.text,
          score: doc.score,
          sourceType: doc.metadata.sourceType || 'knowledge_base',
          category: doc.metadata.category || 'general'
        }));
      }
    }

    // Determine the system prompt based on flag
    let systemPrompt = '';
    if (flag === 'COPILOT') {
      systemPrompt = `You are an expert AI interview assistant. Provide intelligent, actionable insights for interviewers. Focus on:
      1. Candidate assessment and evaluation
      2. Suggested follow-up questions
      3. Red flags or positive indicators
      4. Interview strategy recommendations
      
      Be concise, professional, and helpful.`;
    } else {
      systemPrompt = `You are an AI summarizer for interview content. Provide clear, structured summaries of interview conversations and candidate responses.`;
    }

    // Add candidate context if available
    if (candidateData) {
      enhancedPrompt += `\n\nCandidate Profile: ${JSON.stringify(candidateData)}`;
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
      const stream = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enhancedPrompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });

      // Stream the response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(content);
        }
      }

      // Send citations after the main response
      if (citations.length > 0) {
        res.write('\n---SOURCES---\n');
        res.write(JSON.stringify({
          type: 'citations',
          citations: citations,
          extractedQuestion: extractQuestionFromPrompt(prompt)
        }));
      }

      res.end();
      
    } catch (groqError) {
      console.error('Groq API error:', groqError);
      
      // Fallback response
      res.write('⚠️ AI service is temporarily unavailable. Please try again in a moment.');
      
      if (citations.length > 0) {
        res.write('\n---SOURCES---\n');
        res.write(JSON.stringify({
          type: 'citations',
          citations: citations,
          extractedQuestion: extractQuestionFromPrompt(prompt)
        }));
      }
      
      res.end();
    }

  } catch (error) {
    console.error('Error in completion endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Extract question from prompt for better context
const extractQuestionFromPrompt = (prompt) => {
  const sentences = prompt.split(/[.!?]+/);
  const questions = sentences.filter(sentence => 
    sentence.trim().includes('?') || 
    sentence.toLowerCase().includes('what') ||
    sentence.toLowerCase().includes('how') ||
    sentence.toLowerCase().includes('why') ||
    sentence.toLowerCase().includes('when') ||
    sentence.toLowerCase().includes('where')
  );
  
  return questions.length > 0 ? questions[0].trim() : '';
};

// Initialize knowledge base
router.post('/initialize-knowledge', async (req, res) => {
  try {
    await initializePinecone();
    
    if (!pineconeIndex) {
      return res.status(500).json({ error: 'Pinecone not initialized' });
    }

    const interviewKnowledge = [
      {
        text: "When asking technical questions, look for problem-solving approach, not just correct answers. Good candidates explain their thought process.",
        metadata: { category: "technical_interview", type: "best_practice", sourceType: "knowledge_base" }
      },
      {
        text: "Red flags in interviews: Inability to explain past work, blaming previous employers, lack of questions about the role.",
        metadata: { category: "red_flags", type: "warning_signs", sourceType: "knowledge_base" }
      },
      {
        text: "Good follow-up questions: 'Can you walk me through your approach?', 'What would you do differently?', 'How did you handle challenges?'",
        metadata: { category: "follow_up_questions", type: "suggestions", sourceType: "knowledge_base" }
      },
      {
        text: "For behavioral questions, use STAR method evaluation: Situation, Task, Action, Result. Look for specific examples.",
        metadata: { category: "behavioral_interview", type: "evaluation_method", sourceType: "knowledge_base" }
      },
      {
        text: "Signs of a strong candidate: Asks thoughtful questions, shows genuine interest, provides specific examples, demonstrates learning from failures.",
        metadata: { category: "positive_indicators", type: "assessment", sourceType: "knowledge_base" }
      }
    ];

    const vectors = [];
    for (let i = 0; i < interviewKnowledge.length; i++) {
      const knowledge = interviewKnowledge[i];
      const embedding = await createEmbedding(knowledge.text);
      
      if (embedding) {
        vectors.push({
          id: `knowledge_${i}_${Date.now()}`,
          values: embedding,
          metadata: {
            text: knowledge.text,
            timestamp: new Date().toISOString(),
            ...knowledge.metadata
          }
        });
      }
    }

    if (vectors.length > 0) {
      await pineconeIndex.upsert(vectors);
      res.json({ message: `Successfully initialized ${vectors.length} knowledge base entries` });
    } else {
      res.status(500).json({ error: 'Failed to create embeddings' });
    }

  } catch (error) {
    console.error('Error initializing knowledge base:', error);
    res.status(500).json({ error: 'Failed to initialize knowledge base' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    services: {
      groq: !!process.env.GROQ_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      pinecone: !!process.env.PINECONE_API_KEY
    }
  });
});

module.exports = router;