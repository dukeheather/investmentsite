import React, { useEffect, useState } from 'react';
import './InvestmentPlans.css';
import './App.css';
import { FaWallet, FaRupeeSign } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function WithdrawPage({ token }) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [hasActivePlans, setHasActivePlans] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceRes = await fetch('/api/wallet/balance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const balanceData = await balanceRes.json();
        setBalance(Number(balanceData.balance) || 0);

        // Fetch active plans
        const plansRes = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const plansData = await plansRes.json();
        setHasActivePlans(plansData.activePlans && plansData.activePlans.length > 0);
      } catch {
        setBalance(0);
        setHasActivePlans(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');
    
    if (!hasActivePlans) {
      setError('You must purchase a plan before making your first withdrawal');
      setSubmitting(false);
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) < 180) {
      setError('Minimum withdrawal amount is ₹180');
      setSubmitting(false);
      return;
    }
    if (Number(amount) > balance) {
      setError('Amount exceeds wallet balance');
      setSubmitting(false);
      return;
    }
    if (!bankName || !accountHolder || !accountNumber || !ifsc) {
      setError('Please fill in all bank details');
      setSubmitting(false);
      return;
    }
    
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, bankName, accountHolder, accountNumber, ifsc }),
      });
      
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server error: Invalid response');
      }
      
      if (!res.ok) throw new Error(data.error || 'Failed to submit withdrawal');
      
      setSuccess('Withdrawal request submitted! Your request will be reviewed and approved by an admin.');
      setAmount('');
      setBankName('');
      setAccountHolder('');
      setAccountNumber('');
      setIfsc('');
    } catch (err) {
      setError(err.message || 'Failed to submit withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7fafc 0%, #e0f7ef 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '2.5vw 0 0 0' }}>
      <div style={{ maxWidth: 420, width: '95vw', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(34,197,94,0.10)', padding: '2rem 1.2rem 1.5rem 1.2rem', margin: '0 auto', marginTop: 18 }}>
        <h1 style={{ color: '#22c55e', fontWeight: 800, fontSize: '1.5rem', marginBottom: 18, letterSpacing: '0.01em', textAlign: 'center' }}>Withdraw Funds</h1>
        {!hasActivePlans && (
          <div style={{ 
            marginBottom: 16, 
            padding: '1rem', 
            background: '#fff3cd', 
            border: '1px solid #ffeeba', 
            borderRadius: 8,
            color: '#856404',
            textAlign: 'center'
          }}>
            You need to purchase a plan before making your first withdrawal.
            <button 
              onClick={() => navigate('/plans')}
              style={{
                display: 'block',
                margin: '1rem auto 0',
                padding: '0.5rem 1rem',
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              View Investment Plans
            </button>
          </div>
        )}
        <div style={{ width: '100%', marginBottom: 18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '1.08rem', color: '#64748b', marginBottom: 4 }}>Wallet Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaWallet style={{ marginRight: 8 }} /> <FaRupeeSign style={{ marginRight: 4 }} />{balance.toFixed(2)}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>Amount to Withdraw</label>
            <input
              name="amount"
              type="number"
              min={180}
              max={balance}
              value={amount}
              onChange={e => {
                let val = e.target.value;
                if (Number(val) > balance) val = balance;
                setAmount(val);
              }}
              required
              autoComplete="off"
              placeholder="Enter amount (min ₹180)"
              style={{
                padding: '1rem',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f9fafb',
                color: '#222',
                fontSize: '1.08rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 2,
                boxShadow: '0 1px 4px rgba(34,197,94,0.04)'
              }}
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>Bank Name</label>
            <input
              name="bankName"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              required
              autoComplete="off"
              placeholder="Enter your bank name"
              style={{
                padding: '1rem',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f9fafb',
                color: '#222',
                fontSize: '1.08rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 2,
                boxShadow: '0 1px 4px rgba(34,197,94,0.04)'
              }}
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>Account Holder Name</label>
            <input
              name="accountHolder"
              value={accountHolder}
              onChange={e => setAccountHolder(e.target.value)}
              required
              autoComplete="off"
              placeholder="Enter account holder name"
              style={{
                padding: '1rem',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f9fafb',
                color: '#222',
                fontSize: '1.08rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 2,
                boxShadow: '0 1px 4px rgba(34,197,94,0.04)'
              }}
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>Bank Account Number</label>
            <input
              name="accountNumber"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              required
              autoComplete="off"
              placeholder="Enter bank account number"
              style={{
                padding: '1rem',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f9fafb',
                color: '#222',
                fontSize: '1.08rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 2,
                boxShadow: '0 1px 4px rgba(34,197,94,0.04)'
              }}
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#2563eb', fontWeight: 700, marginBottom: 6, display: 'block', fontSize: '1.05rem' }}>IFSC Code</label>
            <input
              name="ifsc"
              value={ifsc}
              onChange={e => setIfsc(e.target.value)}
              required
              autoComplete="off"
              placeholder="Enter IFSC code"
              style={{
                padding: '1rem',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f9fafb',
                color: '#222',
                fontSize: '1.08rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 2,
                boxShadow: '0 1px 4px rgba(34,197,94,0.04)'
              }}
            />
          </div>
          
          <div style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: 16, textAlign: 'center' }}>
            Withdrawals are reviewed and approved by an admin. You will be notified once your request is processed.
          </div>
          
          {success && <div className="status-message success" style={{ marginBottom: 14, color: '#22c55e', background: '#e7fbe9', borderRadius: 8, padding: '0.7rem 1rem', fontWeight: 600, fontSize: '1.05rem', textAlign: 'center' }}>{success}</div>}
          {error && <div className="status-message error" style={{ marginBottom: 14, color: '#ef4444', background: '#fbe7e7', borderRadius: 8, padding: '0.7rem 1rem', fontWeight: 600, fontSize: '1.05rem', textAlign: 'center' }}>{error}</div>}
          
          <button type="submit" className="withdraw-btn" style={{
            background: 'linear-gradient(90deg, #22c55e 60%, #4ade80 100%)',
            color: '#fff',
            fontSize: '1.13rem',
            fontWeight: 800,
            border: 'none',
            borderRadius: 12,
            padding: '1.1rem 0',
            marginTop: 8,
            boxShadow: '0 2px 8px rgba(34,197,94,0.10)',
            transition: 'background 0.18s, transform 0.18s',
            letterSpacing: '0.01em',
            display: 'block',
            width: '100%',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }} disabled={submitting}>{submitting ? 'Submitting...' : 'Withdraw'}</button>
        </form>
      </div>
    </div>
  );
} 