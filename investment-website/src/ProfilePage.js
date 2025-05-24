import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import { FaWallet, FaCheckCircle, FaTimesCircle, FaClock, FaRupeeSign } from 'react-icons/fa';
import CircleLoader from './components/CircleLoader';
import GiftCodeRedeem from './components/GiftCodeRedeem';
import { PaperPlaneTilt, WhatsappLogo, Lifebuoy } from 'phosphor-react';

export default function ProfilePage({ setUser, setToken, user: userProp }) {
  const navigate = useNavigate();
  const [user, setUserState] = useState(userProp || null);
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnError, setTxnError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

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
        <div className="profile-header-top-row">
          <span className="vip-badge">SVIP</span>
          <span className="profile-balance">Balance: {walletBalance.toFixed(2)}</span>
        </div>
        <div className="profile-header-user-row">
          <span className="profile-masked-phone">{user?.phone ? user.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : ''}</span>
          <span className="profile-user-id">ID:{user?.id || ''}</span>
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
      <GiftCodeRedeem onBalanceUpdate={(newBalance) => setWalletBalance(newBalance)} />
      <div className="profile-menu-card">
        <button className="profile-menu-item" onClick={() => navigate('/recharge')}>
          <span className="menu-icon">💰</span> Recharge
        </button>
        <button className="profile-menu-item" onClick={() => navigate('/withdraw')}>
          <span className="menu-icon">🏧</span> Withdraw
        </button>
        <button className="profile-menu-item" onClick={() => navigate('/bank-info')}>
          <span className="menu-icon">🏦</span> Bank Information
        </button>
        <button className="profile-menu-item" onClick={() => navigate('/gift-receive')}>
          <span className="menu-icon">🎁</span> Gift Receive
        </button>
        <button className="profile-menu-item" onClick={() => navigate('/income-details')}>
          <span className="menu-icon">💹</span> My earnings
        </button>
        <button className="profile-menu-item" onClick={() => navigate('/my-team')}>
          <span className="menu-icon">👥</span> My Team
        </button>
        <button className="profile-menu-item" onClick={() => navigate('/my-project')}>
          <span className="menu-icon">📄</span> My Project
        </button>
        <button className="profile-menu-item" onClick={() => navigate('/password')}>
          <span className="menu-icon">🔑</span> Password
        </button>
        <button className="profile-menu-item" onClick={() => navigate('/channel')}>
          <span className="menu-icon">▶️</span> Selfie Channel
        </button>
        <button className="profile-menu-item" onClick={() => setShowSupportModal(true)}>
          <span className="menu-icon"><Lifebuoy size={22} color="#38bdf8" /></span> Support Us
        </button>
        <button className="profile-menu-item logout" onClick={() => handleMenuClick('Logout')}>
          <span className="menu-icon">↩️</span> Signout
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
      {/* Support Modal */}
      {showSupportModal && (
        <div className="modal-overlay" style={{zIndex: 3000}}>
          <div className="modal-content" style={{maxWidth: 340, textAlign: 'center', padding: 24}}>
            <h3>Contact Support</h3>
            <p style={{margin: '1rem 0 1.5rem 0', color: '#64748b'}}>Reach us on Telegram or WhatsApp for help and support.</p>
            <a
              href="https://t.me/your_telegram_placeholder"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, background: '#229ED9', color: '#fff', borderRadius: 8, padding: '0.7rem 1.3rem', fontWeight: 700, fontSize: '1.08rem', marginBottom: 16, textDecoration: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.10)'
              }}
            >
              <PaperPlaneTilt size={22} weight="fill" /> Telegram
            </a>
            <br />
            <a
              href="https://wa.me/your_whatsapp_placeholder"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 8, padding: '0.7rem 1.3rem', fontWeight: 700, fontSize: '1.08rem', marginBottom: 8, textDecoration: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.10)'
              }}
            >
              <WhatsappLogo size={22} weight="fill" /> WhatsApp
            </a>
            <br />
            <button
              onClick={() => setShowSupportModal(false)}
              style={{marginTop: 18, background: '#e0f2fe', color: '#2563eb', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer'}}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 