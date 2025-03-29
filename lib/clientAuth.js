// CLIENT-SIDE AUTH ONLY - No server imports
const TOKEN_KEY = 'authToken';

export const clientAuth = {
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    return await res.json();
  },
  
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    await fetch('/api/auth/logout', { method: 'POST' });
  },
  
  signup: async (name, email, password) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    return await res.json();
  },
  
  getUserInfo: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error getting user from token', error);
      return null;
    }
  },
  
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(TOKEN_KEY);
  },
};