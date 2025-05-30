import React, { useEffect, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import CircleLoader from './components/CircleLoader';
import { FaWallet, FaRupeeSign } from "react-icons/fa";
import { investmentPlans as plansData } from './InvestmentPlans';

const API_URL = 'https://investmentsite-q1sz.onrender.com/api/dashboard';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'running':
      return 'dashboard-status-running';
    case 'pending_verification':
      return 'dashboard-status-pending';
    case 'rejected':
      return 'dashboard-status-rejected';
    default:
      return 'dashboard-status-default';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'running':
      return 'Active';
    case 'pending_verification':
      return 'Pending Verification';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

export default function Dashboard({ user, token }) {
  const [activePlans, setActivePlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const navigate = useNavigate();

  // Polling for real-time updates (every 30 seconds)
  useEffect(() => {
    let interval;
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setActivePlans(data.activePlans || []);
          setHistory(data.history || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchDashboard();
    interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchBalance();
  }, [token]);

  const fetchBalance = async () => {
    try {
      const res = await fetch('https://investmentsite-q1sz.onrender.com/api/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWalletBalance(data.balance || 0);
    } catch {
      setWalletBalance(0);
    }
  };

  const handleViewScreenshot = (screenshotUrl) => {
    setSelectedScreenshot(screenshotUrl);
  };

  const closeScreenshotModal = () => {
    setSelectedScreenshot(null);
  };

  // Split investments into active and pending
  const pendingPlans = activePlans.filter(plan => plan.status === 'pending_verification');
  const runningPlans = activePlans.filter(plan => plan.status === 'running');

  // Helper to get plan details by name
  const getPlanDetails = (planName) => plansData.find(p => p.name === planName);

  // Helper to extract numeric rate and duration from plan details
  const getPlanRateAndDuration = (planDetails) => {
    if (!planDetails) return { rate: 0, duration: 0 };
    // Try to extract rate from the daily string (e.g., '₹35.00')
    let rate = 0;
    if (planDetails.daily && planDetails.min) {
      // daily = ₹{min * rate}
      const dailyNum = Number(planDetails.daily.replace(/[^\d.]/g, ''));
      rate = dailyNum / planDetails.min;
    }
    // Try to extract duration from circulation (e.g., '30 days')
    let duration = 0;
    if (planDetails.circulation) {
      const match = planDetails.circulation.match(/(\d+)/);
      if (match) duration = parseInt(match[1]);
    }
    return { rate, duration };
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome-banner">
        Welcome, <span className="dashboard-welcome-user">{user?.name || user?.email}</span>
      </div>
      <div className="wallet-balance-card improved-wallet-card app-card">
        <div className="wallet-balance-info">
          <div className="wallet-balance-label">
            <FaWallet className="wallet-icon" />
            <span>Wallet Balance</span>
          </div>
          <div className="wallet-balance-amount">
            <FaRupeeSign className="rupee-icon" />
            <span>{walletBalance.toFixed(2)}</span>
          </div>
        </div>
        <div className="wallet-divider" />
        <button className="buy-btn improved-recharge-btn" onClick={() => navigate('/recharge')}>
          Recharge
        </button>
      </div>
      
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Active Investment Plans</h2>
        {loading ? <CircleLoader /> : (
          runningPlans.length === 0 ? <div>No active plans.</div> :
          <div className="dashboard-plans-list">
            {runningPlans.map(plan => {
              const planDetails = getPlanDetails(plan.planName);
              // Calculate real-time daily and total income
              let dailyIncome = '-';
              let totalIncome = '-';
              if (planDetails) {
                const { rate, duration } = getPlanRateAndDuration(planDetails);
                if (rate && duration && plan.createdAt) {
                  const start = new Date(plan.createdAt);
                  const now = new Date();
                  const msPerDay = 24 * 60 * 60 * 1000;
                  let daysElapsed = Math.floor((now - start) / msPerDay) + 1; // +1 to count today
                  if (daysElapsed > duration) daysElapsed = duration;
                  dailyIncome = `₹${(plan.amount * rate).toFixed(2)}`;
                  totalIncome = `₹${(plan.amount * rate * daysElapsed).toFixed(2)}`;
                }
              }
              return (
                <div className="dashboard-plan-card app-card" key={plan.id}>
                  <h3>{plan.planName}</h3>
                  <div>Amount Invested: <b>₹{plan.amount}</b></div>
                  {planDetails && <>
                    <div>Circulation: <b>{planDetails.circulation}</b></div>
                    <div>Daily Income: <b>{dailyIncome}</b></div>
                    <div>Total Income: <b>{totalIncome}</b></div>
                  </>}
                  <div>Started: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-'}</div>
                  <div className="status-row">
                    <span>Status: </span>
                    <span className={`dashboard-status ${getStatusBadgeClass(plan.status)}`}>
                      {getStatusText(plan.status)}
                    </span>
                  </div>
                  {plan.screenshotUrl && (
                    <button 
                      className="view-screenshot-btn"
                      onClick={() => handleViewScreenshot(plan.screenshotUrl)}
                    >
                      View Payment Screenshot
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Pending Verification Investments</h2>
        {loading ? <CircleLoader /> : (
          pendingPlans.length === 0 ? <div>No pending investments.</div> :
          <div className="dashboard-plans-list">
            {pendingPlans.map(plan => (
              <div className="dashboard-plan-card app-card" key={plan.id}>
                <h3>{plan.planName}</h3>
                <div>Amount Invested: <b>₹{plan.amount}</b></div>
                <div>Started: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-'}</div>
                <div className="status-row">
                  <span>Status: </span>
                  <span className={`dashboard-status ${getStatusBadgeClass(plan.status)}`}>
                    {getStatusText(plan.status)}
                  </span>
                </div>
                {plan.screenshotUrl && (
                  <button 
                    className="view-screenshot-btn"
                    onClick={() => handleViewScreenshot(plan.screenshotUrl)}
                  >
                    View Payment Screenshot
                  </button>
                )}
                <div className="verification-note">
                  Your payment is being verified. This usually takes 1-2 business days.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Investment History</h2>
        {loading ? <CircleLoader /> : (
          history.length === 0 ? <div>No investment history.</div> :
          <table className="dashboard-history-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Amount</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={idx}>
                  <td data-label="Plan">{item.planName}</td>
                  <td data-label="Amount">₹{item.amount}</td>
                  <td data-label="Start Date">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td data-label="End Date">-</td>
                  <td data-label="Status">
                    <span className={`dashboard-status ${getStatusBadgeClass(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td data-label="Payment">
                    {item.screenshotUrl ? (
                      <button 
                        className="view-screenshot-btn small"
                        onClick={() => handleViewScreenshot(item.screenshotUrl)}
                      >
                        View
                      </button>
                    ) : (
                      <span className="no-screenshot">No screenshot</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedScreenshot && (
        <div className="screenshot-modal-overlay" onClick={closeScreenshotModal}>
          <div className="screenshot-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeScreenshotModal}>×</button>
            <img 
              src={`https://investmentsite-q1sz.onrender.com${selectedScreenshot}`} 
              alt="Payment Screenshot" 
              className="screenshot-image"
            />
          </div>
        </div>
      )}
    </div>
  );
} 