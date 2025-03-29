import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import styles from './ChatBox.module.css';

const ChatBox = ({ messages = [], loading = false }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                    <div className={styles.emptyChat}>
                        <div className={styles.emptyIcon}>💬</div>
                        <h3>Start a conversation</h3>
                        <p>Ask a question about your notes and I'll try to help!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <MessageBubble 
                                key={index}
                                message={message}
                                isUser={message.role === 'user'}
                            />
                        ))}
                        {loading && (
                            <div className={`${styles.messageBubble} ${styles.assistant}`}>
                                <div className={styles.typingIndicator}>
                                    <span className={styles.typingDot}></span>
                                    <span className={styles.typingDot}></span>
                                    <span className={styles.typingDot}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatBox;