import React, { useState } from 'react';
import './HomePage.css';

export default function HomePage() {
  const [tab, setTab] = useState('day');

  return (
    <div className="homepage-container">
      <div className="homepage-banner">
        <img src="https://images.unsplash.com/photo-1514361892635-cebb9b6c7ca5?auto=format&fit=crop&w=600&q=80" alt="Banner" />
        <div className="banner-text">
          <div className="banner-title">FRATELLI'S LATEST RELEASE</div>
          <div className="banner-subtitle">PINOT NOIR</div>
          <div className="banner-desc">Elegance in Every Pour</div>
        </div>
      </div>
      <div className="homepage-actions">
        <button className="action-btn">
          <span className="action-icon">💳</span>
          Recharge
        </button>
        <button className="action-btn">
          <span className="action-icon">👛</span>
          Withdraw
        </button>
        <button className="action-btn">
          <span className="action-icon">🧑‍💼</span>
          Service
        </button>
        <button className="action-btn">
          <span className="action-icon">📢</span>
          Channel
        </button>
      </div>
      <div className="homepage-toggle">
        <button className={tab === 'day' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setTab('day')}>Day income</button>
        <button className={tab === 'vip' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setTab('vip')}>VIP Products</button>
      </div>
      <div className="homepage-cards">
        <div className="info-card">
          <div className="info-label">Price</div>
          <div className="info-value">₹ 450</div>
        </div>
        <div className="info-card">
          <div className="info-label">Daily profit</div>
          <div className="info-value">₹ 120</div>
        </div>
        <div className="info-card">
          <div className="info-label">Day</div>
          <div className="info-value">30</div>
        </div>
        <div className="info-card">
          <div className="info-label">Total profit</div>
          <div className="info-value">₹ 3600</div>
        </div>
        <div className="info-card image-card">
          <img src="https://images.unsplash.com/photo-1514361892635-cebb9b6c7ca5?auto=format&fit=crop&w=200&q=80" alt="Product" />
        </div>
      </div>
    </div>
  );
} 