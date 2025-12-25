const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { OpenAI } = require('openai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory storage for document embeddings (in production, use a vector database)
const documentStore = new Map();
const embeddingsCache = new Map();

// Extract text from different file types
async function extractTextFromFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  
  try {
    switch (ext) {
      case '.pdf':
        const pdfBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(pdfBuffer);
        return pdfData.text;
        
      case '.doc':
      case '.docx':
        const docBuffer = await fs.readFile(filePath);
        const docResult = await mammoth.extractRawText({ buffer: docBuffer });
        return docResult.value;
        
      case '.txt':
        return await fs.readFile(filePath, 'utf-8');
        
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw error;
  }
}

// Generate embeddings for text chunks
async function generateEmbeddings(text, chunkSize = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  
  const embeddings = [];
  for (const chunk of chunks) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk
      });
      
      embeddings.push({
        text: chunk,
        embedding: response.data[0].embedding
      });
    } catch (error) {
      console.error('Embedding generation failed:', error);
    }
  }
  
  return embeddings;
}

// Calculate cosine similarity
function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Find relevant documents using RAG
async function findRelevantContext(query, candidateId, topK = 3) {
  try {
    // Generate query embedding
    const queryResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query
    });
    const queryEmbedding = queryResponse.data[0].embedding;
    
    // Search through stored documents
    const results = [];
    for (const [docId, docData] of documentStore.entries()) {
      if (docData.candidateId === candidateId || docData.candidateId === 'global') {
        for (const chunk of docData.chunks) {
          const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
          results.push({
            docId,
            docName: docData.name,
            text: chunk.text,
            similarity,
            source: docData.name
          });
        }
      }
    }
    
    // Sort by similarity and return top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .filter(result => result.similarity > 0.7); // Threshold for relevance
      
  } catch (error) {
    console.error('RAG search failed:', error);
    return [];
  }
}

// Upload and process document
router.post('/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { candidateId = 'anonymous' } = req.body;
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    
    // Extract text from document
    const text = await extractTextFromFile(filePath, originalName);
    
    // Generate embeddings
    const chunks = await generateEmbeddings(text);
    
    // Store document data
    const docId = Date.now().toString();
    documentStore.set(docId, {
      id: docId,
      name: originalName,
      candidateId: candidateId,
      text: text,
      chunks: chunks,
      uploadedAt: new Date().toISOString()
    });
    
    // Clean up uploaded file
    await fs.unlink(filePath);
    
    res.json({
      documentId: docId,
      name: originalName,
      chunksProcessed: chunks.length,
      message: 'Document processed successfully'
    });
    
  } catch (error) {
    console.error('Document upload failed:', error);
    res.status(500).json({ error: 'Document processing failed' });
  }
});

