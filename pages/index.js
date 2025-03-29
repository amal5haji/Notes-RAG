import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout from '../components/Layout/Layout';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      router.push('/chat');
    }
  }, [router]);

  return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">RAG Notes Assistant</h1>
          <p className="text-xl mb-8">Loading your personal knowledge base...</p>
          <div className="spinner"></div>
        </div>
      </div>
    </Layout>
  );
}