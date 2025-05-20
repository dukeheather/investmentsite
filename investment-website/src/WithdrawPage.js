import React, { useEffect, useState } from 'react';
import './InvestmentPlans.css';
import CircleLoader from './components/CircleLoader';

export default function WithdrawPage({ token }) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [upi, setUpi] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/wallet/balance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBalance(data.balance || 0);
      } catch {
        setError('Failed to fetch balance');
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
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
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, upi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit withdrawal');
      setSuccess('Withdrawal request submitted!');
      setAmount('');
      setUpi('');
    } catch (err) {
      setError(err.message || 'Failed to submit withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="plans-page">
      <h1>Withdraw Funds</h1>
      <form className="buy-modal" style={{ maxWidth: 400, margin: '0 auto' }} onSubmit={handleSubmit}>
        {loading ? (
          <CircleLoader />
        ) : (
          <>
            <div className="wallet-balance-display" style={{ marginBottom: 16 }}>
              Wallet Balance: <span className="balance-amount">₹{balance.toFixed(2)}</span>
            </div>
            <label>Amount to Withdraw</label>
            <input
              name="amount"
              type="number"
              min={1}
              max={balance}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              autoComplete="off"
              placeholder="Enter amount"
            />
            <label>UPI ID / Bank Details</label>
            <input
              name="upi"
              value={upi}
              onChange={e => setUpi(e.target.value)}
              required
              autoComplete="off"
              placeholder="Enter your UPI ID or bank details"
            />
            {success && <div className="status-message success">{success}</div>}
            {error && <div className="status-message error">{error}</div>}
            <button className="buy-btn" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Withdraw'}</button>
          </>
        )}
      </form>
    </div>
  );
} 