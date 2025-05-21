import React, { useState } from 'react';
import './LoginRegister.css';

const API_URL = 'https://investmentsite-q1sz.onrender.com/api/auth';

export default function LoginRegister({ user, setUser, setToken }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', phone: '', referralCode: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (mode === 'register' && !form.phone) {
      setError('Phone number is required for registration.');
      setLoading(false);
      return;
    }
    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const res = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setForm({ email: '', password: '', phone: '', referralCode: '', confirmPassword: '' });
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setForm({ email: '', password: '', phone: '', referralCode: '', confirmPassword: '' });
    localStorage.removeItem('token');
    setToken(null);
  };

  if (user) {
    return (
      <div className="auth-fullscreen-bg">
        <div className="auth-banner">
          <img src="/static/vineyard-banner.jpg" alt="Banner" />
          <div className="auth-banner-gradient" />
        </div>
        <div className="auth-center-card">
          <div className="auth-welcome">Welcome, {user.email}!{user.phone && <div style={{fontSize:'0.95em',color:'#4ade80'}}>Phone: {user.phone}</div>}</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
        <div className="auth-animated-bg" />
      </div>
    );
  }

  return (
    <div className="auth-fullscreen-bg">
      <div className="auth-banner">
        <img src="/static/vineyard-banner.jpg" alt="Banner" />
        <div className="auth-banner-gradient" />
      </div>
      <div className="auth-center-card">
        <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />
          {mode === 'register' && (
            <>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                autoComplete="off"
                disabled={loading}
                pattern="[0-9]{10,15}"
                title="Enter a valid phone number"
              />
              <input
                type="text"
                name="referralCode"
                placeholder="Referral Code (Optional)"
                value={form.referralCode}
                onChange={handleChange}
                autoComplete="off"
                disabled={loading}
              />
            </>
          )}
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <div className="auth-switch">
          {mode === 'login' ? (
            <span>Don't have an account? <button type="button" onClick={() => setMode('register')} disabled={loading}>Register</button></span>
          ) : (
            <span>Already have an account? <button type="button" onClick={() => setMode('login')} disabled={loading}>Login</button></span>
          )}
        </div>
      </div>
      <div className="auth-animated-bg" />
    </div>
  );
} 