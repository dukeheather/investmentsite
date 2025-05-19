import React, { useState } from 'react';
import './LoginRegister.css';

const API_URL = 'https://investmentsite-q1sz.onrender.com/api/auth';

export default function LoginRegister({ user, setUser, setToken }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const body = mode === 'register' ? form : { email: form.email, password: form.password };
      const res = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      setForm({ email: '', password: '', name: '' });
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setForm({ email: '', password: '', name: '' });
    localStorage.removeItem('token');
    setToken(null);
  };

  if (user) {
    return (
      <div className="auth-box">
        <div className="auth-welcome">Welcome, {user.name || user.email}!</div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="auth-box">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            autoComplete="off"
            disabled={loading}
          />
        )}
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
  );
} 