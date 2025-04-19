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
    
    // Search for similar notes with consistent ID format
    const similarNotes = await searchSimilarNotes(userIdStr, queryEmbedding);
    
    if (!similarNotes || similarNotes.length === 0) {
      return res.status(200).json({ 
        response: "I don't have any notes related to your query. Try adding some notes first!",
        sources: []
      });
    }
    
    // Convert note IDs from strings to MongoDB ObjectIds for proper querying
    const noteIds = similarNotes.map(note => note.noteId);
    console.log(`Found similar notes with IDs: ${noteIds.join(', ')}`);
    
    // Find notes in MongoDB using the IDs from vector search
    const notes = await Note.find({ 
      _id: { $in: noteIds },
      userId 
    });
    
    console.log(`Retrieved ${notes.length} notes from database out of ${noteIds.length} vector matches`);
    
    if (notes.length === 0) {
      return res.status(200).json({
        response: "I found some potential matches in the vector store, but couldn't retrieve them from the database. There might be a mismatch between your notes and their vector embeddings.",
        sources: []
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
      sources
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error processing chat request', error: error.message });
  }
}

export default requireAuth(handler);