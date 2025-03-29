import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const NoteForm = () => {
    const [note, setNote] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note) return;

        try {
            await axios.post('/api/notes/create', { content: note });
            setNote('');
            router.push('/notes');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your note here..."
                required
            />
            <button type="submit">Add Note</button>
        </form>
    );
};

export default NoteForm;