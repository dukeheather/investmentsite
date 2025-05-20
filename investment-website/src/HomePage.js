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
        <img src="https://images.unsplash.com/photo-1514361892635-cebb9b6c7ca5?auto=format&fit=crop&w=600&q=80" alt="Banner" />
        <div className="banner-overlay" />
        <div className="banner-text modern-banner-text">
          <div className="banner-title">Welcome to <span style={{color:'#4ade80'}}>Astral Invest</span></div>
          <div className="banner-subtitle">Grow your wealth with confidence</div>
          <div className="banner-desc">Modern investment plans, instant wallet, and more.</div>
        </div>
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
      <div className="homepage-toggle">
        <button className={tab === 'day' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setTab('day')}>Day income</button>
        <button className={tab === 'vip' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setTab('vip')}>VIP Products</button>
      </div>
      <div className="homepage-cards modern-cards">
        <div className="info-card modern-info-card">
          <div className="info-label">Price</div>
          <div className="info-value">₹ 450</div>
        </div>
        <div className="info-card modern-info-card">
          <div className="info-label">Daily profit</div>
          <div className="info-value">₹ 120</div>
        </div>
        <div className="info-card modern-info-card">
          <div className="info-label">Day</div>
          <div className="info-value">30</div>
        </div>
        <div className="info-card modern-info-card">
          <div className="info-label">Total profit</div>
          <div className="info-value">₹ 3600</div>
        </div>
        <div className="info-card image-card modern-info-card">
          <img src="https://images.unsplash.com/photo-1514361892635-cebb9b6c7ca5?auto=format&fit=crop&w=200&q=80" alt="Product" />
        </div>
      </div>
    </div>
  );
} 