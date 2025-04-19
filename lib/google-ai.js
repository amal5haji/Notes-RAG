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
export async function generateResponse(query, notes = []) {
  try {
    const model = genAI.getGenerativeModel({ model: GENERATIVE_MODEL });
    
    const notesContent = notes.map((note, index) => 
      `Note ${index + 1}: "${note.title}"\n${note.content}`
    ).join('\n\n');
    
    const prompt = `
    You are a helpful AI assistant for a personal note-taking application. Your task is to answer the user's query based on their personal notes.
    
    ## Instructions:
    1. Base your answers primarily on the content of the provided notes.
    2. If the notes contain information that directly answers the query, use that information.
    3. If the notes contain partial information relevant to the query, use that information and clearly indicate where the information might be incomplete.
    4. If the notes don't contain any relevant information to answer the query, politely inform the user that you couldn't find related information in their notes.
    5. Always maintain a helpful and conversational tone.
    6. Never make up information that isn't in the notes.
    
    ## User's Notes:
    ${notes.length > 0 ? notesContent : "No relevant notes found."}
    
    ## User's Query:
    ${query}
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}