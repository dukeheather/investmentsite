import React, { useState } from 'react';
import './InvestmentPlans.css';
import { useNavigate } from 'react-router-dom';
import CircleLoader from './components/CircleLoader';

const PRESET_AMOUNTS = [450, 1480, 4260, 9780, 18700, 29700];
const CHANNELS = [
  { label: 'Pay - A', value: 'A' },
  { label: 'Pay - B', value: 'B' },
  { label: 'Pay - C', value: 'C' },
];

export default function RechargeWalletPage({ token }) {
  const [amount, setAmount] = useState(PRESET_AMOUNTS[0]);
  const [selectedChannel, setSelectedChannel] = useState('A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Enter a valid amount');
      setLoading(false);
      return;
    }
    // Redirect to manual payment page with amount and channel
    navigate('/manual-payment', { state: { amount, channel: selectedChannel } });
    setLoading(false);
  };

  return (
    <div className="plans-page recharge-page-mobile-fix" style={{paddingTop: '1.2rem'}}>
      <h1 style={{marginBottom: '1.2rem'}}>Recharge</h1>
      <div className="buy-modal recharge-modal-mobile-fix" style={{ maxWidth: 420, margin: '0 auto', borderRadius: 18, boxShadow: '0 4px 24px rgba(30,41,59,0.10)' }}>
        <div style={{fontWeight: 700, fontSize: '1.15rem', marginBottom: 8}}>Balance Recharge</div>
        <div style={{color: '#64748b', fontSize: '0.98rem', marginBottom: 12}}>Please enter the recharge amount</div>
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16}}>
          {PRESET_AMOUNTS.map(val => (
            <button
              key={val}
              type="button"
              className={amount === val ? 'preset-amount-btn active' : 'preset-amount-btn'}
              onClick={() => setAmount(val)}
            >
              {val}
            </button>
          ))}
        </div>
        <div className="amount-display-box" style={{fontSize: '2rem', fontWeight: 700, background: '#f8fafc', borderRadius: 12, padding: '0.7rem 0', marginBottom: 18, textAlign: 'center', border: '1.5px solid #e2e8f0'}}>
          ₹ {amount}
        </div>
        <div style={{color: '#64748b', fontSize: '0.98rem', marginBottom: 10}}>Please select the recharge channel</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18}}>
          {CHANNELS.map(ch => (
            <button
              key={ch.value}
              type="button"
              className={selectedChannel === ch.value ? 'channel-btn active' : 'channel-btn'}
              onClick={() => setSelectedChannel(ch.value)}
            >
              {selectedChannel === ch.value && <span className="channel-check">✔</span>}
              {ch.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{marginBottom: 0}}>
          {error && <div className="status-message error" style={{marginBottom: 10}}>{error}</div>}
          <button className="buy-btn" type="submit" disabled={loading} style={{marginBottom: 12, width: '100%', fontSize: '1.1rem'}}>
            {loading ? <CircleLoader /> : 'Proceed to Payment'}
          </button>
        </form>
        <div className="recharge-info-box" style={{background: '#e0f7ef', color: '#22c55e', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: 6, fontWeight: 600, fontSize: '0.98rem'}}>MinimumRecharge: 450Rs.</div>
        <div className="recharge-info-box" style={{background: '#e0f7ef', color: '#2563eb', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: 6, fontWeight: 600, fontSize: '0.98rem'}}>Please pay and submit UTR within the stipulated time.</div>
        <div className="recharge-info-box" style={{background: '#e0f7ef', color: '#0f172a', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: 6, fontWeight: 600, fontSize: '0.98rem'}}>Do not save old account Recharge.</div>
      </div>
    </div>
  );
} 