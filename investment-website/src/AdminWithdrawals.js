import React, { useEffect, useState } from 'react';
import CircleLoader from './components/CircleLoader';
import './AdminDashboard.css';
import { FaRegCopy } from 'react-icons/fa';

const API_URL = 'https://investmentsite-q1sz.onrender.com/api';

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
      const res = await fetch(`${API_URL}/admin/pending-withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server error: Invalid response (not JSON)');
      }
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
      const res = await fetch(`${API_URL}/admin/withdrawal/verify`, {
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
                <div className="investment-card" key={txn.id} style={{ marginBottom: 24, padding: 18, borderRadius: 14, background: '#f8fafc', boxShadow: '0 2px 8px rgba(30,41,59,0.06)' }}>
                  <div className="investment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: '#22c55e', fontWeight: 800 }}>₹{txn.amount}</h3>
                    <span className="amount" style={{ color: '#f59e42', fontWeight: 700 }}>Pending</span>
                  </div>
                  <div className="investment-details" style={{ fontSize: '1.01rem', margin: '0.7rem 0' }}>
                    <div><strong>User:</strong> {txn.user?.email || txn.userId}</div>
                    <div><strong>Reference:</strong> {txn.gatewayTxnId || txn.id}</div>
                    <div><strong>Date:</strong> {new Date(txn.createdAt).toLocaleString()}</div>
                    <div><strong>Bank Name:</strong> {txn.bankName || '-'}</div>
                    <div><strong>Account Holder:</strong> {txn.accountHolder || '-'}</div>
                    <div><strong>Account Number:</strong> {txn.accountNumber || '-'}{' '}
                      {txn.accountNumber && (
                        <button
                          title="Copy Account Number"
                          style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                          onClick={() => handleCopy(txn.accountNumber)}
                        >
                          <FaRegCopy />
                        </button>
                      )}
                    </div>
                    <div><strong>IFSC:</strong> {txn.ifsc || '-'}{' '}
                      {txn.ifsc && (
                        <button
                          title="Copy IFSC Code"
                          style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                          onClick={() => handleCopy(txn.ifsc)}
                        >
                          <FaRegCopy />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="investment-actions" style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                    <button className="approve-btn" disabled={actionLoading} onClick={() => window.confirm('Approve this withdrawal?') && handleAction(txn.id, 'approve')} style={{ background: '#22c55e', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', cursor: 'pointer' }}>
                      {actionLoading === txn.id + 'approve' ? <CircleLoader /> : 'Approve'}
                    </button>
                    <button className="reject-btn" disabled={actionLoading} onClick={() => window.confirm('Reject this withdrawal?') && handleAction(txn.id, 'reject')} style={{ background: '#ef4444', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', cursor: 'pointer' }}>
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