import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import ChatBox from '../components/Chat/ChatBox';
import ChatInput from '../components/Chat/ChatInput';
import { clientAuth } from '../lib/clientAuth';

export default function Chat() {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        if (!clientAuth.isAuthenticated()) {
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    const handleSendMessage = async (content) => {
        const newMessage = {
            role: 'user',
            content,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMessage]);
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${clientAuth.getToken()}`
                },
                body: JSON.stringify({ query: content })
            });

            const data = await response.json();

            if (response.ok) {
                let assistantContent = data.response;
                
                // Add helpful context for different scenarios
                if (data.error === 'rate_limited') {
                    assistantContent += '\n\n💡 *Tip: I need to slow down due to high usage. Please wait a moment before asking another question.*';
                } else if (data.error === 'ai_service_unavailable') {
                    assistantContent += '\n\n💡 *Note: AI responses are temporarily limited, but your notes are still searchable.*';
                } else if (data.searchMethod === 'text') {
                    assistantContent += '\n\n💡 *Note: Using text search (vector search temporarily unavailable).*';
                }
                
                const assistantMessage = {
                    role: 'assistant',
                    content: assistantContent,
                    timestamp: Date.now(),
                    sources: data.sources || [],
                    searchMethod: data.searchMethod,
                    error: data.error
                };
                
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                const errorMessage = {
                    role: 'assistant',
                    content: `Error: ${data.message || 'Failed to get response'}`,
                    timestamp: Date.now(),
                    isError: true
                };
                
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, there was an error processing your request.',
                timestamp: Date.now()
            };
            
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <Layout showSidebar={false}>
                <div className="flex items-center justify-center h-screen">
                    <p>Loading...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                    <ChatBox messages={messages} loading={loading} />
                </div>
                <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
            </div>
        </Layout>
    );
}