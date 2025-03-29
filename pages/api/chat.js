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
    
    // Get embedding for the query
    const queryEmbedding = await getEmbedding(query);
    
    // Search for similar notes
    const similarNotes = await searchSimilarNotes(userId.toString(), queryEmbedding);
    
    if (!similarNotes || similarNotes.length === 0) {
      return res.status(200).json({ 
        response: "I don't have any notes related to your query. Try adding some notes first!"
      });
    }
    
    // Fetch the actual note content from MongoDB
    const noteIds = similarNotes.map(note => note.noteId);
    const notes = await Note.find({ 
      _id: { $in: noteIds },
      userId 
    });
    
    // Generate response using Google AI
    const response = await generateResponse(query, notes);
    
    res.status(200).json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error processing chat request', error: error.message });
  }
}

export default requireAuth(handler);