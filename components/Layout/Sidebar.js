import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const router = useRouter();

    const isActive = (path) => {
        return router.pathname === path ? styles.active : '';
    };

    return (
        <aside className={styles.sidebar}>
            <nav className={styles.nav}>
                <Link href="/chat" className={`${styles.navItem} ${isActive('/chat')}`}>
                    Chat with RAG
                </Link>
                <Link href="/notes" className={`${styles.navItem} ${isActive('/notes')}`}>
                    My Notes
                </Link>
                <Link href="/notes/create" className={`${styles.navItem} ${isActive('/notes/create')}`}>
                    Add New Note
                </Link>
                <Link href="/account" className={`${styles.navItem} ${isActive('/account')}`}>
                    Account Settings
                </Link>
            </nav>
        </aside>
    );
};

export default Sidebar;