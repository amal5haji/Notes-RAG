import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { clientAuth } from '../../lib/clientAuth';

const LoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        // Show success message if redirected after registration
        if (router.query.registered) {
            setSuccess('Account created successfully! Please log in.');
        }
    }, [router.query]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await clientAuth.login(email, password);
            
            if (data.success) {
                clientAuth.setToken(data.token);
                router.push('/chat');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Welcome Back</h2>
            
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <div className="form-header">
                        <label htmlFor="password">Password</label>
                        <Link href="/forgot-password">Forgot password?</Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                <button
                    type="submit"
                    className={`auth-button ${loading ? 'loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
            
            <div className="auth-footer">
                <p>
                    Don't have an account?{' '}
                    <Link href="/signup">Create account</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;