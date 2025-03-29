import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import SignupForm from '../components/Auth/SignupForm';
import { clientAuth } from '../lib/clientAuth';

export default function Signup() {
    const router = useRouter();
    const [error, setError] = useState(null);
    
    useEffect(() => {
        // Redirect if already logged in
        if (clientAuth.isAuthenticated()) {
            router.push('/chat');
        }
    }, [router]);
    
    const handleSignup = async (data) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            const result = await response.json();
            
            if (!response.ok) {
                setError(result.message || 'Error creating account');
                return false;
            } else {
                router.push('/login?registered=true');
                return true;
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Signup error:', err);
            return false;
        }
    };

    return (
        <Layout showSidebar={false}>
            <div className="auth-container">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>RAGNotes</h1>
                        <p>Create your account</p>
                    </div>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    <SignupForm onSubmit={handleSignup} />
                </div>
            </div>
        </Layout>
    );
}