import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerLinks}>
                    <a href="#" className={styles.footerLink}>About</a>
                    <a href="#" className={styles.footerLink}>Privacy</a>
                    <a href="#" className={styles.footerLink}>Terms</a>
                </div>
                <p>&copy; {new Date().getFullYear()} RAGNotes. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;