import React, { useEffect, useState } from 'react';
import './InvestmentPlans.css';
import './App.css';
import { FaWallet, FaRupeeSign } from 'react-icons/fa';

export default function WithdrawPage({ token }) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [upi, setUpi] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch('https://investmentsite-q1sz.onrender.com/api/wallet/balance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBalance(Number(data.balance) || 0);
      } catch {
        setBalance(0);
      }
    };
    if (token) fetchBalance();
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Enter a valid amount');
      setSubmitting(false);
      return;
    }
    if (Number(amount) > balance) {
      setError('Amount exceeds wallet balance');
      setSubmitting(false);
      return;
    }
    if (!upi) {
      setError('Enter your UPI ID or bank details');
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch('https://investmentsite-q1sz.onrender.com/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, upi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit withdrawal');
      setSuccess('Withdrawal request submitted! Your request will be reviewed and approved by an admin.');
      setAmount('');
      setUpi('');
    } catch (err) {
      setError(err.message || 'Failed to submit withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7fafc 0%, #e0f7ef 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '2.5vw 0 0 0' }}>
      <div style={{ maxWidth: 420, width: '95vw', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(34,197,94,0.10)', padding: '2rem 1.2rem 1.5rem 1.2rem', margin: '0 auto', marginTop: 18 }}>
        <h1 style={{ color: '#22c55e', fontWeight: 800, fontSize: '1.5rem', marginBottom: 18, letterSpacing: '0.01em', textAlign: 'center' }}>Withdraw Funds</h1>
        <div style={{ width: '100%', marginBottom: 18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '1.08rem', color: '#64748b', marginBottom: 4 }}>Wallet Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaWallet style={{ marginRight: 8 }} /> <FaRupeeSign style={{ marginRight: 4 }} />{balance.toFixed(2)}
          </div>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>Amount to Withdraw</label>
            <input
              name="amount"
              type="number"
              min={1}
              max={balance}
              value={amount}
              onChange={e => {
                let val = e.target.value;
                if (Number(val) > balance) val = balance;
                setAmount(val);
              }}
              required
              autoComplete="off"
              placeholder="Enter amount"
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
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>UPI ID / Bank Details</label>
            <input
              name="upi"
              value={upi}
              onChange={e => setUpi(e.target.value)}
              required
              autoComplete="off"
              placeholder="Enter your UPI ID or bank details"
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
          <div style={{ color: '#64748b', fontSize: '0.98rem', marginBottom: 16, textAlign: 'center', lineHeight: 1.5 }}>
            Withdrawals are reviewed and approved by an admin. You will be notified once your request is processed.
          </div>
          {success && <div className="status-message success" style={{ marginBottom: 14, color: '#22c55e', background: '#e7fbe9', borderRadius: 8, padding: '0.7rem 1rem', fontWeight: 600, fontSize: '1.05rem', textAlign: 'center' }}>{success}</div>}
          {error && <div className="status-message error" style={{ marginBottom: 14, color: '#ef4444', background: '#fbe7e7', borderRadius: 8, padding: '0.7rem 1rem', fontWeight: 600, fontSize: '1.05rem', textAlign: 'center' }}>{error}</div>}
          <button type="submit" className="withdraw-btn" style={{
            background: 'linear-gradient(90deg, #22c55e 60%, #4ade80 100%)',
            color: '#fff',
            fontSize: '1.13rem',
            fontWeight: 800,
            border: 'none',
            borderRadius: 12,
            padding: '1.1rem 0',
            marginTop: 8,
            boxShadow: '0 2px 8px rgba(34,197,94,0.10)',
            transition: 'background 0.18s, transform 0.18s',
            letterSpacing: '0.01em',
            display: 'block',
            width: '100%',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }} disabled={submitting}>{submitting ? 'Submitting...' : 'Withdraw'}</button>
        </form>
      </div>
    </div>
  );
} 