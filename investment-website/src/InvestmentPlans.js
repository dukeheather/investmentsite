import React, { useState, useEffect, useRef } from 'react';
import './InvestmentPlans.css';
import { useNavigate } from 'react-router-dom';
import CircleLoader from './components/CircleLoader';

const plans = [
  {
    id: 1,
    name: 'Starter Plan',
    min: 350,
    max: 4999,
    profit: '12%/month',
    outcome: 'Perfect for beginners with steady returns.',
    duration: '3 month',
  },
  {
    id: 2,
    name: 'Growth Plan',
    min: 500,
    max: 49999,
    profit: '18%/month',
    outcome: 'Higher returns for experienced investors.',
    duration: '3 month',
  },
  {
    id: 3,
    name: 'Elite Plan',
    min: 5000,
    max: 500000,
    profit: '25%/month',
    outcome: 'Premium returns with dedicated support.',
    duration: '3 months',
  },
];

export default function InvestmentPlans({ user, token }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingForm, setPendingForm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletBalance();
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
      <div className="plans-list">
        {plans.map(plan => (
          <div className="plan-card" key={plan.id}>
            {plan.name === 'Starter Plan' && (
              <img src="/static/starter-plan.jpg" alt="Starter Plan" className="plan-image" style={{width: '100%', borderRadius: '16px', marginBottom: '1.1rem', objectFit: 'cover', maxHeight: '180px'}} />
            )}
            {plan.name === 'Growth Plan' && (
              <img src="/static/elite-plan.jpg" alt="Growth Plan" className="plan-image" style={{width: '100%', borderRadius: '16px', marginBottom: '1.1rem', objectFit: 'cover', maxHeight: '180px'}} />
            )}
            {plan.name === 'Elite Plan' && (
              <img src="/static/elite-plan.jpg" alt="Elite Plan" className="plan-image" style={{width: '100%', borderRadius: '16px', marginBottom: '1.1rem', objectFit: 'cover', maxHeight: '180px'}} />
            )}
            <h2>{plan.name}</h2>
            <div>Minimum Investment: <b>₹{plan.min}</b></div>
            <div>Maximum Investment: <b>₹{plan.max}</b></div>
            <div>Expected Profit: <b>{plan.profit}</b></div>
            <div>Duration: <b>{plan.duration}</b></div>
            <div className="plan-outcome">{plan.outcome}</div>
            <button 
              className="buy-btn" 
              onClick={() => handleBuy(plan)}
              disabled={walletBalance < plan.min}
            >
              {walletBalance < plan.min ? 'Insufficient Balance' : 'Buy / Invest'}
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
                <div className="modal-buttons">
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