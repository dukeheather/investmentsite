import React, { useState, useEffect, useRef } from 'react';
import './InvestmentPlans.css';
import { useNavigate } from 'react-router-dom';
import CircleLoader from './components/CircleLoader';
import { FaRupeeSign } from 'react-icons/fa';

const investmentPlans = [
  { id: 'A', name: 'Solar Energy - Rural', min: 350, max: 350, daily: `₹${(350 * 0.10).toFixed(2)} (10%)`, duration: '30 days', image: '/static/solar-rural.jpg' },
  { id: 'B', name: 'Solar Powered Street Lights', min: 1000, max: 1000, daily: `₹${(1000 * 0.08).toFixed(2)} (8%)`, image: '/static/solar-street-lights.jpg' },
  { id: 'C', name: 'EV Charging Station Urban', min: 2500, max: 2500, daily: `₹${(2500 * 0.08).toFixed(2)} (8%)`, image: '/static/ev-charging-urban.jpg' },
  { id: 'D', name: 'Eco-Urban Packaging Industry', min: 5000, max: 5000, daily: `₹${(5000 * 0.08).toFixed(2)} (8%)`, image: '/static/eco-urban-packaging.jpg' },
  { id: 'E', name: 'Plan E', min: 10000, max: 10000, daily: `₹${(10000 * 0.08).toFixed(2)} (8%)` },
  { id: 'F', name: 'Plan F', min: 25000, max: 25000, daily: `₹${(25000 * 0.08).toFixed(2)} (8%)` },
  { id: 'G', name: 'Plan G', min: 50000, max: 50000, daily: `₹${(50000 * 0.08).toFixed(2)} (8%)` },
  { id: 'H', name: 'Plan H', min: 100000, max: 100000, daily: `₹${(100000 * 0.08).toFixed(2)} (8%)` },
];
const vipPlans = [
  { id: 'VIP1', name: 'VIP 200', min: 200, max: 200, daily: `₹${(200 * 0.10).toFixed(2)} (10%)` },
  { id: 'VIP2', name: 'VIP 700', min: 700, max: 700, daily: `₹${(700 * 0.10).toFixed(2)} (10%)` },
  { id: 'VIP3', name: 'VIP 1000', min: 1000, max: 1000, daily: `₹${(1000 * 0.10).toFixed(2)} (10%)` },
  { id: 'VIP4', name: 'VIP 1500', min: 1500, max: 1500, daily: `₹${(1500 * 0.10).toFixed(2)} (10%)` },
  { id: 'VIP5', name: 'VIP 2000', min: 2000, max: 2000, daily: `₹${(2000 * 0.10).toFixed(2)} (10%)` },
  { id: 'VIP6', name: 'VIP 4500', min: 4500, max: 4500, daily: `₹${(4500 * 0.10).toFixed(2)} (10%)` },
  { id: 'VIP7', name: 'VIP 7000', min: 7000, max: 7000, daily: `₹${(7000 * 0.10).toFixed(2)} (10%)` },
  { id: 'VIP8', name: 'VIP 10000', min: 10000, max: 10000, daily: `₹${(10000 * 0.10).toFixed(2)} (10%)` },
];

