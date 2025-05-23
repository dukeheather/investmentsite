import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';
import { MdHomeFilled, MdEventNote, MdDashboard, MdPerson } from 'react-icons/md';

const navItems = [
  {
    label: 'Home',
    path: '/',
    icon: <MdHomeFilled size={28} />,
  },
  {
    label: 'Plans',
    path: '/plans',
    icon: <MdEventNote size={28} />,
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <MdDashboard size={28} />,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: <MdPerson size={28} />,
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`bottom-nav-btn${location.pathname === item.path ? ' active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
} 