// Analyze transcription with AI
router.post('/ai-copilot/analyze', async (req, res) => {
  try {
    const { 
      transcription, 
      question, 
      candidateProfile, 
      ragEnabled = false,
      context = []
    } = req.body;
    
    let contextInfo = '';
    let sources = [];
    
    // Use RAG if enabled
    if (ragEnabled && transcription) {
      const relevantDocs = await findRelevantContext(
        transcription + ' ' + (question?.text || ''), 
        candidateProfile?.id || 'anonymous'
      );
      
      if (relevantDocs.length > 0) {
        contextInfo = '\n\nRelevant context from uploaded documents:\n' + 
          relevantDocs.map(doc => `- ${doc.source}: ${doc.text.slice(0, 200)}...`).join('\n');
        
        sources = relevantDocs.map(doc => ({
          name: doc.docName,
          snippet: doc.text.slice(0, 200) + '...',
          similarity: doc.similarity
        }));
      }
    }
    
    // Prepare AI prompt
    const prompt = `
You are an AI interview assistant helping a candidate during their interview. Analyze the following:

QUESTION: ${question?.text || 'No specific question provided'}

CANDIDATE PROFILE:
- Name: ${candidateProfile?.name || 'Unknown'}
- Position: ${candidateProfile?.position || 'Unknown'}
- Experience: ${candidateProfile?.experience || 'Unknown'}
- Skills: ${candidateProfile?.skills?.join(', ') || 'Unknown'}

CANDIDATE'S RESPONSE (transcribed): ${transcription}

${contextInfo}

PREVIOUS CONTEXT: ${context.slice(-3).map(c => `${c.type}: ${c.content}`).join('\n')}

Provide helpful, constructive suggestions to improve the candidate's answer. Focus on:
1. Content completeness and accuracy
2. Structure and clarity
3. Relevant examples or details to add
4. Technical depth (if applicable)
5. Communication effectiveness

Be supportive and specific. Limit response to 150 words.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI interview coach. Provide constructive, specific feedback to help candidates improve their responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });
    
    const suggestions = response.choices[0].message.content;
    
    res.json({
      suggestions,
      sources,
      citations: sources.map((source, index) => ({
        id: index + 1,
        source: source.name,
        snippet: source.snippet,
        relevance: Math.round(source.similarity * 100)
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI analysis failed:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

// Handle AI queries
router.post('/ai-copilot/query', async (req, res) => {
  try {
    const { 
      query, 
      question, 
      candidateProfile, 
      transcription, 
      ragEnabled = false,
      context = []
    } = req.body;
    
    let contextInfo = '';
    let sources = [];
    
    // Use RAG if enabled
    if (ragEnabled) {
      const relevantDocs = await findRelevantContext(
        query, 
        candidateProfile?.id || 'anonymous'
      );
      
      if (relevantDocs.length > 0) {
        contextInfo = '\n\nRelevant information from documents:\n' + 
          relevantDocs.map(doc => `${doc.source}: ${doc.text}`).join('\n\n');
        
        sources = relevantDocs.map(doc => ({
          name: doc.docName,
          snippet: doc.text.slice(0, 300) + '...',
          similarity: doc.similarity
        }));
      }
    }
    
    // Prepare conversation context
    const conversationContext = context.slice(-5).map(msg => 
      `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
    
    const prompt = `
You are an AI interview assistant. The candidate is asking: "${query}"

CURRENT INTERVIEW CONTEXT:
- Question: ${question?.text || 'General interview discussion'}
- Candidate: ${candidateProfile?.name || 'Unknown'} applying for ${candidateProfile?.position || 'Unknown position'}
- Recent transcription: ${transcription?.slice(-200) || 'No recent speech'}

${contextInfo}

CONVERSATION HISTORY:
${conversationContext}

Provide a helpful, professional response. Be supportive but honest. If the query is about interview strategy, provide specific actionable advice. If it's technical, give accurate information. Keep responses concise (under 200 words).
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional AI interview assistant. Help candidates with interview questions, provide guidance, and offer constructive feedback.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 250,
      temperature: 0.7
    });
    
    const aiResponse = response.choices[0].message.content;
    
    res.json({
      response: aiResponse,
      sources,
      citations: sources.map((source, index) => ({
        id: index + 1,
        source: source.name,
        snippet: source.snippet,
        relevance: Math.round(source.similarity * 100)
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI query failed:', error);
    res.status(500).json({ error: 'AI query processing failed' });
  }
});

// Get uploaded documents for a candidate
router.get('/documents/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const documents = [];
    for (const [docId, docData] of documentStore.entries()) {
      if (docData.candidateId === candidateId || docData.candidateId === 'global') {
        documents.push({
          id: docData.id,
          name: docData.name,
          uploadedAt: docData.uploadedAt,
          chunksCount: docData.chunks.length
        });
      }
    }
    
    res.json({ documents });
    
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Delete document
router.delete('/documents/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    
    if (documentStore.has(docId)) {
      documentStore.delete(docId);
      res.json({ message: 'Document deleted successfully' });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
    
  } catch (error) {
    console.error('Failed to delete document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Health check for AI services
router.get('/ai-copilot/health', (req, res) => {
  res.json({
    status: 'OK',
    documentsStored: documentStore.size,
    ragEnabled: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;