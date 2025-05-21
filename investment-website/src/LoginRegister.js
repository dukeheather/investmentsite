import React, { useState } from 'react';
import './LoginRegister.css';

const API_URL = 'https://investmentsite-q1sz.onrender.com/api/auth';

export default function LoginRegister({ user, setUser, setToken }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', phone: '', referralCode: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Eye icon SVG
  const EyeIcon = ({ open }) => (
    <span style={{ cursor: 'pointer', marginLeft: 8, color: '#64748b', fontSize: '1.2em', verticalAlign: 'middle' }}>
      {open ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l22 22"/><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C7 19 2.73 15.11 1 12c.74-1.32 1.81-2.87 3.11-4.19M9.88 9.88A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .39-.08.76-.21 1.09"/><path d="M21.17 21.17A10.94 10.94 0 0 0 23 12c-1.73-3.11-6-7-11-7-1.61 0-3.16.31-4.59.86"/></svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12C2.73 15.11 7 19 12 19s9.27-3.89 11-7c-1.73-3.11-6-7-11-7S2.73 8.89 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
      )}
    </span>
  );

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
        <h2 className="auth-title-left">{mode === 'login' ? 'Login' : 'User Registration'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-eye-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
            <span onClick={() => setShowPassword(v => !v)}><EyeIcon open={showPassword} /></span>
          </div>
          {mode === 'register' && (
            <>
              <div className="input-eye-wrap">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span onClick={() => setShowConfirmPassword(v => !v)}><EyeIcon open={showConfirmPassword} /></span>
              </div>
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
          {mode === 'login' && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
              disabled={loading}
            />
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