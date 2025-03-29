import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import NoteCard from '../../components/Notes/NoteCard';

const NotePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetch(`/api/notes/${id}`)
                .then((response) => response.json())
                .then((data) => {
                    setNote(data);
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!note) {
        return <div>Note not found</div>;
    }

    return (
        <Layout>
            <NoteCard note={note} />
        </Layout>
    );
};

export default NotePage;