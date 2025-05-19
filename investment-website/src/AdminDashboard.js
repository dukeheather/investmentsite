import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

export default function AdminDashboard({ token }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingInvestments, setPendingInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/check', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setIsAdmin(data.isAdmin);
      if (data.isAdmin) {
        fetchPendingInvestments();
      }
    } catch (e) {
      setError('Failed to check admin status');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvestments = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/pending-investments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch pending investments');
      const data = await res.json();
      setPendingInvestments(data.pendingInvestments);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedInvestment) return;
    
    try {
      const res = await fetch('http://localhost:3000/api/admin/update-investment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          investmentId: selectedInvestment.id,
          status,
          adminNotes
        })
      });

      if (!res.ok) throw new Error('Failed to update investment status');
      
      setSuccess(`Investment ${status === 'running' ? 'approved' : 'rejected'} successfully`);
      setSelectedInvestment(null);
      setAdminNotes('');
      fetchPendingInvestments();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;
  if (!isAdmin) return <div className="admin-error">Access Denied: Admin privileges required</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <h2>Pending Investments</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="pending-investments">
        {pendingInvestments.length === 0 ? (
          <p>No pending investments to review</p>
        ) : (
          pendingInvestments.map(investment => (
            <div key={investment.id} className="investment-card">
              <div className="investment-header">
                <h3>{investment.planName}</h3>
                <span className="amount">${investment.amount}</span>
              </div>
              
              <div className="investment-details">
                <p><strong>Investor:</strong> {investment.user.firstName} {investment.user.lastName}</p>
                <p><strong>Email:</strong> {investment.user.email}</p>
                <p><strong>Transaction ID:</strong> {investment.transactionId}</p>
                <p><strong>Date:</strong> {new Date(investment.createdAt).toLocaleString()}</p>
                {investment.notes && <p><strong>Notes:</strong> {investment.notes}</p>}
                {investment.screenshotUrl && (
                  <div className="screenshot-preview">
                    <img src={investment.screenshotUrl} alt="Payment Screenshot" />
                  </div>
                )}
              </div>

              <div className="investment-actions">
                <button 
                  className="approve-btn"
                  onClick={() => setSelectedInvestment(investment)}
                >
                  Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedInvestment && (
        <div className="review-modal">
          <div className="review-modal-content">
            <h3>Review Investment</h3>
            <div className="review-details">
              <p><strong>Plan:</strong> {selectedInvestment.planName}</p>
              <p><strong>Amount:</strong> ${selectedInvestment.amount}</p>
              <p><strong>Investor:</strong> {selectedInvestment.user.firstName} {selectedInvestment.user.lastName}</p>
            </div>
            
            <div className="admin-notes">
              <label>Admin Notes:</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this investment..."
              />
            </div>

            <div className="review-actions">
              <button 
                className="approve-btn"
                onClick={() => handleStatusUpdate('running')}
              >
                Approve Investment
              </button>
              <button 
                className="reject-btn"
                onClick={() => handleStatusUpdate('rejected')}
              >
                Reject Investment
              </button>
              <button 
                className="cancel-btn"
                onClick={() => {
                  setSelectedInvestment(null);
                  setAdminNotes('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 