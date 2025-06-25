import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
  throw new Error('Missing Google AI API key');
}

const EMBEDDING_MODEL = process.env.GOOGLE_EMBEDDING_MODEL || "text-embedding-004";
const GENERATIVE_MODEL = process.env.GOOGLE_GENERATIVE_MODEL || "gemini-1.5-flash";

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 10000]; // 2s, 5s, 10s

let lastRequestTime = 0;

const genAI = new GoogleGenerativeAI(API_KEY);

// Rate limiting helper
async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

// For text embedding with retry logic
export async function getEmbedding(text) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await waitForRateLimit();
      
      const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error(`Embedding attempt ${attempt + 1} failed:`, error.message);
      
      if (error.status === 429 && attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAYS[attempt];
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
}

// Simple fallback response generator
function generateFallbackResponse(query, notes = []) {
  const queryLower = query.toLowerCase().trim();
  
  // Handle greetings in fallback
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings|salutations)(!|\?|\.)?$/i.test(queryLower)) {
    return "Hi there! I'm your personal notes assistant. I'm here to help you find information from your notes. What would you like to know?";
  }
  
  // Handle identity questions in fallback
  if (/(what's your name|who are you|tell me your name|what are you called|your name)/i.test(queryLower)) {
    return "I'm your personal notes assistant! I don't have a specific name, but you can think of me as your helpful companion for organizing and finding information in your notes. What can I help you find today?";
  }
  
  // Handle capability questions in fallback
  if (/(what can you do|help|how can you help|what do you do|capabilities)/i.test(queryLower)) {
    return "I'm great at helping you search through and understand your personal notes! Just ask me questions about any topic you've written about, and I'll find the relevant information for you. For example, you could ask 'What did I write about Python?' or 'Show me my notes on machine learning.'";
  }
  
  // Only show note content for actual content queries
  if (notes.length === 0) {
    return "I don't have any relevant notes to answer your query. Try adding some notes first!";
  }
  
  const noteTitles = notes.map(note => `• ${note.title}`).join('\n');
  const noteContents = notes.map(note => note.content.substring(0, 200)).join('\n\n');
  
  return `Based on your notes, here's what I found related to "${query}":\n\n` +
         `Relevant notes:\n${noteTitles}\n\n` +
         `Content preview:\n${noteContents}${noteContents.length > 200 ? '...' : ''}\n\n` +
         `(This is a simplified response due to AI service limitations. Your full notes are available above.)`;
}

// For chat completions with retry and fallback
export async function generateResponse(query, notes = []) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await waitForRateLimit();
      
      const model = genAI.getGenerativeModel({ model: GENERATIVE_MODEL });
      
      const notesContent = notes.map((note, index) => 
        `Note ${index + 1}: "${note.title}"\n${note.content}`
      ).join('\n\n');
      
      // Intelligent prompt that handles all query types naturally
      const prompt = `You are a friendly and intelligent personal notes assistant. You help users find and understand information from their personal notes collection.

CRITICAL INSTRUCTIONS - READ CAREFULLY:

1. ANALYZE THE USER'S QUERY FIRST:
   - If they're just greeting you (hi, hello, hey, etc.) → Give a warm greeting and ask how you can help with their notes
   - If they're asking about your identity/name → Explain you're their notes assistant 
   - If they're asking what you can do → Explain your note-searching capabilities
   - If they're asking about note content → Use the provided notes to answer

2. FOR GREETINGS AND CASUAL QUERIES:
   - Do NOT reference any note content
   - Keep responses brief and friendly
   - Always redirect to offering help with their notes

3. FOR NOTE-RELATED QUESTIONS ONLY:
   - Use the relevant notes provided below
   - Give comprehensive, helpful answers based on the notes
   - If no relevant notes exist, suggest creating notes about the topic

User asked: "${query}"

${notes.length > 0 ? `Available notes for reference (ONLY use if the query is asking about note content):\n${notesContent}` : "No notes are currently available to reference."}

Respond naturally and appropriately to their query:`
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error(`Response generation attempt ${attempt + 1} failed:`, error.message);
      
      if (error.status === 429) {
        if (attempt < MAX_RETRIES - 1) {
          const delay = RETRY_DELAYS[attempt];
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          // Final fallback for rate limiting
          console.log('All retries exhausted, using fallback response');
          return generateFallbackResponse(query, notes);
        }
      }
      
      // For other errors, try fallback on last attempt
      if (attempt === MAX_RETRIES - 1) {
        console.log('Using fallback response due to AI service error');
        return generateFallbackResponse(query, notes);
      }
    }
  }
  
  // Should not reach here, but just in case
  return generateFallbackResponse(query, notes);
}