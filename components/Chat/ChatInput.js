import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatInput.module.css';

const ChatInput = ({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={disabled}
                    rows={1}
                />
                <button 
                    type="submit" 
                    className={styles.sendButton}
                    disabled={!message.trim() || disabled}
                >
                    →
                </button>
            </div>
        </form>
    );
};

export default ChatInput;