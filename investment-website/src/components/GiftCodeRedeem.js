import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaGift } from 'react-icons/fa';

const GiftCodeRedeem = ({ onBalanceUpdate }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('/api/gift-codes/redeem', { code });
      
      if (response.data.success) {
        toast.success('Gift code redeemed successfully!');
        setCode('');
        if (onBalanceUpdate) {
          onBalanceUpdate(response.data.newBalance);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to redeem gift code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-menu-card">
      <h2 className="text-xl font-semibold mb-4" style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaGift /> Redeem Gift Code
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="profile-input"
            placeholder="Enter your gift code"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="profile-menu-item"
          style={{ marginTop: '1rem' }}
        >
          {isLoading ? 'Redeeming...' : 'Redeem Code'}
        </button>
      </form>
    </div>
  );
};

export default GiftCodeRedeem; 