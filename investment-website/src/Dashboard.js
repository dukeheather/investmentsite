import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = '/api/dashboard';

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