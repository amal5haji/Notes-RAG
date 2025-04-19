import dbConnect from '../../../lib/mongodb';
import Note from '../../../models/Note';
import { requireAuth } from '../../../lib/auth';
import { getEmbedding } from '../../../lib/google-ai';
import { storeEmbedding, deleteEmbedding } from '../../../lib/milvus';

async function handler(req, res) {
  const { id } = req.query;
  
  try {
    await dbConnect();
    
    if (req.method === 'GET') {
      const note = await Note.findOne({ _id: id, userId: req.user._id });
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      return res.status(200).json({ note });
    }
    
    if (req.method === 'PUT') {
      const { title, content } = req.body;
      
      if (!title && !content) {
        return res.status(400).json({ message: 'Title or content is required' });
      }
      
      const note = await Note.findOne({ _id: id, userId: req.user._id });
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      const contentChanged = content && content !== note.content;
      
      if (title) note.title = title;
      if (content) note.content = content;
      note.updatedAt = Date.now();
      
      await note.save();
      
      if (contentChanged) {
        const embedding = await getEmbedding(note.content);
        // Ensure consistent ID formatting
        const userIdStr = req.user._id.toString();
        const noteIdStr = note._id.toString();
        await storeEmbedding(userIdStr, noteIdStr, embedding);
        console.log(`Updated embedding for note ${noteIdStr} from user ${userIdStr}`);
      }
      
      return res.status(200).json({ note });
    }
    
    if (req.method === 'DELETE') {
      const note = await Note.findOneAndDelete({ _id: id, userId: req.user._id });
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      try {
        // Ensure consistent ID formatting
        const userIdStr = req.user._id.toString();
        const noteIdStr = note._id.toString();
        await deleteEmbedding(userIdStr, noteIdStr);
        console.log(`Deleted embedding for note ${noteIdStr} from user ${userIdStr}`);
      } catch (embeddingError) {
        console.error('Error deleting embedding:', embeddingError);
      }
      
      return res.status(200).json({ message: 'Note deleted successfully' });
    }
    
    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(`Error handling note ${id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export default requireAuth(handler);