export default function InvestmentPlans({ user, token }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingForm, setPendingForm] = useState(null);
  const [planType, setPlanType] = useState('normal'); // 'normal' or 'vip'
  const navigate = useNavigate();
  const [dailyIncome, setDailyIncome] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    fetchWalletBalance();
    fetchIncome();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch('https://investmentsite-q1sz.onrender.com/api/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWalletBalance(data.balance || 0);
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
    }
  };

  const fetchIncome = async () => {
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
            let rate = 0.05, duration = 30;
            if (plan.planName === 'Starter Plan') { rate = 0.05; duration = 30; }
            else if (plan.planName === 'VIP Plan') { rate = 0.08; duration = 20; }
            else if (plan.planName === 'Pro Plan') { rate = 0.12; duration = 10; }
            daily += plan.amount * rate;
            total += plan.amount * rate * duration;
          }
        });
        setDailyIncome(daily);
        setTotalIncome(total);
      }
    } catch {}
  };

  const handleBuy = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
    setMessage('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  const handleShowConfirm = (e) => {
    e.preventDefault();
    setPendingForm(e);
    setShowConfirmDialog(true);
  };

  const handleConfirmPurchase = () => {
    setShowConfirmDialog(false);
    if (pendingForm) {
      handlePurchase(pendingForm);
      setPendingForm(null);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setMessage('');
    const form = e.target;
    const amount = form.amount.value;
    const notes = form.notes.value;

    try {
      const amountNum = Number(amount);
      if (amountNum < selectedPlan.min || amountNum > selectedPlan.max) {
        setMessage(`Amount must be between ₹${selectedPlan.min} and ₹${selectedPlan.max}.`);
        return;
      }

      if (amountNum > walletBalance) {
        setMessage('Insufficient wallet balance. Please top up your wallet first.');
        return;
      }

      setLoading(true);
      const res = await fetch('https://investmentsite-q1sz.onrender.com/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planName: selectedPlan.name,
          amount: amountNum,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to purchase plan');
      }

      await fetchWalletBalance();
      
      setMessage('Plan purchased successfully!');
      setTimeout(() => {
        setShowModal(false);
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plans-page">
      <div className="wallet-balance-display">
        Wallet Balance: <span className="balance-amount">₹{walletBalance.toFixed(2)}</span>
      </div>
      <div className="plan-type-toggle">
        <button
          className={`toggle-btn${planType === 'normal' ? ' active' : ''}`}
          onClick={() => setPlanType('normal')}
          style={{
            border: '2px solid #22c55e',
            boxShadow: planType === 'normal' ? '0 2px 8px rgba(34,197,94,0.13)' : '0 1px 2px rgba(30,41,59,0.06)',
            background: planType === 'normal' ? 'linear-gradient(90deg, #22c55e 60%, #4ade80 100%)' : '#fff',
            color: planType === 'normal' ? '#fff' : '#22c55e',
            fontWeight: 800,
            fontSize: '1.18rem',
            padding: '1.1rem 2.2rem',
            borderRadius: 16,
            cursor: 'pointer',
            transition: 'all 0.18s',
            marginRight: 18,
          }}
        >
          Products
        </button>
        <button
          className={`toggle-btn${planType === 'vip' ? ' active' : ''}`}
          onClick={() => setPlanType('vip')}
          style={{
            border: '2px solid #22c55e',
            boxShadow: planType === 'vip' ? '0 2px 8px rgba(34,197,94,0.13)' : '0 1px 2px rgba(30,41,59,0.06)',
            background: planType === 'vip' ? 'linear-gradient(90deg, #22c55e 60%, #4ade80 100%)' : '#fff',
            color: planType === 'vip' ? '#fff' : '#22c55e',
            fontWeight: 800,
            fontSize: '1.18rem',
            padding: '1.1rem 2.2rem',
            borderRadius: 16,
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
        >
          VIP Plans
        </button>
      </div>
      <h2 style={{ color: planType === 'normal' ? '#22c55e' : '#f59e42', fontWeight: 800, margin: '1.2rem 0 0.7rem 0' }}>
        {planType === 'normal' ? 'Investment Plans' : 'VIP Plans'}
      </h2>
      <div className="plans-list">
        {(planType === 'normal' ? investmentPlans : vipPlans).map(plan => (
          <div className="plan-card" key={plan.id}>
            {plan.image && (
              <img src={plan.image} alt={plan.name} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 16, marginBottom: 16, background: '#e0f7ef', boxShadow: '0 1px 4px rgba(34,197,94,0.08)' }} />
            )}
            <h2>{plan.name}</h2>
            <div>Investment Amount: <b>₹{plan.min}</b></div>
            {plan.duration && <div>Duration: <b>{plan.duration}</b></div>}
            <div>Daily Earnings: <b>{plan.daily}</b></div>
            <button 
              className="buy-btn" 
              onClick={() => planType === 'normal' ? handleBuy(plan) : null}
              disabled={planType === 'vip' ? true : walletBalance < plan.min}
            >
              {planType === 'vip' ? 'Coming Soon' : (walletBalance < plan.min ? 'Insufficient Balance' : 'Buy / Invest')}
            </button>
          </div>
        ))}
      </div>
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Buy {selectedPlan.name}</h2>
            <div className="buy-modal-content">
              <form onSubmit={handleShowConfirm}>
                <div>
                  <label>Amount to Invest (₹):</label>
                  <input
                    name="amount"
                    type="number"
                    min={selectedPlan.min}
                    max={selectedPlan.max}
                    required
                    autoComplete="off"
                    placeholder={`Enter amount (₹${selectedPlan.min} - ₹${selectedPlan.max})`}
                  />
                  <div className="balance-info">
                    Your Balance: ₹{walletBalance.toFixed(2)}
                  </div>
                </div>
                <div>
                  <label>Notes (optional):</label>
                  <input name="notes" type="text" placeholder="Add any notes about this investment" />
                </div>
                {message && (
                  <div className={`status-message ${message.includes('successfully') ? 'success' : 'error'}`}>
                    {message.replace(/\$/g, '₹').replace(/\$/g, '₹').replace(/\$/g, '₹').replace(/\$/g, '₹').replace(/\$/g, '₹')}
                  </div>
                )}
                <div>
                  <button 
                    type="submit" 
                    className="buy-btn" 
                    disabled={loading}
                  >
                    {loading ? <CircleLoader /> : 'Confirm Purchase'}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
          {showConfirmDialog && (
            <div className="modal-overlay" style={{zIndex: 3000}}>
              <div className="modal-content" style={{maxWidth: 340, textAlign: 'center'}}>
                <h3>Are you sure you want to proceed?</h3>
                <p>This action will invest your selected amount in the {selectedPlan.name}.</p>
                <div className="modal-buttons">
                  <button className="buy-btn" onClick={handleConfirmPurchase} disabled={loading}>
                    {loading ? <CircleLoader /> : 'Yes, Proceed'}
                  </button>
                  <button className="cancel-btn" onClick={() => setShowConfirmDialog(false)} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 