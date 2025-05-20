import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import { FaWallet, FaCheckCircle, FaTimesCircle, FaClock, FaRupeeSign } from 'react-icons/fa';
import CircleLoader from './components/CircleLoader';

export default function ProfilePage({ setUser, setToken, user: userProp }) {
  const navigate = useNavigate();
  const [user, setUserState] = useState(userProp || null);
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnError, setTxnError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUserData = () => {
      if (!setToken) return;
      fetch('https://investmentsite-q1sz.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${setToken}` },
      })
        .then(res => res.json())
        .then(data => setUserState(data.user))
        .catch(() => {});
    };
    fetchUserData();
    const interval = setInterval(fetchUserData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [setToken]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!setToken) return;
      try {
        const res = await fetch('https://investmentsite-q1sz.onrender.com/api/wallet/balance', {
          headers: { Authorization: `Bearer ${setToken}` },
        });
        const data = await res.json();
        setWalletBalance(data.balance || 0);
      } catch (err) {
        console.error('Failed to fetch wallet balance:', err);
      }
    };
    fetchWalletBalance();
    const interval = setInterval(fetchWalletBalance, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [setToken]);

  useEffect(() => {
    if (!setToken) return;
    setTxnLoading(true);
    fetch('https://investmentsite-q1sz.onrender.com/api/wallet/transactions', {
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

  useEffect(() => {
    fetchReferralCode();
  }, []);

  const fetchReferralCode = async () => {
    try {
      const res = await fetch('https://investmentsite-q1sz.onrender.com/api/referral-code', {
        headers: { Authorization: `Bearer ${setToken}` },
      });
      const data = await res.json();
      setReferralCode(data.referralCode);
    } catch (error) {
      console.error('Failed to fetch referral code:', error);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <div className="profile-container modern-profile">
      <div className="profile-header modern-profile-header">
        <div className="profile-avatar modern-profile-avatar">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="#4ade80" />
            <circle cx="32" cy="26" r="12" fill="#232526" />
            <ellipse cx="32" cy="46" rx="18" ry="10" fill="#232526" />
          </svg>
        </div>
        <div className="profile-info-block">
          <div className="profile-id modern-profile-id">{user?.phone ? `+${user.phone}` : user?.email}</div>
          <div className="profile-email modern-profile-email">{user?.email}</div>
        </div>
      </div>
      <div className="profile-stats-card modern-profile-stats">
        <div className="profile-stat">
          <div className="stat-value">
            <FaRupeeSign className="rupee-icon" />
            {walletBalance.toFixed(2)}
          </div>
          <div className="stat-label">Balance</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">
            <FaRupeeSign className="rupee-icon" />
            {user?.recharge?.toFixed(2) ?? '0.00'}
          </div>
          <div className="stat-label">Recharge</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">
            <FaRupeeSign className="rupee-icon" />
            {user?.income?.toFixed(2) ?? '0.00'}
          </div>
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
        {txnLoading && <CircleLoader />}
        {txnError && <div className="status-message error">{txnError}</div>}
        {!txnLoading && !txnError && transactions.length === 0 && (
          <div className="status-message">No transactions found.</div>
        )}
        <ul className="wallet-txn-list">
          {transactions.map(txn => (
            <li key={txn.id} className={`wallet-txn-item txn-${txn.status}`}>
              <span className="txn-amount" style={{ color: txn.amount > 0 ? '#4ade80' : '#ef4444' }}>
                {txn.amount > 0 ? '+' : ''}<FaRupeeSign className="rupee-icon" />{txn.amount.toFixed(2)}
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
      <div className="referral-section">
        <h3>Your Referral Code</h3>
        <div className="referral-code-display">
          <span>{referralCode}</span>
          <button onClick={copyReferralCode} className="copy-btn">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="referral-info">
          Share this code with friends! When they register using your code, you'll get ₹50 in your wallet.
        </p>
      </div>
    </div>
  );
} 