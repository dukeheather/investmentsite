import React, { useState } from 'react';
import './InvestmentPlans.css';
import { useNavigate } from 'react-router-dom';

export default function RechargeWalletPage({ token }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Enter a valid amount');
      setLoading(false);
      return;
    }
    // Redirect to manual payment page with amount
    navigate('/manual-payment', { state: { amount } });
    setLoading(false);
  };

  return (
    <div className="plans-page recharge-page-mobile-fix">
      <h1>Recharge Wallet</h1>
      <div className="wallet-balance-display" style={{ marginBottom: '2.5rem' }}>
        Add funds to your wallet using Paytm. Enter the amount and proceed to payment.
      </div>
      {!false ? (
        <form className="buy-modal recharge-modal-mobile-fix" style={{ maxWidth: 400, margin: '0 auto' }} onSubmit={handleSubmit}>
          <label htmlFor="amount">Amount (₹):</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={1}
            required
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter amount to add"
            autoComplete="off"
          />
          {error && <div className="status-message error">{error}</div>}
          <button className="buy-btn" type="submit" disabled={loading || !amount}>
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>
      ) : null}
    </div>
  );
} 