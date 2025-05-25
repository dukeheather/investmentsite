import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeamPage.css';
import { FaUsers, FaUserPlus, FaUserMinus, FaCrown, FaStar } from 'react-icons/fa';
import CircleLoader from './components/CircleLoader';

const API_URL = 'https://investmentsite-q1sz.onrender.com/api';

const TeamPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/teams/my-teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch teams');
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/teams`, newTeam, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams([...teams, response.data]);
      setShowCreateModal(false);
      setNewTeam({ name: '', description: '' });
    } catch (err) {
      setError('Failed to create team');
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/teams/${selectedTeam.id}/invite`, 
        { email: inviteEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowInviteModal(false);
      setInviteEmail('');
      fetchTeams(); // Refresh teams to show new member
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to invite user');
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/teams/${teamId}/leave`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(teams.filter(team => team.id !== teamId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave team');
    }
  };

  if (loading) return <CircleLoader />;

  return (
    <div className="team-page">
      <div className="team-header">
        <h2><FaUsers /> My Teams</h2>
        <button className="create-team-btn" onClick={() => setShowCreateModal(true)}>
          Create New Team
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="teams-grid">
        {teams.map(team => (
          <div key={team.id} className="team-card">
            <div className="team-card-header">
              <h3>{team.name}</h3>
              {team.members.find(m => m.userId === team.creatorId)?.role === 'admin' && (
                <button 
                  className="invite-btn"
                  onClick={() => {
                    setSelectedTeam(team);
                    setShowInviteModal(true);
                  }}
                >
                  <FaUserPlus /> Invite
                </button>
              )}
            </div>
            <p className="team-description">{team.description}</p>
            
            <div className="team-members">
              <h4>Members</h4>
              {team.members.map(member => (
                <div key={member.id} className="team-member">
                  <div className="member-info">
                    <span className="member-email">{member.user.email}</span>
                    {member.role === 'admin' && <FaCrown className="admin-icon" />}
                  </div>
                  <div className="member-stats">
                    <div className="stat">
                      <FaStar className="stat-icon" />
                      <span>Level {member.level}</span>
                    </div>
                    <div className="stat">
                      <span>{member.points} points</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="leave-team-btn"
              onClick={() => handleLeaveTeam(team.id)}
            >
              <FaUserMinus /> Leave Team
            </button>
          </div>
        ))}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Team</h3>
            <form onSubmit={handleCreateTeam}>
              <input
                type="text"
                placeholder="Team Name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Team Description"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              />
              <div className="modal-buttons">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Invite User to Team</h3>
            <form onSubmit={handleInviteUser}>
              <input
                type="email"
                placeholder="User's Email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Invite</button>
                <button type="button" onClick={() => setShowInviteModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage; 