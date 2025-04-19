import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout/Layout';
import NoteCard from '../../components/Notes/NoteCard';
import Toast from '../../components/UI/Toast';
import { clientAuth } from '../../lib/clientAuth';

export default function Notes() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!clientAuth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchNotes(currentPage);
  }, [router, currentPage]);

  const fetchNotes = async (page) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/notes?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${clientAuth.getToken()}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setNotes(data.notes);
        setTotalPages(data.totalPages);
      } else {
        setError(data.message || 'Error fetching notes');
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('An error occurred while fetching notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${clientAuth.getToken()}`
        }
      });

      if (response.ok) {
        // Remove the deleted note from the state
        setNotes(notes.filter(note => note._id !== noteId));
        // Show success toast
        setToast({
          message: 'Note deleted successfully',
          type: 'success'
        });
      } else {
        const data = await response.json();
        setError(data.message || 'Error deleting note');
        setToast({
          message: data.message || 'Error deleting note',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('An error occurred while deleting the note');
      setToast({
        message: 'An error occurred while deleting the note',
        type: 'error'
      });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`pagination-item ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="page-title">My Notes</h1>
              <p className="page-description">Browse and manage your personal notes</p>
            </div>
            <Link href="/notes/create" className="btn btn-primary">
              Add New Note
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
            <p className="text-center py-8">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="card-section">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2" style={{textAlign: 'center'}}>No notes yet</h3>
            </div>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => (
              <NoteCard 
                key={note._id} 
                note={note} 
                onDelete={() => handleDeleteNote(note._id)} 
              />
            ))}
          </div>
        )}

        {renderPagination()}

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </Layout>
  );
}