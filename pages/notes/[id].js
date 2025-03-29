import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout/Layout';
import { clientAuth } from '../../lib/clientAuth';

export default function NoteDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
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
      } else {
        setError(data.message || 'Error fetching note');
      }
    } catch (err) {
      console.error('Error fetching note details:', err);
      setError('An error occurred while fetching the note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${clientAuth.getToken()}`
        }
      });

      if (response.ok) {
        router.push('/notes');
      } else {
        const data = await response.json();
        setError(data.message || 'Error deleting note');
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('An error occurred while deleting the note');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div className="flex justify-between items-center">
            <Link href="/notes" className="btn btn-outline">
              ← Back to Notes
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
        ) : note ? (
          <div className="card-section">
            <div className="note-detail-header">
              <h1 className="note-detail-title">{note.title}</h1>
              <div className="note-detail-meta">
                <span className="note-detail-date">Created: {formatDate(note.createdAt)}</span>
                {note.updatedAt !== note.createdAt && (
                  <span className="note-detail-date">Updated: {formatDate(note.updatedAt)}</span>
                )}
              </div>
            </div>

            <div className="note-detail-content">
              {note.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="note-detail-actions">
              <Link href={`/notes/edit/${note._id}`} className="btn btn-primary">
                Edit Note
              </Link>
              <button 
                onClick={handleDeleteNote}
                className="btn btn-danger ml-4"
              >
                Delete Note
              </button>
            </div>
          </div>
        ) : (
          <div className="card-section">
            <p className="text-center py-8">Note not found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}