import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import { clientAuth } from '../lib/clientAuth';

export default function Account() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Check if user is logged in
    const userInfo = clientAuth.getUserInfo();
    if (!userInfo) {
      router.push('/login');
    } else {
      setUser(userInfo);
      setName(userInfo.name || '');
      setLoading(false);
    }
  }, [router]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientAuth.getToken()}`
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        // Update user info in state and local storage
        const updatedUser = { ...user, name };
        setUser(updatedUser);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error updating profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientAuth.getToken()}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Error updating password' });
      }
    } catch (error) {
      console.error('Password update error:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }
  };

  const handleLogout = () => {
    clientAuth.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-container">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Account Settings</h1>
          <p className="page-description">Manage your account information and password</p>
        </div>

        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.text}
          </div>
        )}

        <div className="card-section">
          <h2 className="card-title">Profile Information</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={user?.email || ''}
                disabled
              />
              <p className="form-hint">Your email address cannot be changed</p>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
            </div>
          </form>
        </div>

        {/* <div className="card-section">
          <h2 className="card-title">Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength="8"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength="8"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Update Password
              </button>
            </div>
          </form>
        </div> */}

        <div className="card-section">
          <h2 className="card-title">Account Actions</h2>
          <div className="form-actions">
            <button onClick={handleLogout} className="btn btn-danger">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}