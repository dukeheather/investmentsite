import React from 'react';
import './ProfilePage.css';

export default function ProfilePage() {
  // Placeholder user data
  const user = {
    id: '916000314727',
    balance: 0,
    recharge: 0,
    income: 0,
    progress: 0, // out of 450
  };

  const handleMenuClick = (label) => {
    alert(`${label} coming soon!`);
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
    </div>
  );
} 