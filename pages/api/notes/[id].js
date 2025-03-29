import dbConnect from '../../../lib/mongodb';
import Note from '../../../models/Note';
import { requireAuth } from '../../../lib/auth';

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
      
      if (title) note.title = title;
      if (content) note.content = content;
      
      await note.save();
      
      return res.status(200).json({ note });
    }
    
    if (req.method === 'DELETE') {
      const note = await Note.findOneAndDelete({ _id: id, userId: req.user._id });
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
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