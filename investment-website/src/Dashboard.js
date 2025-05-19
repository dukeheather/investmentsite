import React, { useEffect, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

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

  // Polling for real-time updates (every 5 seconds)
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
    interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchBalance();
  }, [token]);

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/wallet/balance', {
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

  return (
    <div className="dashboard-page">
      <div className="wallet-balance-card" style={{ maxWidth: 350, margin: '0 auto 2rem auto', background: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.2rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '1.1rem', color: '#94a3b8' }}>Wallet Balance</div>
          <div style={{ fontSize: '1.7rem', color: '#4ade80', fontWeight: 700 }}>₹ {walletBalance.toFixed(2)}</div>
        </div>
        <button className="buy-btn" style={{ minWidth: 100, marginLeft: 16 }} onClick={() => navigate('/recharge')}>
          Recharge
        </button>
      </div>
      <h1 className="dashboard-title">Welcome, <span className="green">{user?.name || user?.email}</span></h1>
      
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Active Investment Plans</h2>
        {loading ? <div>Loading...</div> : (
          runningPlans.length === 0 ? <div>No active plans.</div> :
          <div className="dashboard-plans-list">
            {runningPlans.map(plan => (
              <div className="dashboard-plan-card" key={plan.id}>
                <h3>{plan.planName}</h3>
                <div>Amount Invested: <b>${plan.amount}</b></div>
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
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Pending Verification Investments</h2>
        {loading ? <div>Loading...</div> : (
          pendingPlans.length === 0 ? <div>No pending investments.</div> :
          <div className="dashboard-plans-list">
            {pendingPlans.map(plan => (
              <div className="dashboard-plan-card" key={plan.id}>
                <h3>{plan.planName}</h3>
                <div>Amount Invested: <b>${plan.amount}</b></div>
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
        {loading ? <div>Loading...</div> : (
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
                  <td data-label="Amount">${item.amount}</td>
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