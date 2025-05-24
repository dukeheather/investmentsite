import React, { useState } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaMoneyBillWave, FaUserTie, FaBullhorn } from 'react-icons/fa';

export default function HomePage() {
  const [tab, setTab] = useState('day');
  const navigate = useNavigate();

  // Example plan data (replace with your real plans)
  const plans = [
    {
      name: "Starter Plan",
      image: "/static/starter-plan.jpg",
      desc: "Earn 5% daily for 30 days. Min: ₹500",
      details: "Low risk, instant withdrawal.",
    },
    {
      name: "VIP Plan",
      image: "/static/plan2.jpg",
      desc: "Earn 8% daily for 20 days. Min: ₹5000",
      details: "Priority support, higher returns.",
    },
    {
      name: "Pro Plan",
      image: "/static/plan3.jpg",
      desc: "Earn 12% daily for 10 days. Min: ₹20000",
      details: "Best for experienced investors.",
    },
  ];

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
      {/* Plans Section */}
      <div className="homepage-plans-section">
        <h3 className="plans-title">Investment Plans</h3>
        <div className="plans-list">
          {plans.map(plan => (
            <div className="plan-card" key={plan.name}>
              <img
                src={plan.image}
                alt={plan.name}
                className="plan-image"
                style={{
                  width: '90px',
                  height: '90px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  background: '#e0f7ef',
                  boxShadow: '0 2px 8px rgba(34,197,94,0.10)'
                }}
                onError={e => { e.target.onerror = null; e.target.src = '/static/placeholder.jpg'; }}
              />
              <div className="plan-info">
                <div className="plan-name">{plan.name}</div>
                <div className="plan-desc">{plan.desc}</div>
                <div className="plan-details">{plan.details}</div>
                <button
                  className="plan-learn-btn"
                  onClick={() => navigate('/plans', { state: { planName: plan.name } })}
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <div className="homepage-toggle">
        <button className={tab === 'day' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setTab('day')}>Day income</button>
        <button className={tab === 'vip' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setTab('vip')}>VIP Products</button>
      </div> */}
    </div>
  );
} 