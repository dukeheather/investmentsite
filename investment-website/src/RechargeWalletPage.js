import React, { useState } from 'react';
import './InvestmentPlans.css';

export default function RechargeWalletPage({ token }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paytmParams, setPaytmParams] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPaytmParams(null);
    try {
      const res = await fetch('/api/wallet/topup/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server error: Invalid response');
      }
      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment');
      setPaytmParams(data.paytmParams);
      setTimeout(() => {
        document.getElementById('paytmForm')?.submit();
      }, 500);
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plans-page recharge-page-mobile-fix">
      <h1>Recharge Wallet</h1>
      <div className="wallet-balance-display" style={{ marginBottom: '2.5rem' }}>
        Add funds to your wallet using Paytm. Enter the amount and proceed to payment.
      </div>
      {!paytmParams ? (
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
            {loading ? 'Processing...' : 'Proceed to Paytm'}
          </button>
        </form>
      ) : (
        <div className="buy-modal recharge-modal-mobile-fix" style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
          <div className="status-message success">
            Redirecting to Paytm for payment...<br />
            If not redirected, <b>click the button below</b>.
          </div>
          <form
            id="paytmForm"
            method="post"
            action="https://securegw.paytm.in/theia/processTransaction"
          >
            {Object.entries(paytmParams).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
            <button className="buy-btn" type="submit" style={{ marginTop: 16 }}>
              Go to Paytm
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 