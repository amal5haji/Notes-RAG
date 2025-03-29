import React from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout({ children, showSidebar = true }) {
  const router = useRouter();
  const isAuthPage = router.pathname === '/login' || router.pathname === '/signup';

  return (
    <div className={styles.layoutContainer}>
      <Header />
      <div className={styles.mainContent}>
        {showSidebar && !isAuthPage && <Sidebar />}
        <main className={styles.pageContent}>{children}</main>
      </div>
      <Footer />
    </div>
  );
}