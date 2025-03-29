import React from 'react';

const NoteForm = ({ 
  title, 
  setTitle, 
  content, 
  setContent, 
  onSubmit, 
  onCancel, 
  isLoading,
  submitLabel = 'Save'
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="title" className="form-label">Title</label>
        <input
          type="text"
          id="title"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="content" className="form-label">Content</label>
        <textarea
          id="content"
          className="form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          required
        />
      </div>

      <div className="flex justify-between">
        <button 
          type="button" 
          className="btn btn-outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default NoteForm;