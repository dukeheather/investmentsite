import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import { CircleLoader } from './components/CircleLoader';

const API_URL = process.env.REACT_APP_API_URL || 'https://investmentsite-q1sz.onrender.com';

export default function TeamPage({ user, token }) {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('lv.1');
  const [teamName, setTeamName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  const fetchTeam = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.team) {
        setTeam(data.team);
        setMembers(data.members);
        setTotalPoints(data.totalPoints);
        setTotalIncome(data.totalIncome);
      } else {
        setTeam(null);
        setMembers([]);
      }
    } catch (e) {
      setError('Failed to load team info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTeam();
    // eslint-disable-next-line
  }, [token]);

  const handleCreate = async () => {
    if (!teamName) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/team/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: teamName }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else fetchTeam();
    } catch {
      setError('Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinId) return;
    setJoining(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/team/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teamId: Number(joinId) }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else fetchTeam();
    } catch {
      setError('Failed to join team');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/team/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else fetchTeam();
    } catch {
      setError('Failed to leave team');
    } finally {
      setLeaving(false);
    }
  };

  // Tabs for levels
  const levels = ['lv.1', 'lv.2', 'lv.3'];
  const levelMap = { 'lv.1': 1, 'lv.2': 2, 'lv.3': 3 };
  const filteredMembers = team ? members.filter(m => m.level === levelMap[tab]) : [];

  return (
    <div className="profile-container" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)' }}>
      <div className="profile-header" style={{ background: '#a855f7', color: '#fff', marginTop: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Team</div>
        {loading ? <CircleLoader /> : team ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{team.name} <span style={{ fontSize: 13, color: '#ede9fe' }}>(ID: {team.id})</span></div>
            <div style={{ margin: '10px 0', display: 'flex', gap: 24, justifyContent: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{totalPoints}</div>
                <div style={{ fontSize: 13, color: '#ede9fe' }}>Team Points</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>₹{totalIncome.toFixed(2)}</div>
                <div style={{ fontSize: 13, color: '#ede9fe' }}>Team Income</div>
              </div>
            </div>
            <button className="profile-menu-item logout" style={{ marginTop: 10, background: '#ede9fe', color: '#a855f7', fontWeight: 700 }} onClick={handleLeave} disabled={leaving}>{leaving ? 'Leaving...' : 'Leave Team'}</button>
          </>
        ) : (
          <>
            <div style={{ margin: '10px 0' }}>
              <input className="profile-input" style={{ marginBottom: 8 }} placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} disabled={creating} />
              <button className="profile-menu-item" style={{ background: '#a855f7', color: '#fff', fontWeight: 700, marginBottom: 12 }} onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create Team'}</button>
              <div style={{ margin: '10px 0', color: '#a855f7', fontWeight: 600 }}>OR</div>
              <input className="profile-input" style={{ marginBottom: 8 }} placeholder="Enter Team ID to Join" value={joinId} onChange={e => setJoinId(e.target.value)} disabled={joining} />
              <button className="profile-menu-item" style={{ background: '#a855f7', color: '#fff', fontWeight: 700 }} onClick={handleJoin} disabled={joining}>{joining ? 'Joining...' : 'Join Team'}</button>
            </div>
          </>
        )}
        {error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
      </div>
      {team && (
        <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(168,85,247,0.08)', marginTop: 24, padding: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1.5px solid #ede9fe' }}>
            {levels.map(l => (
              <div key={l} onClick={() => setTab(l)} style={{ flex: 1, textAlign: 'center', padding: '1rem 0', fontWeight: 700, color: tab === l ? '#a855f7' : '#a3a3a3', borderBottom: tab === l ? '3px solid #a855f7' : 'none', cursor: 'pointer', background: tab === l ? '#ede9fe' : 'transparent' }}>{l}</div>
            ))}
          </div>
          <div style={{ padding: 16 }}>
            {filteredMembers.length === 0 ? (
              <div style={{ color: '#a3a3a3', textAlign: 'center', padding: '2rem 0' }}>No members in this level.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3e8ff' }}>
                    <th style={{ padding: 8, color: '#a855f7', fontWeight: 700 }}>Member</th>
                    <th style={{ padding: 8, color: '#a855f7', fontWeight: 700 }}>Level</th>
                    <th style={{ padding: 8, color: '#a855f7', fontWeight: 700 }}>Points</th>
                    <th style={{ padding: 8, color: '#a855f7', fontWeight: 700 }}>Income</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(m => (
                    <tr key={m.userId} style={{ borderBottom: '1px solid #ede9fe' }}>
                      <td style={{ padding: 8 }}>{m.user?.email || m.user?.phone || m.userId}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>{m.level}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>{m.points}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>₹{(m.user?.income || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 