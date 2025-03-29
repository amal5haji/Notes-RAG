import React from 'react';
import styles from './MessageBubble.module.css';

const MessageBubble = ({ message, isUser }) => {
    return (
        <div className={`${styles.messageBubble} ${isUser ? styles.user : styles.assistant}`}>
            <div>{message.content}</div>
            <div className={styles.messageTime}>
                {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
};

export default MessageBubble;