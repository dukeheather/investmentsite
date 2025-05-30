import React, { useState, useEffect } from 'react';
import './InvestmentPlans.css';
import CircleLoader from './components/CircleLoader';

export default function BankInfoPage({ token }) {
  const [form, setForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Helper to safely parse JSON
  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchBankInfo = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://investmentsite-q1sz.onrender.com/api/user/bank-info', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await safeJson(res);
        if (!res.ok || !data) throw new Error(data?.error || 'Failed to fetch bank info. Please check your network or contact support.');
        setForm({
          bankName: data.bankName || '',
          accountHolderName: data.accountHolderName || '',
          accountNumber: data.accountNumber || '',
          ifscCode: data.ifscCode || ''
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch bank info. Please check your network or contact support.');
      } finally {
        setLoading(false);
      }
    };
    fetchBankInfo();
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    // Validate form
    if (!form.bankName || !form.accountHolderName || !form.accountNumber || !form.ifscCode) {
      setError('All fields are required');
      setSaving(false);
      return;
    }
    if (form.ifscCode.length !== 11) {
      setError('IFSC code must be 11 characters long');
      setSaving(false);
      return;
    }
    try {
      const res = await fetch('https://investmentsite-q1sz.onrender.com/api/user/bank-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await safeJson(res);
      if (!res.ok || !data) throw new Error(data?.error || 'Failed to update bank info. Please check your network or contact support.');
      setSuccess('Bank information updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update bank info. Please check your network or contact support.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7fafc' }}>
        <CircleLoader />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7fafc 0%, #e0f7ef 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '2.5vw 0 0 0' }}>
      <div style={{ maxWidth: 420, width: '95vw', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(34,197,94,0.10)', padding: '2rem 1.2rem 1.5rem 1.2rem', margin: '0 auto', marginTop: 18 }}>
        <h1 style={{ color: '#22c55e', fontWeight: 800, fontSize: '1.5rem', marginBottom: 18, letterSpacing: '0.01em', textAlign: 'center' }}>Bank Information</h1>
        <form onSubmit={handleSave} autoComplete="off">
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>Bank Name</label>
            <input
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder="Enter your bank name"
              style={{
                padding: '1rem',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f9fafb',
                color: '#222',
                fontSize: '1.08rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 2,
                boxShadow: '0 1px 4px rgba(34,197,94,0.04)'
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>Account Holder Name</label>
            <input
              name="accountHolderName"
              value={form.accountHolderName}
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder="Enter account holder name"
              style={{
                padding: '1rem',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f9fafb',
                color: '#222',
                fontSize: '1.08rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 2,
                boxShadow: '0 1px 4px rgba(34,197,94,0.04)'
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>Account Number</label>
            <input
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder="Enter your account number"
              style={{
                padding: '1rem',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f9fafb',
                color: '#222',
                fontSize: '1.08rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 2,
                boxShadow: '0 1px 4px rgba(34,197,94,0.04)'
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>IFSC Code</label>
            <input
              name="ifscCode"
              value={form.ifscCode}
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder="Enter IFSC code"
              style={{
                padding: '1rem',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f9fafb',
                color: '#222',
                fontSize: '1.08rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 2,
                boxShadow: '0 1px 4px rgba(34,197,94,0.04)'
              }}
            />
          </div>
          {success && <div className="status-message success" style={{ marginBottom: 14, color: '#22c55e', background: '#e7fbe9', borderRadius: 8, padding: '0.7rem 1rem', fontWeight: 600, fontSize: '1.05rem', textAlign: 'center' }}>{success}</div>}
          {error && <div className="status-message error" style={{ marginBottom: 14, color: '#ef4444', background: '#fbe7e7', borderRadius: 8, padding: '0.7rem 1rem', fontWeight: 600, fontSize: '1.05rem', textAlign: 'center' }}>{error}</div>}
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'linear-gradient(90deg, #22c55e 60%, #4ade80 100%)',
              color: '#fff',
              fontSize: '1.13rem',
              fontWeight: 800,
              border: 'none',
              borderRadius: 12,
              padding: '1.1rem 0',
              width: '100%',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'background 0.18s, transform 0.18s',
              marginTop: 6
            }}
          >
            {saving ? <CircleLoader /> : 'Save Bank Information'}
          </button>
        </form>
      </div>
    </div>
  );
} 