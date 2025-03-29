import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <Link href="/">
                <div className={styles.logo}>
                    <span>RAGNotes</span>
                </div>
            </Link>
            <nav className={styles.nav}>
                <Link href="/chat" className={styles.navLink}>Chat</Link>
                <Link href="/notes" className={styles.navLink}>Notes</Link>
                <Link href="/account" className={styles.navLink}>Account</Link>
            </nav>
        </header>
    );
};

export default Header;