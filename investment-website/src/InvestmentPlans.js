import React, { useState, useEffect } from 'react';
import './InvestmentPlans.css';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    id: 1,
    name: 'Starter Plan',
    min: 100,
    max: 999,
    profit: '10%/yr',
    outcome: 'Steady returns for beginners.',
  },
  {
    id: 2,
    name: 'Growth Plan',
    min: 1000,
    max: 9999,
    profit: '15%/yr',
    outcome: 'Balanced risk and reward for growth.',
  },
  {
    id: 3,
    name: 'Elite Plan',
    min: 10000,
    max: 100000,
    profit: '20%/yr',
    outcome: 'Maximum returns and premium support.',
  },
];

export default function InvestmentPlans({ user, token }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch('/api/wallet/balance', {
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

  const handlePurchase = async (e) => {
    e.preventDefault();
    setMessage('');
    const form = e.target;
    const amount = form.amount.value;
    const notes = form.notes.value;

    try {
      const amountNum = Number(amount);
      if (amountNum < selectedPlan.min || amountNum > selectedPlan.max) {
        setMessage(`Amount must be between $${selectedPlan.min} and $${selectedPlan.max}.`);
        return;
      }

      if (amountNum > walletBalance) {
        setMessage('Insufficient wallet balance. Please top up your wallet first.');
        return;
      }

      setLoading(true);
      const res = await fetch('/api/purchase', {
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
      <h1>Investment Plans</h1>
      <div className="wallet-balance-display">
        Wallet Balance: <span className="balance-amount">${walletBalance.toFixed(2)}</span>
      </div>
      <div className="plans-list">
        {plans.map(plan => (
          <div className="plan-card" key={plan.id}>
            <h2>{plan.name}</h2>
            <div>Minimum Investment: <b>${plan.min}</b></div>
            <div>Maximum Investment: <b>${plan.max}</b></div>
            <div>Expected Profit: <b>{plan.profit}</b></div>
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
        <div className="buy-modal-overlay">
          <div className="buy-modal">
            <h2>Buy {selectedPlan.name}</h2>
            <div className="buy-modal-content">
              <form onSubmit={handlePurchase}>
                <div>
                  <label>Amount to Invest ($):</label>
                  <input
                    name="amount"
                    type="number"
                    min={selectedPlan.min}
                    max={selectedPlan.max}
                    required
                    autoComplete="off"
                    placeholder={`Enter amount (${selectedPlan.min} - ${selectedPlan.max})`}
                  />
                  <div className="balance-info">
                    Your Balance: ${walletBalance.toFixed(2)}
                  </div>
                </div>
                <div>
                  <label>Notes (optional):</label>
                  <input name="notes" type="text" placeholder="Add any notes about this investment" />
                </div>
                {message && (
                  <div className={`status-message ${message.includes('successfully') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}
                <div className="modal-buttons">
                  <button 
                    type="submit" 
                    className="buy-btn" 
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Confirm Purchase'}
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
        </div>
      )}
    </div>
  );
} 