import dbConnect from '../../../lib/mongodb';
import Note from '../../../models/Note';
import { getEmbedding } from '../../../lib/google-ai';
import { storeEmbedding } from '../../../lib/milvus';
import { requireAuth } from '../../../lib/serverAuth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const userId = req.user._id;
    
    const note = new Note({ 
      userId, 
      title, 
      content 
    });
    
    await note.save();
    
    const embedding = await getEmbedding(content);
    await storeEmbedding(userId.toString(), note._id.toString(), embedding);
    
    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Error creating note', error: error.message });
  }
}

export default requireAuth(handler);