import { getEmbedding, generateResponse } from './google-ai';
import { searchSimilarNotes } from './milvus';
import Note from '../models/Note';

export async function processNoteForRAG(note, userId) {
  try {
    const embedding = await getEmbedding(note.content);
    return { noteId: note._id.toString(), userId, embedding };
  } catch (error) {
    console.error('Error processing note for RAG:', error);
    throw error;
  }
}

export async function queryRAG(userId, query) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await getEmbedding(query);
    
    // Find similar notes
    const similarNotes = await searchSimilarNotes(userId, queryEmbedding, 5);
    
    if (!similarNotes || similarNotes.length === 0) {
      return {
        answer: "I couldn't find any relevant notes to answer your question.",
        sources: []
      };
    }
    
    // Fetch the full note contents
    const noteIds = similarNotes.map(note => note.noteId);
    const notes = await Note.find({
      _id: { $in: noteIds },
      userId
    });
    
    // Create context from notes
    const context = notes.map(note => note.content).join('\n\n');
    
    // Generate response from LLM
    const answer = await generateResponse(query, context);
    
    return {
      answer,
      sources: notes.map(note => ({
        id: note._id,
        title: note.title,
        preview: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')
      }))
    };
  } catch (error) {
    console.error('Error querying RAG:', error);
    throw error;
  }
}