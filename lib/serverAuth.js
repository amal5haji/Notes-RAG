import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_NAME = 'authToken';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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

export function removeTokenCookie(res) {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/',
  });
  
  res.setHeader('Set-Cookie', cookie);
}

export function parseCookies(req) {
  const cookie = req.headers?.cookie;
  return cookie?.split(';').reduce((res, item) => {
    const data = item.trim().split('=');
    return { ...res, [data[0]]: data[1] };
  }, {}) || {};
}

export function getTokenFromCookies(req) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

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