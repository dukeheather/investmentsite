import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import { CircleLoader } from './components/CircleLoader';
import { FaUsers, FaPlusCircle, FaSignInAlt, FaExclamationCircle } from 'react-icons/fa';

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(168,85,247,0.13)',
        padding: '2.2rem 1.5rem 2rem 1.5rem',
        marginTop: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <FaUsers size={32} color="#a855f7" />
          <span style={{ fontWeight: 900, fontSize: 26, color: '#a855f7', letterSpacing: 0.5 }}>Team</span>
        </div>
        {loading ? <CircleLoader /> : team ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#232526', marginBottom: 8 }}>{team.name} <span style={{ fontSize: 13, color: '#a3a3a3' }}>(ID: {team.id})</span></div>
            <div style={{ margin: '10px 0 18px 0', display: 'flex', gap: 32, justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: '#22c55e' }}>{totalPoints}</div>
                <div style={{ fontSize: 13, color: '#a3a3a3' }}>Team Points</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: '#2563eb' }}>₹{totalIncome.toFixed(2)}</div>
                <div style={{ fontSize: 13, color: '#a3a3a3' }}>Team Income</div>
              </div>
            </div>
            <button className="profile-menu-item logout" style={{ marginTop: 10, background: '#ede9fe', color: '#a855f7', fontWeight: 700, border: 'none', borderRadius: 10, padding: '0.8rem 0', width: '100%', fontSize: 16, boxShadow: '0 2px 8px rgba(168,85,247,0.08)' }} onClick={handleLeave} disabled={leaving}>{leaving ? 'Leaving...' : 'Leave Team'}</button>
          </>
        ) : (
          <>
            <div style={{ width: '100%', marginBottom: 18 }}>
              <div style={{ fontWeight: 700, color: '#a855f7', fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><FaPlusCircle /> Create Team</div>
              <input className="profile-input" style={{ marginBottom: 12, width: '100%', fontSize: 16, border: '1.5px solid #a855f7', borderRadius: 10, padding: '0.9rem 1rem', background: '#f8f7fa', color: '#232526', fontWeight: 600 }} placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} disabled={creating} />
              <button className="profile-menu-item" style={{ background: '#a855f7', color: '#fff', fontWeight: 700, marginBottom: 18, border: 'none', borderRadius: 10, padding: '0.9rem 0', width: '100%', fontSize: 16, boxShadow: '0 2px 8px rgba(168,85,247,0.08)' }} onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : (<><FaPlusCircle style={{ marginRight: 8 }} />Create Team</>)}</button>
            </div>
            <div style={{ width: '100%', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><FaSignInAlt /> Join Team</div>
              <input className="profile-input" style={{ marginBottom: 12, width: '100%', fontSize: 16, border: '1.5px solid #2563eb', borderRadius: 10, padding: '0.9rem 1rem', background: '#f8f7fa', color: '#232526', fontWeight: 600 }} placeholder="Enter Team ID to Join" value={joinId} onChange={e => setJoinId(e.target.value)} disabled={joining} />
              <button className="profile-menu-item" style={{ background: '#2563eb', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 10, padding: '0.9rem 0', width: '100%', fontSize: 16, boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }} onClick={handleJoin} disabled={joining}>{joining ? 'Joining...' : (<><FaSignInAlt style={{ marginRight: 8 }} />Join Team</>)}</button>
            </div>
          </>
        )}
        {error && (
          <div style={{ color: '#ef4444', marginTop: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, justifyContent: 'center' }}>
            <FaExclamationCircle /> {error}
          </div>
        )}
      </div>
      {team && (
        <div style={{ width: '100%', maxWidth: 420, margin: '32px auto 0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(168,85,247,0.08)', padding: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1.5px solid #ede9fe' }}>
            {levels.map(l => (
              <div key={l} onClick={() => setTab(l)} style={{ flex: 1, textAlign: 'center', padding: '1rem 0', fontWeight: 700, color: tab === l ? '#a855f7' : '#a3a3a3', borderBottom: tab === l ? '3px solid #a855f7' : 'none', cursor: 'pointer', background: tab === l ? '#ede9fe' : 'transparent', fontSize: 16 }}>{l}</div>
            ))}
          </div>
          <div style={{ padding: 16 }}>
            {filteredMembers.length === 0 ? (
              <div style={{ color: '#a3a3a3', textAlign: 'center', padding: '2rem 0', fontWeight: 600 }}>No members in this level.</div>
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