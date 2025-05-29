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
      const res = await fetch('https://investmentsite-q1sz.onrender.com/api/wallet/manual-topup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server error: Invalid response');
      }
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
    <div className="manual-payment-page">
      <h1 className="manual-payment-title">Manual Wallet Recharge</h1>
      <div className="manual-payment-card">
        <div className="manual-payment-instructions">
          <b>Instructions:</b><br />
          <span style={{wordBreak: 'break-word'}}>Please pay <span style={{color:'#4ade80',fontWeight:600}}>₹{amount}</span> to the following UPI ID:<br />
          <span style={{fontWeight:600}}>your-upi@bank</span></span><br />
          <span style={{display:'block',margin:'0.7rem 0 0.2rem 0'}}>or scan the QR code below:</span>
          <div className="manual-payment-qr-wrapper">
            <img src="/static/upi-qr.jpg" alt="UPI QR Code for Payment" className="manual-payment-qr" />
          </div>
          <span style={{fontSize:'0.97rem',color:'#64748b',display:'block',marginTop:'0.5rem'}}>After payment, upload a screenshot and enter the transaction/reference number below.</span>
        </div>
        <form className="manual-payment-form" onSubmit={handleSubmit}>
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
          {screenshot && <img src={URL.createObjectURL(screenshot)} alt="Preview" className="manual-payment-preview" />}
          {success && <div className="status-message success">{success}</div>}
          {error && <div className="status-message error">{error}</div>}
          <button className="buy-btn" type="submit" disabled={submitting}>{submitting ? <CircleLoader /> : 'Submit for Verification'}</button>
        </form>
      </div>
    </div>
  );
} 