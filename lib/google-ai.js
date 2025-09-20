import OpenAI from 'openai';

const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

if (!API_KEY) {
  throw new Error('Missing OpenAI API key');
}

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const GENERATIVE_MODEL = process.env.OPENAI_GENERATIVE_MODEL || "gpt-3.5-turbo";

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 10000]; // 2s, 5s, 10s

let lastRequestTime = 0;

const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

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
      
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
      });
      return response.data[0].embedding;
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
    return "Hi there! I'm here to help you with your notes. What would you like to know?";
  }
  
  // Handle thanks/gratitude
  if (/(thank you|thanks|thx|appreciate|grateful)/i.test(queryLower)) {
    return "You're very welcome! Feel free to ask me anything else about your notes anytime.";
  }
  
  // Handle identity questions in fallback
  if (/(what's your name|who are you|tell me your name|what are you called|your name)/i.test(queryLower)) {
    return "I'm your personal notes assistant! I help you find and understand information from all your notes. What can I help you look up?";
  }
  
  // Handle capability questions in fallback
  if (/(what can you do|help|how can you help|what do you do|capabilities)/i.test(queryLower)) {
    return "I can help you search through and understand your notes! Just ask me about any topic you've written about. For example, you could ask 'What did I write about Python?' or 'Tell me about my machine learning notes.'";
  }
  
  // Only show note content for actual content queries
  if (notes.length === 0) {
    return "I don't see any notes about that topic yet. Maybe you'd like to create a note about it?";
  }
  
  // For content queries, be more conversational
  if (notes.length === 1) {
    const note = notes[0];
    return `I found something about that in your note "${note.title}". ${note.content.substring(0, 300)}${note.content.length > 300 ? '...' : ''}`;
  }
  
  const relevantContent = notes.slice(0, 3).map(note => 
    `From "${note.title}": ${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}`
  ).join('\n\n');
  
  return `I found a few things about that in your notes:\n\n${relevantContent}${notes.length > 3 ? `\n\n(And ${notes.length - 3} more related notes)` : ''}`;
}

// For chat completions with retry and fallback
export async function generateResponse(query, notes = []) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await waitForRateLimit();
      
      const notesContent = notes.map((note, index) => 
        `Note ${index + 1}: "${note.title}"\n${note.content}`
      ).join('\n\n');
      
      // Intelligent prompt that handles all query types naturally
      const prompt = `You are a helpful, conversational personal notes assistant. Think of yourself as a friendly companion who knows the user's notes inside and out and can have natural conversations about them.

IMPORTANT GUIDELINES:

1. UNDERSTAND THE CONTEXT:
   - For greetings (hi, hello, hey): Respond warmly and ask how you can help
   - For thanks/gratitude: Acknowledge graciously and offer continued help
   - For casual conversation: Respond naturally without forcing note references
   - For questions about capabilities: Explain what you can do with their notes
   - For content questions: Use the provided notes to give helpful, conversational answers

2. CONVERSATION STYLE:
   - Be natural and human-like in your responses
   - Don't use formal bullet points or structured formats unless truly needed
   - Speak as if you're a knowledgeable friend who has read all their notes
   - Use conversational phrases like "I see that you wrote about...", "From what I can find in your notes...", "You mentioned that..."

3. HANDLING NOTE CONTENT:
   - When answering from notes, integrate the information naturally into conversation
   - Don't say things like "Based on your notes, here's what I found" - just answer directly
   - If the information isn't in the notes, say so conversationally: "I don't see anything about that in your notes yet"
   - Never mention "simplified responses" or "AI service limitations"

4. BE CONTEXTUALLY AWARE:
   - If they ask about something and you find it in their notes, answer as if you remember it
   - Don't over-explain that you're looking through notes - just provide the answer
   - For personal topics, respond with appropriate warmth and understanding

User's question: "${query}"

${notes.length > 0 ? `Your notes contain:\n${notesContent}` : "The user doesn't have any notes yet."}

Respond in a natural, conversational way:`;
      
      const response = await openai.chat.completions.create({
        model: GENERATIVE_MODEL,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content;
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