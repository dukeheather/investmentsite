import React, { useState, useEffect } from 'react';
import './InvestmentPlans.css';
import { useNavigate } from 'react-router-dom';
import CircleLoader from './components/CircleLoader';
import { FaCheck, FaWallet, FaMoneyCheckAlt, FaCreditCard } from 'react-icons/fa';
import plansData from './pages/Plans.jsx';

// Get unique min values from plans, sorted ascending
const PRESET_AMOUNTS = Array.from(new Set(plansData.map(p => p.price || p.min))).sort((a, b) => a - b);
const CHANNELS = [
  { label: 'Pay - A', value: 'A', icon: <FaWallet /> },
  { label: 'Pay - B', value: 'B', icon: <FaMoneyCheckAlt /> },
  { label: 'Pay - C', value: 'C', icon: <FaCreditCard /> },
];

export default function RechargeWalletPage({ token }) {
  const [amount, setAmount] = useState(PRESET_AMOUNTS[0]);
  const [selectedChannel, setSelectedChannel] = useState('A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user ID from token
    const fetchUser = async () => {
      try {
        const res = await fetch('https://investmentsite-q1sz.onrender.com/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [token]);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    // Allow empty string for editing
    if (val === '' || /^[0-9]+$/.test(val)) {
      setAmount(val);
    }
  };

  const handleAmountBlur = () => {
    if (amount === '' || Number(amount) < PRESET_AMOUNTS[0]) {
      setAmount(PRESET_AMOUNTS[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!amount || isNaN(amount) || Number(amount) < PRESET_AMOUNTS[0]) {
      setError(`Minimum recharge is ${PRESET_AMOUNTS[0]}`);
      setLoading(false);
      setAmount(PRESET_AMOUNTS[0]);
      return;
    }

    // Process commission if user was referred
    if (userId) {
      try {
        await fetch('https://investmentsite-q1sz.onrender.com/api/referrals/process-commission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId,
            amount: Number(amount)
          })
        });
      } catch (error) {
        console.error('Error processing commission:', error);
      }
    }

    navigate('/manual-payment', { state: { amount, channel: selectedChannel } });
    setLoading(false);
  };

  return (
    <div className="plans-page recharge-page-mobile-fix" style={{paddingTop: '0.7rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      {/* Modern Recharge Form Card */}
      <div style={{
        maxWidth: 420,
        width: '100%',
        minWidth: 0,
        margin: '0 auto',
        borderRadius: 14,
        boxShadow: '0 2px 12px rgba(30,41,59,0.08)',
        padding: '1.2rem 1rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#3a4251',
        overflow: 'hidden',
      }}>
        <div style={{fontWeight: 700, fontSize: '1.02rem', marginBottom: 6, textAlign: 'center', color: '#fff'}}>Balance Recharge</div>
        <div style={{color: '#cbd5e1', fontSize: '0.93rem', marginBottom: 8, textAlign: 'center'}}>Please enter the recharge amount</div>
        <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, justifyContent: 'center', width: '100%'}}>
          {PRESET_AMOUNTS.map(val => (
            <button
              key={val}
              type="button"
              className={Number(amount) === val ? 'preset-amount-btn active' : 'preset-amount-btn'}
              style={{fontSize: '1rem', padding: '0.45rem 0.9rem', borderRadius: 14, minWidth: 60, flex: '1 1 70px', maxWidth: 90}}
              onClick={() => setAmount(val)}
            >
              {val}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          <input
            type="number"
            min={PRESET_AMOUNTS[0]}
            value={amount}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            className="amount-display-box"
            style={{
              fontSize: '1.35rem', fontWeight: 700, background: '#f8fafc', borderRadius: 10, padding: '0.5rem 0.7rem', textAlign: 'center', border: '1.2px solid #e2e8f0', minWidth: 110, maxWidth: 180, color: '#2563eb', boxShadow: '0 1px 4px rgba(30,41,59,0.04)', letterSpacing: '0.01em', width: '100%'
            }}
          />
          <div style={{color: '#cbd5e1', fontSize: '0.93rem', marginBottom: 7, marginTop: 10, textAlign: 'center'}}>Please select the recharge channel</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 13, width: '100%'}}>
            {CHANNELS.map(ch => (
              <button
                key={ch.value}
                type="button"
                className={selectedChannel === ch.value ? 'channel-btn active' : 'channel-btn'}
                style={{fontSize: '1rem', padding: '0.6rem 0.5rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, background: selectedChannel === ch.value ? 'linear-gradient(90deg, #4ade80 0%, #2563eb 100%)' : '#f1f5f9', color: selectedChannel === ch.value ? '#fff' : '#2563eb', border: selectedChannel === ch.value ? '1.5px solid #2563eb' : '1.2px solid #e2e8f0', width: '100%', maxWidth: 240, margin: '0 auto'}} 
                onClick={() => setSelectedChannel(ch.value)}
              >
                {selectedChannel === ch.value && <FaCheck style={{marginRight: 4}} />}
                {ch.icon}
                {ch.label}
              </button>
            ))}
          </div>
          {error && <div className="status-message error" style={{marginBottom: 8, fontSize: '0.97rem'}}>{error}</div>}
          <button className="buy-btn" type="submit" disabled={loading} style={{marginTop: 8}}>
            {loading ? <CircleLoader /> : 'Proceed to Payment'}
          </button>
        </form>
        <div className="recharge-notes-list" style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, width: '100%'}}>
          <div className="recharge-note-card" style={{background: '#e0f7ef', color: '#22c55e', borderRadius: 8, padding: '0.7rem 1rem', fontWeight: 600, fontSize: '0.97rem', display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{fontSize: '1.2rem'}}>💡</span> MinimumRecharge: {PRESET_AMOUNTS[0]}Rs.
          </div>
          <div className="recharge-note-card" style={{background: '#e0f2fe', color: '#2563eb', borderRadius: 8, padding: '0.7rem 1rem', fontWeight: 600, fontSize: '0.97rem', display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{fontSize: '1.2rem'}}>⏰</span> Please pay and submit UTR within the stipulated time.
          </div>
          <div className="recharge-note-card" style={{background: '#f1f5f9', color: '#0f172a', borderRadius: 8, padding: '0.7rem 1rem', fontWeight: 600, fontSize: '0.97rem', display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{fontSize: '1.2rem'}}>⚠️</span> Do not save old account Recharge.
          </div>
        </div>
      </div>
    </div>
  );
} 