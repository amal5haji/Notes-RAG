import React from 'react';
import Link from 'next/link';
import styles from './NoteCard.module.css';

const NoteCard = ({ note, onDelete }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Truncate content if it's too long
  const truncateContent = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={styles.noteCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>{note.title}</h3>
        <span className={styles.date}>{formatDate(note.createdAt)}</span>
      </div>
      
      <p className={styles.content}>
        {truncateContent(note.content)}
      </p>
      
      <div className={styles.footer}>
        <Link href={`/notes/${note._id}`} className={`${styles.button} ${styles.viewButton}`}>
          View
        </Link>
        <Link href={`/notes/edit/${note._id}`} className={`${styles.button} ${styles.editButton}`}>
          Edit
        </Link>
        <button 
          onClick={() => onDelete(note._id)} 
          className={`${styles.button} ${styles.deleteButton}`}
          type="button"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteCard;