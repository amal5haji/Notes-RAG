import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import LoginForm from '../components/Auth/LoginForm';
import { clientAuth } from '../lib/clientAuth';

export default function Login() {
    const router = useRouter();
    
    useEffect(() => {
        // Redirect if already logged in
        if (clientAuth.isAuthenticated()) {
            router.push('/chat');
        }
    }, [router]);

    return (
        <Layout showSidebar={false}>
            <div className="auth-container">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>RAGNotes</h1>
                        <p>Your personal knowledge assistant</p>
                    </div>
                    <LoginForm />
                </div>
            </div>
        </Layout>
    );
}