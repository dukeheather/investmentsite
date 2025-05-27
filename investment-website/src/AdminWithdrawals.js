import React, { useEffect, useState } from 'react';
import CircleLoader from './components/CircleLoader';
import './AdminDashboard.css';
import { FaRegCopy } from 'react-icons/fa';

export default function AdminWithdrawals({ token }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pending-withdrawals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setPending(data.withdrawals || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('/api/admin/withdrawal/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setSuccess('Status updated!');
      fetchPending();
    } catch (err) {
      setError(err.message || 'Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Optionally, you can show a toast or alert here
  };

  return (
    <div className="admin-dashboard">
      <h1>Pending Withdrawals</h1>
      {loading ? <CircleLoader /> : error ? <div className="admin-error">{error}</div> : (
        <>
          {success && <div className="success-message">{success}</div>}
          {pending.length === 0 ? <div>No pending withdrawals.</div> : (
            <div className="pending-investments">
              {pending.map(txn => (
                <div className="investment-card" key={txn.id}>
                  <div className="investment-header">
                    <h3>₹{txn.amount}</h3>
                    <span className="amount">Pending</span>
                  </div>
                  <div className="investment-details">
                    <p><strong>User:</strong> {txn.user?.email || txn.userId}</p>
                    <p><strong>Reference:</strong> {txn.gatewayTxnId || txn.id}</p>
                    <p><strong>Date:</strong> {new Date(txn.createdAt).toLocaleString()}</p>
                    <p><strong>Bank Name:</strong> {txn.bankName || '-'}</p>
                    <p><strong>Account Holder:</strong> {txn.accountHolder || '-'}</p>
                    <p><strong>Account Number:</strong> {txn.accountNumber || '-'}
                      {txn.accountNumber && (
                        <button
                          title="Copy Account Number"
                          style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                          onClick={() => handleCopy(txn.accountNumber)}
                        >
                          <FaRegCopy />
                        </button>
                      )}
                    </p>
                    <p><strong>IFSC Code:</strong> {txn.ifsc || '-'}
                      {txn.ifsc && (
                        <button
                          title="Copy IFSC Code"
                          style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                          onClick={() => handleCopy(txn.ifsc)}
                        >
                          <FaRegCopy />
                        </button>
                      )}
                    </p>
                  </div>
                  <div className="investment-actions">
                    <button className="approve-btn" disabled={actionLoading} onClick={() => handleAction(txn.id, 'approve')}>
                      {actionLoading === txn.id + 'approve' ? <CircleLoader /> : 'Approve'}
                    </button>
                    <button className="reject-btn" disabled={actionLoading} onClick={() => handleAction(txn.id, 'reject')}>
                      {actionLoading === txn.id + 'reject' ? <CircleLoader /> : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 