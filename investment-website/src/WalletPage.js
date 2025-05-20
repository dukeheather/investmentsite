import React, { useEffect, useState } from 'react';
import './WalletPage.css';

export default function WalletPage({ token }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [notif, setNotif] = useState(null);

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
    // Show notification for latest manual top-up status change
    const lastManual = data.transactions?.find(
      t => t.type === 'topup' && t.screenshotUrl && (t.status === 'success' || t.status === 'failed')
    );
    if (lastManual && !localStorage.getItem('notif-topup-' + lastManual.id)) {
      setNotif({
        id: lastManual.id,
        status: lastManual.status,
        amount: lastManual.amount,
        date: lastManual.createdAt,
      });
    }
  };

  const handleDismissNotif = () => {
    if (notif) localStorage.setItem('notif-topup-' + notif.id, '1');
    setNotif(null);
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
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server error: Invalid response');
      }
      if (data.paytmParams) {
        // Redirect to Paytm payment page (simulate for now)
        setMessage('Redirecting to Paytm...');
        // In production, you would POST these params to Paytm's payment gateway URL
        // For now, just show a message
      } else {
        setMessage(data.error || 'Failed to initiate payment');
      }
    } catch (err) {
      setMessage(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-container">
      <h2 className="wallet-title">Wallet</h2>
      {notif && (
        <div className={`wallet-notif-banner notif-${notif.status}`}> 
          <span>
            {notif.status === 'success' ? 'Your manual top-up of ' : 'Your manual top-up of '}<b>₹{notif.amount}</b> on {new Date(notif.date).toLocaleDateString()} was <b>{notif.status === 'success' ? 'APPROVED' : 'REJECTED'}</b>.
          </span>
          <button className="notif-dismiss-btn" onClick={handleDismissNotif}>×</button>
        </div>
      )}
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
                {txn.screenshotUrl && (
                  <a href={txn.screenshotUrl} target="_blank" rel="noopener noreferrer" className="txn-screenshot-link">View Screenshot</a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 