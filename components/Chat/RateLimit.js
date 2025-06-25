import React from 'react';
import styles from './RateLimit.module.css';

const RateLimitWarning = ({ show, retryAfter }) => {
  if (!show) return null;

  return (
    <div className={styles.rateLimitBanner}>
      <div className={styles.icon}>⏱️</div>
      <div className={styles.content}>
        <h4>Temporarily Rate Limited</h4>
        <p>
          I'm experiencing high demand right now. Please wait {retryAfter || 30} seconds 
          before sending another message.
        </p>
      </div>
    </div>
  );
};

export default RateLimitWarning;
