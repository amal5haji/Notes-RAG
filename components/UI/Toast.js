import React, { useState, useEffect } from 'react';
import styles from './Toast.module.css';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) setTimeout(onClose, 300); // Allow time for animation before removing
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div 
      className={`${styles.toast} ${styles[type]} ${visible ? styles.visible : styles.hidden}`}
      role="alert"
    >
      <div className={styles.message}>{message}</div>
    </div>
  );
};

export default Toast;