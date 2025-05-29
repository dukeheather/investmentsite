import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaMoneyBillWave, FaUserTie, FaBullhorn, FaRupeeSign } from 'react-icons/fa';
// Import plans from InvestmentPlans
import { investmentPlans as plansData, vipPlans } from './InvestmentPlans';

export default function HomePage() {
  const [tab, setTab] = useState('day');
  const [dailyIncome, setDailyIncome] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncome = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('https://investmentsite-q1sz.onrender.com/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          let daily = 0;
          let total = 0;
          (data.activePlans || []).forEach(plan => {
            if (plan.status === 'running') {
              // Find plan details in both arrays
              const planDetails = [...plansData, ...vipPlans].find(p => p.name === plan.planName);
              if (planDetails) {
                // Extract rate and duration from plan details
                const rate = Number(planDetails.daily.replace(/[^\d.]/g, '')) / planDetails.min;
                const duration = parseInt(planDetails.circulation);
                daily += plan.amount * rate;
                total += plan.amount * rate * duration;
              }
            }
          });
          setDailyIncome(daily);
          setTotalIncome(total);
        }
      } catch {}
    };
    fetchIncome();
  }, []);

  useEffect(() => {
    // Fetch plans from backend API
    const fetchPlans = async () => {
      try {
        const res = await fetch('https://investmentsite-q1sz.onrender.com/api/plans');
        if (res.ok) {
          const data = await res.json();
          // Expecting data to be an array of plans
          setPlans(data.slice(0, 3));
        } else {
          setPlans(plansData.slice(0, 3)); // fallback to static
        }
      } catch {
        setPlans(plansData.slice(0, 3)); // fallback to static
      }
    };
    fetchPlans();
  }, []);

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
      <div className="homepage-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', margin: '1.2rem 0' }}>
        <div className="info-card">
          <div className="info-label">Daily Income</div>
          <div className="info-value"><FaRupeeSign style={{marginRight:4}} />{dailyIncome.toFixed(2)}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Total Income</div>
          <div className="info-value"><FaRupeeSign style={{marginRight:4}} />{totalIncome.toFixed(2)}</div>
        </div>
      </div>
      {/* Plans Section */}
      <div className="homepage-plans-section">
        <h3 className="plans-title">Featured Investment Plans</h3>
        <div className="plans-list">
          {plans.map((plan, idx) => (
            <div className="plan-card" key={plan.name + idx} style={{
              width: '100%',
              maxWidth: '370px',
              margin: '0 auto',
              borderRadius: '22px',
              boxShadow: '0 6px 32px rgba(34,197,94,0.13), 0 2px 8px rgba(0,0,0,0.06)',
              background: '#fff',
              padding: '2rem 1.5rem 1.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
              <div className="plan-name" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#181c24', marginBottom: '0.5rem' }}>{plan.name}</div>
              <div className="plan-desc" style={{ fontSize: '1.08rem', color: '#2563eb', marginBottom: '0.3rem' }}>Price: ₹{plan.min}</div>
              <div className="plan-details" style={{ fontSize: '0.99rem', color: '#64748b', marginBottom: '0.7rem' }}>Circulation: {plan.circulation}</div>
              <button
                className="plan-learn-btn"
                style={{
                  marginTop: '0.7rem',
                  background: 'linear-gradient(90deg, #22c55e 60%, #2563eb 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.7rem 1.5rem',
                  fontSize: '1.08rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(34,197,94,0.08)',
                  transition: 'background 0.18s, box-shadow 0.18s, transform 0.12s',
                }}
                onClick={() => navigate('/plans')}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
          <button className="view-plans" onClick={() => navigate('/plans')}>
            View All Plans
          </button>
        </div>
      </div>
      {/* <div className="homepage-toggle">
        <button className={tab === 'day' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setTab('day')}>Day income</button>
        <button className={tab === 'vip' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setTab('vip')}>VIP Products</button>
      </div> */}
    </div>
  );
} 