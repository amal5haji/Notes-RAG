import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout/Layout';
import { clientAuth } from '../../../lib/clientAuth';

export default function EditNote() {
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clientAuth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchNote();
    }
  }, [router, id]);

  const fetchNote = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/notes/${id}`, {
        headers: {
          'Authorization': `Bearer ${clientAuth.getToken()}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setNote(data.note);
        setTitle(data.note.title);
        setContent(data.note.content);
      } else {
        setError(data.message || 'Error fetching note');
      }
    } catch (err) {
      console.error('Error fetching note:', err);
      setError('An error occurred while fetching the note');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientAuth.getToken()}`
        },
        body: JSON.stringify({ title, content })
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/notes/${id}`);
      } else {
        setError(data.message || 'Error updating note');
        setSaving(false);
      }
    } catch (err) {
      console.error('Error updating note:', err);
      setError('An error occurred. Please try again.');
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div className="flex justify-between items-center">
            <h1 className="page-title">Edit Note</h1>
            <Link href={`/notes/${id}`} className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="card-section">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading note...</p>
            </div>
          </div>
        ) : (
          <div className="card-section">
            <form onSubmit={handleSubmit}>
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
                  rows="12"
                  required
                />
              </div>

              <div className="form-actions">
                <Link 
                  href={`/notes/${id}`} 
                  className="btn btn-outline"
                  style={{ marginRight: '0.75rem' }}
                >
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}