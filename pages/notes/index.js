import { useEffect, useState } from 'react';
import NoteCard from '../../components/Notes/NoteCard';
import NotePagination from '../../components/Notes/NotePagination';
import Layout from '../../components/Layout/Layout';
import { fetchNotes } from '../../lib/db';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const loadNotes = async () => {
            const { notes, totalPages } = await fetchNotes(currentPage);
            setNotes(notes);
            setTotalPages(totalPages);
        };
        loadNotes();
    }, [currentPage]);

    return (
        <Layout>
            <h1>My Notes</h1>
            <div>
                {notes.map(note => (
                    <NoteCard key={note._id} note={note} />
                ))}
            </div>
            <NotePagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </Layout>
    );
};

export default NotesPage;