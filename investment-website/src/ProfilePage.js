import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import { FaWallet, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

export default function ProfilePage({ setUser, setToken }) {
  const navigate = useNavigate();
  // Placeholder user data
  const user = {
    id: '916000314727',
    balance: 0,
    recharge: 0,
    income: 0,
    progress: 0, // out of 450
  };

  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnError, setTxnError] = useState('');

  useEffect(() => {
    if (!setToken) return;
    setTxnLoading(true);
    fetch('/api/wallet/transactions', {
      headers: { Authorization: `Bearer ${setToken}` },
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setTxnLoading(false);
      })
      .catch(() => {
        setTxnError('Failed to load transactions');
        setTxnLoading(false);
      });
  }, [setToken]);

  const handleMenuClick = (label) => {
    if (label === 'Messages') {
      navigate('/messages');
    } else if (label === 'Personal Information') {
      navigate('/personal-info');
    } else if (label === 'Income Details') {
      navigate('/income-details');
    } else if (label === 'Withdrawal Details') {
      navigate('/withdrawal-details');
    } else if (label === 'About Us') {
      navigate('/about-us');
    } else if (label === 'Language') {
      navigate('/language');
    } else if (label === 'Contact Us') {
      navigate('/contact-us');
    } else if (label === 'Logout') {
      if (setUser) setUser(null);
      if (setToken) setToken(null);
      localStorage.removeItem('token');
      navigate('/');
    } else {
      alert(`${label} coming soon!`);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-bg"></div>
        <div className="profile-avatar">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="28" fill="#6ee7b7" />
            <circle cx="28" cy="22" r="10" fill="#232526" />
            <ellipse cx="28" cy="40" rx="14" ry="8" fill="#232526" />
          </svg>
        </div>
        <div className="profile-id">{user.id}</div>
        <div className="profile-progress-bar">
          <div className="profile-progress" style={{ width: `${(user.progress/450)*100}%` }}></div>
          <span className="profile-progress-label">{user.progress}/450</span>
        </div>
      </div>
      <div className="profile-stats-card">
        <div className="profile-stat">
          <div className="stat-value">{user.balance}</div>
          <div className="stat-label">Balance</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{user.recharge}</div>
          <div className="stat-label">Recharge</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{user.income}</div>
          <div className="stat-label">Total income</div>
        </div>
      </div>
      <div className="profile-menu-card">
        <button className="profile-menu-item" onClick={() => handleMenuClick('Messages')}>
          <span className="menu-icon">💬</span> Messages
        </button>
        <button className="profile-menu-item" onClick={() => handleMenuClick('Personal Information')}>
          <span className="menu-icon">🪪</span> Personal information
        </button>
        <button className="profile-menu-item" onClick={() => handleMenuClick('Income Details')}>
          <span className="menu-icon">📈</span> Income details
        </button>
        <button className="profile-menu-item" onClick={() => handleMenuClick('Withdrawal Details')}>
          <span className="menu-icon">💸</span> Withdrawal details
        </button>
        <button className="profile-menu-item" onClick={() => handleMenuClick('About Us')}>
          <span className="menu-icon">ℹ️</span> About us
        </button>
        <button className="profile-menu-item" onClick={() => handleMenuClick('Language')}>
          <span className="menu-icon">🌐</span> Language
        </button>
        <button className="profile-menu-item" onClick={() => handleMenuClick('Contact Us')}>
          <span className="menu-icon">📞</span> Contact us
        </button>
        <button className="profile-menu-item logout" onClick={() => handleMenuClick('Logout')}>
          <span className="menu-icon">🚪</span> Logout
        </button>
      </div>
      <section className="wallet-transactions-section">
        <h2><FaWallet style={{ marginRight: 8 }} />Wallet Transactions</h2>
        {txnLoading && <div>Loading...</div>}
        {txnError && <div className="status-message error">{txnError}</div>}
        {!txnLoading && !txnError && transactions.length === 0 && (
          <div className="status-message">No transactions found.</div>
        )}
        <ul className="wallet-txn-list">
          {transactions.map(txn => (
            <li key={txn.id} className={`wallet-txn-item txn-${txn.status}`}>
              <span className="txn-amount" style={{ color: txn.amount > 0 ? '#4ade80' : '#ef4444' }}>
                {txn.amount > 0 ? '+' : ''}{txn.amount} ₹
              </span>
              <span className="txn-type">{txn.type === 'topup' ? 'Top-up' : 'Purchase'}</span>
              <span className="txn-status">
                {txn.status === 'success' && <FaCheckCircle color="#4ade80" title="Success" />}
                {txn.status === 'pending' && <FaClock color="#fbbf24" title="Pending" />}
                {txn.status === 'failed' && <FaTimesCircle color="#ef4444" title="Failed" />}
                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
              </span>
              <span className="txn-date">{new Date(txn.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
} 