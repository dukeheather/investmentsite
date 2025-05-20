import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './InvestmentPlans.css';
import CircleLoader from './components/CircleLoader';

export default function ManualPaymentPage({ token }) {
  const location = useLocation();
  const amount = location.state?.amount || '';
  const [reference, setReference] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = e => {
    setScreenshot(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');
    if (!amount || !reference || !screenshot) {
      setError('All fields are required.');
      setSubmitting(false);
      return;
    }
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('reference', reference);
    formData.append('screenshot', screenshot);
    try {
      const res = await fetch('/api/wallet/manual-topup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit payment');
      setSuccess('Payment submitted! Awaiting admin verification.');
      setReference('');
      setScreenshot(null);
    } catch (err) {
      setError(err.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="plans-page">
      <h1>Manual Wallet Recharge</h1>
      <div className="wallet-balance-display" style={{ marginBottom: '2.5rem' }}>
        <b>Instructions:</b><br />
        Please pay <span style={{color:'#4ade80',fontWeight:600}}>₹{amount}</span> to the following UPI ID:<br />
        <span style={{fontWeight:600}}>your-upi@bank</span><br />
        or scan the QR code below.<br />
        <img src="/your-qr-code.png" alt="UPI QR" style={{margin:'1rem auto',maxWidth:180,display:'block',borderRadius:12}} />
        After payment, upload a screenshot and enter the transaction/reference number below.
      </div>
      <form className="buy-modal" style={{ maxWidth: 400, margin: '0 auto' }} onSubmit={handleSubmit}>
        <label>Reference/UTR Number</label>
        <input
          name="reference"
          value={reference}
          onChange={e => setReference(e.target.value)}
          required
          autoComplete="off"
          placeholder="Enter transaction/UTR/reference number"
        />
        <label>Payment Screenshot</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        {screenshot && <img src={URL.createObjectURL(screenshot)} alt="Preview" style={{maxWidth:180,margin:'0.5rem auto',display:'block',borderRadius:8}} />}
        {success && <div className="status-message success">{success}</div>}
        {error && <div className="status-message error">{error}</div>}
        <button className="buy-btn" type="submit" disabled={submitting}>{submitting ? <CircleLoader /> : 'Submit for Verification'}</button>
      </form>
    </div>
  );
} 