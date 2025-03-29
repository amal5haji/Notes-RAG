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
                    <LoginForm />
                </div>
            </div>
        </Layout>
    );
}