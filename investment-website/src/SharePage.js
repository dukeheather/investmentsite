import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SharePage.css';

const SharePage = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referrals, setReferrals] = useState([]);
  const [referralLevel, setReferralLevel] = useState(1);
  const [referralPoints, setReferralPoints] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/referrals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReferralCode(response.data.referralCode);
        setReferralEarnings(response.data.referralEarnings);
        setReferrals(response.data.referrals);
        setReferralLevel(response.data.referralLevel || 1);
        setReferralPoints(response.data.referralPoints || 0);
      } catch (error) {
        console.error('Error fetching referral data:', error);
      }
    };

    fetchReferralData();
  }, []);

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  // Level info
  const levelInfo = [
    { level: 1, min: 0, max: 4, rate: 3 },
    { level: 2, min: 5, max: 19, rate: 5 },
    { level: 3, min: 20, max: Infinity, rate: 10 },
  ];
  const currentLevel = levelInfo.find(l => referralLevel === l.level) || levelInfo[0];
  const nextLevel = levelInfo.find(l => l.level === referralLevel + 1);
  const pointsToNext = nextLevel ? nextLevel.min - referralPoints : null;
  let progress = 1;
  if (nextLevel) {
    progress = (referralPoints - currentLevel.min) / (nextLevel.min - currentLevel.min);
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
  }

  return (
    <div className="share-page">
      <div className="share-header">
        <h2>Share & Earn</h2>
        <p>Invite friends and earn 2-3% commission on their recharges!</p>
      </div>

      <div className="referral-stats">
        <div className="stat-card">
          <h3>Level</h3>
          <p className="amount">{currentLevel.level}</p>
          <div style={{ fontSize: '0.98rem', color: '#888', marginTop: 4 }}>
            {currentLevel.rate}% commission
          </div>
        </div>
        <div className="stat-card">
          <h3>Points</h3>
          <p className="amount">{referralPoints}</p>
          <div style={{ fontSize: '0.98rem', color: '#888', marginTop: 4 }}>
            {nextLevel ? `${pointsToNext} to Level ${nextLevel.level}` : 'Max Level'}
          </div>
          <div className="level-progress-bar-wrapper">
            <div className="level-progress-bar-bg">
              <div className="level-progress-bar-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="level-progress-bar-label">
              {nextLevel ? `${Math.round(progress * 100)}% to next level` : 'Max Level'}
            </div>
          </div>
        </div>
      </div>
      <div className="referral-stats">
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p className="amount">₹{referralEarnings.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Referrals</h3>
          <p className="amount">{referrals.length}</p>
        </div>
      </div>

      <div className="referral-code-section">
        <h3>Your Referral Code</h3>
        <div className="referral-code-box">
          <span>{referralCode}</span>
          <button onClick={copyReferralLink}>Copy Link</button>
        </div>
      </div>

      <div className="referral-list">
        <h3>Your Referrals</h3>
        {referrals.length > 0 ? (
          <div className="referral-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Commission</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td>{referral.referredUser}</td>
                    <td>{referral.status}</td>
                    <td>₹{referral.commission.toFixed(2)}</td>
                    <td>{new Date(referral.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-referrals">No referrals yet. Share your code to start earning!</p>
        )}
      </div>
    </div>
  );
};

export default SharePage; 