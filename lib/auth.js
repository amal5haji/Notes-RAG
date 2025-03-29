import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_NAME = 'authToken';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// SERVER-SIDE ONLY
export function createToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: MAX_AGE }
  );
}

// SERVER-SIDE ONLY
export function setTokenCookie(res, token) {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict',
  });
  
  res.setHeader('Set-Cookie', cookie);
}

// SERVER-SIDE ONLY
export function removeTokenCookie(res) {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/',
  });
  
  res.setHeader('Set-Cookie', cookie);
}

// SERVER-SIDE ONLY
export function parseCookies(req) {
  const cookie = req.headers?.cookie;
  return cookie?.split(';').reduce((res, item) => {
    const data = item.trim().split('=');
    return { ...res, [data[0]]: data[1] };
  }, {}) || {};
}

// SERVER-SIDE ONLY
export function getTokenFromCookies(req) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}

// SERVER-SIDE ONLY
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(req) {
  const token = getTokenFromCookies(req);
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id }).select('-password');
    
    if (!user) return null;
    
    return user;
  } catch (error) {
    return null;
  }
}

// SERVER-SIDE ONLY
export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || 
                   getTokenFromCookies(req);
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({ message: 'Authentication error' });
    }
  };
}

// CLIENT-SIDE AUTH HELPERS
export const clientAuth = {
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
    localStorage.removeItem('token');
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
  
  getUser: () => {
    try {
      const token = localStorage.getItem('token');
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
    return !!localStorage.getItem('token');
  },
};