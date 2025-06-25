import dbConnect from '../../lib/mongodb';
import Note from '../../models/Note';
import { requireAuth } from '../../lib/auth';
import { getEmbedding, generateResponse } from '../../lib/google-ai';
import { searchSimilarNotes } from '../../lib/milvus';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const userId = req.user._id;
    const userIdStr = userId.toString();
    
    // Get embedding for the query
    const queryEmbedding = await getEmbedding(query);
    
    let similarNotes = [];
    let fallbackToTextSearch = false;
    
    try {
      // Try vector search first
      similarNotes = await searchSimilarNotes(userIdStr, queryEmbedding);
    } catch (error) {
      console.warn('Vector search failed, falling back to text search:', error.message);
      fallbackToTextSearch = true;
      
      // Fallback to text-based search if Milvus is unavailable
      const notes = await Note.find({ 
        userId,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      }).limit(5);
      
      similarNotes = notes.map(note => ({
        noteId: note._id.toString(),
        score: 0.5 // Default similarity score for text search
      }));
    }
    
    if (!similarNotes || similarNotes.length === 0) {
      return res.status(200).json({ 
        response: "I don't have any notes related to your query. Try adding some notes first!",
        sources: [],
        searchMethod: fallbackToTextSearch ? 'text' : 'vector'
      });
    }
    
    // Convert note IDs from strings to MongoDB ObjectIds for proper querying
    const noteIds = similarNotes.map(note => note.noteId);
    console.log(`Found similar notes with IDs (${fallbackToTextSearch ? 'text search' : 'vector search'}): ${noteIds.join(', ')}`);
    
    // Find notes in MongoDB using the IDs from search
    const notes = await Note.find({ 
      _id: { $in: noteIds },
      userId 
    });
    
    console.log(`Retrieved ${notes.length} notes from database out of ${noteIds.length} search matches`);
    
    if (notes.length === 0) {
      return res.status(200).json({
        response: fallbackToTextSearch 
          ? "I found some potential matches, but couldn't retrieve them from the database." 
          : "I found some potential matches in the vector store, but couldn't retrieve them from the database. There might be a mismatch between your notes and their vector embeddings.",
        sources: [],
        searchMethod: fallbackToTextSearch ? 'text' : 'vector'
      });
    }
    
    const response = await generateResponse(query, notes);
    
    const sources = notes.map(note => ({
      id: note._id.toString(),
      title: note.title,
      preview: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')
    }));
    
    res.status(200).json({ 
      response,
      sources,
      searchMethod: fallbackToTextSearch ? 'text' : 'vector'
    });
  } catch (error) {
    console.error('Chat error:', error);
    
    // Handle rate limiting specifically
    if (error.status === 429 || error.message.includes('quota') || error.message.includes('rate limit')) {
      return res.status(200).json({ 
        response: "I'm currently experiencing high demand and need to slow down my responses. Please try again in a few moments. Your notes are still searchable!",
        sources: [],
        error: 'rate_limited',
        retryAfter: 30 // seconds
      });
    }
    
    // Handle other AI service errors
    if (error.message.includes('GoogleGenerativeAI') || error.message.includes('generativelanguage')) {
      return res.status(200).json({
        response: "I'm having trouble with the AI service right now, but I can still help you find your notes using basic search. Try rephrasing your question or check back later.",
        sources: [],
        error: 'ai_service_unavailable'
      });
    }
    
    res.status(500).json({ message: 'Error processing chat request', error: error.message });
  }
}

export default requireAuth(handler);