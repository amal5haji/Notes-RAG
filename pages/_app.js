import { useState, useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(err => {
        console.error('Auth verification error:', err);
        localStorage.removeItem('token');
      });
    }
  }, []);

  const authProps = {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser
  };

  return <Component {...pageProps} {...authProps} />;
}

export default MyApp;