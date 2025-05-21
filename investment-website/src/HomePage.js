import React, { useState } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaMoneyBillWave, FaUserTie, FaBullhorn } from 'react-icons/fa';

export default function HomePage() {
  const [tab, setTab] = useState('day');
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <div className="homepage-banner modern-banner">
        <img src="/static/homepage-banner.jpg" alt="Banner" />
      </div>
      <div className="homepage-welcome">
        <h2 className="banner-title">Welcome to <span className="brand-highlight">SPG Invest</span></h2>
        <h3 className="banner-subtitle">Grow your wealth with confidence</h3>
        <p className="banner-desc">Modern investment plans, instant wallet, and more.</p>
      </div>
      <div className="homepage-actions modern-actions">
        <button className="action-btn" onClick={() => navigate('/recharge')}>
          <span className="action-icon"><FaWallet /></span>
          Recharge
        </button>
        <button className="action-btn" onClick={() => navigate('/withdraw')}>
          <span className="action-icon"><FaMoneyBillWave /></span>
          Withdraw
        </button>
        <button className="action-btn" onClick={() => navigate('/service')}>
          <span className="action-icon"><FaUserTie /></span>
          Service
        </button>
        <button className="action-btn" onClick={() => navigate('/channel')}>
          <span className="action-icon"><FaBullhorn /></span>
          Channel
        </button>
      </div>
      {/* <div className="homepage-toggle">
        <button className={tab === 'day' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setTab('day')}>Day income</button>
        <button className={tab === 'vip' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setTab('vip')}>VIP Products</button>
      </div> */}
    </div>
  );
} 