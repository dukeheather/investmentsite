import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SharePage.css';

const SharePage = ({ token }) => {
  const [referralCode, setReferralCode] = useState('');
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referrals, setReferrals] = useState([]);
  const [referralLevel, setReferralLevel] = useState(1);
  const [referralPoints, setReferralPoints] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch referral code (reliable, like ProfilePage)
    const fetchReferralCode = async () => {
      try {
        const res = await fetch('https://investmentsite-q1sz.onrender.com/api/referral-code', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReferralCode(data.referralCode);
      } catch (error) {
        setReferralCode('');
      }
    };
    // Fetch referral stats (optional, for earnings/points/list)
    const fetchReferralStats = async () => {
      try {
        const res = await fetch('https://investmentsite-q1sz.onrender.com/api/referrals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReferralEarnings(data.referralEarnings);
        setReferrals(data.referrals);
        setReferralLevel(data.referralLevel || 1);
        setReferralPoints(data.referralPoints || 0);
      } catch (error) {
        // ignore
      }
    };
    if (token) {
      fetchReferralCode();
      fetchReferralStats();
    }
  }, [token]);

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  // Level info
  const levelInfo = [
    { level: 3, min: 0, max: 4, rate: 3 },
    { level: 2, min: 5, max: 19, rate: 5 },
    { level: 1, min: 20, max: Infinity, rate: 10 },
  ];
  // Always start at level 3 if points are 0 or less
  let effectiveLevel = referralLevel;
  if (referralPoints === 0) effectiveLevel = 3;
  const currentLevel = levelInfo.find(l => effectiveLevel === l.level) || levelInfo[0];
  const nextLevel = levelInfo.find(l => l.level === effectiveLevel - 1);
  const pointsToNext = nextLevel ? nextLevel.min - referralPoints : null;
  let progress = 0;
  let isMaxLevel = false;
  if (nextLevel) {
    progress = (referralPoints - currentLevel.min) / (nextLevel.min - currentLevel.min);
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
  } else if (effectiveLevel === 1 && referralPoints >= 20) {
    // Only max if at highest level and enough points
    progress = 1;
    isMaxLevel = true;
  }

  return (
    <div className="share-page">
      {/* Total Bonus Section (moved from ProfilePage) */}
      <div className="bonus-task-section" style={{
        background: '#f5f6fa',
        borderRadius: 18,
        boxShadow: '0 2px 12px rgba(34,197,94,0.06)',
        padding: '1.5rem 1.2rem',
        margin: '1.5rem 0',
        maxWidth: 420,
        width: '100%',
        textAlign: 'left',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="bonus" style={{ width: 36, height: 36 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#232526' }}>Total bonus</div>
            <div style={{ fontWeight: 900, fontSize: 28, color: '#22c55e', marginTop: 2 }}>₹0</div>
          </div>
        </div>
        <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 10, fontSize: 15 }}>
          <span role="img" aria-label="clock">⏰</span> Official limited-time event
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { req: 670, bonus: 18 },
            { req: 1280, bonus: 62 },
            { req: 2750, bonus: 176 },
            { req: 5200, bonus: 395 },
          ].map((task, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fff',
              borderRadius: 12,
              padding: '1rem 1.2rem',
              boxShadow: '0 1px 4px rgba(34,197,94,0.04)',
              marginBottom: 2,
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#232526', fontSize: 15 }}>Invite subordinates to purchase ₹{task.req} products</div>
                <div style={{ fontWeight: 800, color: '#22c55e', fontSize: 20, marginTop: 2 }}>₹{task.bonus}</div>
                <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 2 }}>Available: 0</div>
              </div>
              <button style={{
                background: '#a3a3a3',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.7rem 1.2rem',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                marginLeft: 12,
              }}>To Complete</button>
            </div>
          ))}
        </div>
      </div>
      {/* Referral Code Section (moved from ProfilePage) */}
      <div className="referral-section">
        <h3>Your Referral Code</h3>
        <div className="referral-code-display">
          <span>{referralCode ? referralCode : 'N/A'}</span>
          <button onClick={() => {
            if (referralCode) navigator.clipboard.writeText(referralCode);
          }} className="copy-btn">
            Copy
          </button>
        </div>
        <p className="referral-info">
          Share this code with friends! When they register using your code, you'll get ₹50 in your wallet.
        </p>
      </div>

      <div className="referral-stats">
        <div className="stat-card">
          <h3>Level</h3>
          <p className="amount">{currentLevel.level}</p>
          <div style={{ fontSize: '0.98rem', color: '#888', marginTop: 4 }}>
            {currentLevel.rate}% commission
          </div>
          <div style={{ fontSize: '0.93rem', color: '#22c55e', marginTop: 8 }}>
            {currentLevel.level === 3 && 'Start here!'}
            {currentLevel.level === 1 && 'Highest Level!'}
          </div>
        </div>
        <div className="stat-card">
          <h3>Points</h3>
          <p className="amount">{referralPoints}</p>
          <div style={{ fontSize: '0.98rem', color: '#888', marginTop: 4 }}>
            {isMaxLevel ? 'Max Level' : nextLevel ? `${pointsToNext} to Level ${nextLevel.level}` : ''}
          </div>
          <div className="level-progress-bar-wrapper" style={{ marginTop: 10 }}>
            <div className="level-progress-bar-bg">
              <div className="level-progress-bar-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="level-progress-bar-label">
              {isMaxLevel ? 'Max Level' : nextLevel ? `${Math.round(progress * 100)}% to next level` : ''}
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