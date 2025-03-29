import { removeTokenCookie } from '../../../lib/serverAuth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  removeTokenCookie(res);
  res.status(200).json({ success: true });
}