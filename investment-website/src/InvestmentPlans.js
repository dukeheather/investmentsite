import React, { useState } from 'react';
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
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [investmentId, setInvestmentId] = useState(null);
  const navigate = useNavigate();

  const handleBuy = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
    setSuccess('');
    setSelectedFile(null);
    setInvestmentId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
    setSelectedFile(null);
    setInvestmentId(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSuccess('File size too large. Maximum size is 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setSuccess('Only image files are allowed.');
        return;
      }
      setSelectedFile(file);
      setSuccess('');
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setSuccess("");
    const form = e.target;
    const amount = form.amount.value;
    const transactionId = form.transactionId.value;
    const notes = form.notes.value;

    if (!selectedFile) {
      setSuccess("Payment screenshot is required.");
      return;
    }

    try {
      const amountNum = Number(amount);
      if (amountNum < selectedPlan.min || amountNum > selectedPlan.max) {
        setSuccess(`Amount must be between $${selectedPlan.min} and $${selectedPlan.max}.`);
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('planName', selectedPlan.name);
      formData.append('amount', amount);
      formData.append('transactionId', transactionId);
      formData.append('notes', notes);
      formData.append('screenshot', selectedFile);

      const purchaseRes = await fetch('/api/upload/purchase-with-screenshot', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!purchaseRes.ok) {
        let err;
        try {
          err = await purchaseRes.json();
        } catch {
          setSuccess('An error occurred. Please try again.');
          setUploading(false);
          return;
        }
        throw new Error(err.error || 'Failed to create investment');
      }

      const { message } = await purchaseRes.json();
      setSuccess(message);
      setTimeout(() => {
        setShowModal(false);
      }, 2000);
    } catch (error) {
      setSuccess(error.message || 'An error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="plans-page">
      <h1>Investment Plans</h1>
      <div className="plans-list">
        {plans.map(plan => (
          <div className="plan-card" key={plan.id}>
            <h2>{plan.name}</h2>
            <div>Minimum Investment: <b>${plan.min}</b></div>
            <div>Maximum Investment: <b>${plan.max}</b></div>
            <div>Expected Profit: <b>{plan.profit}</b></div>
            <div className="plan-outcome">{plan.outcome}</div>
            <button className="buy-btn" onClick={() => handleBuy(plan)}>Buy / Invest</button>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="buy-modal-overlay">
          <div className="buy-modal">
            <h2>Buy {selectedPlan.name}</h2>
            <div className="buy-modal-content">
              <div className="buy-modal-flex">
                <div className="upi-qr-section">
                  <div className="upi-id-label">
                    <b>UPI ID:</b> dexstroidmlbb@oksbi
                  </div>
                  <img
                    src="/upi-qr.jpeg"
                    alt="Scan to Pay UPI QR"
                    className="upi-qr-img"
                  />
                  <div className="upi-instructions">
                    Scan this QR code with any UPI app to pay.
                  </div>
                </div>
                <form onSubmit={handlePurchase}>
                  <p>Send payment to our account and enter your transaction details below. Upload a screenshot of your payment for verification.</p>
                  <div>
                    <label>Amount Sent ($):</label>
                    <input
                      name="amount"
                      type="number"
                      min={selectedPlan.min}
                      max={selectedPlan.max}
                      required
                      autoComplete="off"
                      placeholder={`Enter amount (${selectedPlan.min} - ${selectedPlan.max})`}
                    />
                    <div style={{ fontSize: '0.9em', color: '#aaa', marginTop: '2px' }}>
                      Allowed: ${selectedPlan.min} - ${selectedPlan.max}
                    </div>
                  </div>
                  <div>
                    <label>UTR ID:</label>
                    <input name="transactionId" type="number" required maxLength={12} inputMode="numeric" pattern="[0-9]{1,12}" placeholder="Enter 12-digit UTR ID" />
                  </div>
                  <div>
                    <label>Notes (optional):</label>
                    <input name="notes" type="text" />
                  </div>
                  <div className="file-upload-section">
                    <label>Payment Screenshot:</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileSelect}
                      disabled={uploading}
                      required
                    />
                    {selectedFile && (
                      <div className="file-info">
                        Selected: {selectedFile.name}
                      </div>
                    )}
                  </div>
                  {success && (
                    <div className={`status-message ${success.includes('error') ? 'error' : 'success'}`}>
                      {success}
                    </div>
                  )}
                  <div className="modal-buttons">
                    <button 
                      type="submit" 
                      className="buy-btn" 
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Submit for Verification'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn" 
                      onClick={closeModal}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 