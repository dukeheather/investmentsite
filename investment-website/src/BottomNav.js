import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';
import { House, CalendarBlank, SquaresFour, ShareNetwork, User } from 'phosphor-react';

const navItems = [
  {
    label: 'Home',
    path: '/',
    icon: (active) => <House size={32} weight={active ? 'fill' : 'regular'} color={active ? '#22c55e' : '#22c55e'} style={active ? { background: 'linear-gradient(90deg, #e0f7ef 60%, #4ade80 100%)', borderRadius: 12, padding: 4 } : {}} />,
  },
  {
    label: 'Plans',
    path: '/plans',
    icon: (active) => <CalendarBlank size={32} weight={active ? 'fill' : 'regular'} color={active ? '#2563eb' : '#2563eb'} style={active ? { background: 'linear-gradient(90deg, #e0f2fe 60%, #2563eb 100%)', borderRadius: 12, padding: 4 } : {}} />,
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (active) => <SquaresFour size={32} weight={active ? 'fill' : 'regular'} color={active ? '#22c55e' : '#22c55e'} style={active ? { background: 'linear-gradient(90deg, #e0f7ef 60%, #4ade80 100%)', borderRadius: 12, padding: 4 } : {}} />,
  },
  {
    label: 'Share',
    path: '/share',
    icon: (active) => <ShareNetwork size={32} weight={active ? 'fill' : 'regular'} color={active ? '#38bdf8' : '#38bdf8'} style={active ? { background: 'linear-gradient(90deg, #e0f2fe 60%, #38bdf8 100%)', borderRadius: 12, padding: 4 } : {}} />,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: (active) => <User size={32} weight={active ? 'fill' : 'regular'} color={active ? '#f59e42' : '#f59e42'} style={active ? { background: 'linear-gradient(90deg, #fef9c3 60%, #f59e42 100%)', borderRadius: 12, padding: 4 } : {}} />,
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            className={`bottom-nav-btn${active ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="bottom-nav-icon">{item.icon(active)}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
} 