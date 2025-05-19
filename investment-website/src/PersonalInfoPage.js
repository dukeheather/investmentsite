import React, { useEffect, useState } from 'react';
import './InvestmentPlans.css';

export default function PersonalInfoPage({ token }) {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
        setForm({ name: data.name || '', email: data.email || '' });
      } catch (err) {
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="plans-page">
      <h1>Personal Information</h1>
      <form className="buy-modal" style={{ maxWidth: 400, margin: '0 auto' }} onSubmit={handleSave}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required autoComplete="off" />
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="off" />
            {success && <div className="status-message success">{success}</div>}
            {error && <div className="status-message error">{error}</div>}
            <button className="buy-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </>
        )}
      </form>
    </div>
  );
} 