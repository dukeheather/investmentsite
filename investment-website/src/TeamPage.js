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
    <div className="team-page-bg">
      <div className="team-card-main">
        <div className="team-header-row">
          <FaUsers size={32} color="#a855f7" />
          <span className="team-title">Team</span>
        </div>
        {loading ? (
          <div style={{ width: '100%', textAlign: 'center', padding: '2rem 0' }}><CircleLoader /></div>
        ) : team ? (
          <>
            <div className="team-name-row">{team.name} <span className="team-id">(ID: {team.id})</span></div>
            <div className="team-stats-row">
              <div className="team-stat">
                <div className="team-stat-value">{totalPoints}</div>
                <div className="team-stat-label">Team Points</div>
              </div>
              <div className="team-stat">
                <div className="team-stat-value team-income">₹{totalIncome.toFixed(2)}</div>
                <div className="team-stat-label">Team Income</div>
              </div>
            </div>
            <button className="team-leave-btn" onClick={handleLeave} disabled={leaving}>{leaving ? 'Leaving...' : 'Leave Team'}</button>
          </>
        ) : (
          <>
            <div className="team-section">
              <div className="team-section-title"><FaPlusCircle /> Create Team</div>
              <input className="team-input" placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} disabled={creating} />
              <button className="team-create-btn" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : (<><FaPlusCircle style={{ marginRight: 8 }} />Create Team</>)}</button>
            </div>
            <div className="team-section">
              <div className="team-section-title join"><FaSignInAlt /> Join Team</div>
              <input className="team-input" placeholder="Enter Team ID to Join" value={joinId} onChange={e => setJoinId(e.target.value)} disabled={joining} />
              <button className="team-join-btn" onClick={handleJoin} disabled={joining}>{joining ? 'Joining...' : (<><FaSignInAlt style={{ marginRight: 8 }} />Join Team</>)}</button>
            </div>
          </>
        )}
        {error && (
          <div className="team-error"><FaExclamationCircle /> {error}</div>
        )}
      </div>
      <div className="team-members-card">
        <div className="team-tabs-row">
          {levels.map(l => (
            <div key={l} onClick={() => setTab(l)} className={`team-tab${tab === l ? ' active' : ''}`}>{l}</div>
          ))}
        </div>
        <div className="team-members-list">
          {filteredMembers.length === 0 ? (
            <div className="team-no-members">No members in this level.</div>
          ) : (
            <div className="team-table-wrapper">
              <table className="team-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Level</th>
                    <th>Points</th>
                    <th>Income</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(m => (
                    <tr key={m.userId}>
                      <td>{m.user?.email || m.user?.phone || m.userId}</td>
                      <td style={{ textAlign: 'center' }}>{m.level}</td>
                      <td style={{ textAlign: 'center' }}>{m.points}</td>
                      <td style={{ textAlign: 'center' }}>₹{(m.user?.income || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 