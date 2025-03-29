import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
  throw new Error('Missing Google AI API key');
}

const EMBEDDING_MODEL = process.env.GOOGLE_EMBEDDING_MODEL || "embedding-001";
const GENERATIVE_MODEL = process.env.GOOGLE_GENERATIVE_MODEL || "gemini-1.5-pro";

const genAI = new GoogleGenerativeAI(API_KEY);

// For text embedding
export async function getEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// For chat completions
export async function generateResponse(query, context = []) {
  try {
    const model = genAI.getGenerativeModel({ model: GENERATIVE_MODEL });
    
    const prompt = `
    You are a helpful assistant that answers questions based on the user's personal notes.
    
    The following are relevant notes from the user's collection:
    ${context.map(note => `---\n${note.content}\n---`).join('\n')}
    
    Answer the question based on these notes. If the notes don't contain relevant information, politely say so.
    
    User's question: ${query}
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}