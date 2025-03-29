import { useState } from 'react';
import NoteForm from '../../components/Notes/NoteForm';
import { useRouter } from 'next/router';

const CreateNote = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleNoteCreate = async (noteData) => {
        setLoading(true);
        const response = await fetch('/api/notes/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData),
        });
        if (response.ok) {
            router.push('/notes');
        }
        setLoading(false);
    };

    return (
        <div>
            <h1>Create a New Note</h1>
            <NoteForm onSubmit={handleNoteCreate} loading={loading} />
        </div>
    );
};

export default CreateNote;