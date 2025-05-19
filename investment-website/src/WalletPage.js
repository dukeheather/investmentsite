import React, { useEffect, useState } from 'react';
import './WalletPage.css';

export default function WalletPage({ token }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    // eslint-disable-next-line
  }, []);

  const fetchBalance = async () => {
    const res = await fetch('/api/wallet/balance', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBalance(data.balance || 0);
  };

  const fetchTransactions = async () => {
    const res = await fetch('/api/wallet/transactions', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTransactions(data.transactions || []);
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/wallet/topup/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.paytmParams) {
        // Redirect to Paytm payment page (simulate for now)
        setMessage('Redirecting to Paytm...');
        // In production, you would POST these params to Paytm's payment gateway URL
        // For now, just show a message
      } else {
        setMessage(data.error || 'Failed to initiate payment');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-container">
      <h2 className="wallet-title">Wallet</h2>
      <div className="wallet-balance-card">
        <div className="wallet-balance-label">Balance</div>
        <div className="wallet-balance-value">₹ {balance.toFixed(2)}</div>
      </div>
      <form className="wallet-topup-form" onSubmit={handleTopup}>
        <label>Top-up Amount</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />
        <button type="submit" className="topup-btn" disabled={loading || !amount}>Top Up</button>
        {message && <div className="wallet-message">{message}</div>}
      </form>
      <div className="wallet-history-card">
        <div className="wallet-history-title">Transaction History</div>
        {transactions.length === 0 ? (
          <div className="wallet-no-history">No transactions</div>
        ) : (
          <ul className="wallet-history-list">
            {transactions.map(txn => (
              <li key={txn.id} className={`wallet-history-item ${txn.type}`}> 
                <span className="txn-type">{txn.type === 'topup' ? 'Top-up' : 'Purchase'}</span>
                <span className="txn-amount">{txn.amount > 0 ? '+' : ''}{txn.amount}</span>
                <span className={`txn-status ${txn.status}`}>{txn.status}</span>
                <span className="txn-date">{new Date(txn.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 