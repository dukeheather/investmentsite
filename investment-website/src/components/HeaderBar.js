import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const PAGE_TITLES = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/plans': 'Investment Plans',
  '/profile': 'Profile',
  '/withdraw': 'Withdraw Funds',
  '/recharge': 'Recharge',
  '/manual-payment': 'Manual Payment',
  '/income-details': 'Income Details',
  '/withdrawal-details': 'Withdrawal Details',
  '/about-us': 'About Us',
  '/contact-us': 'Contact Us',
  '/admin': 'Admin',
  '/bank-info': 'Bank Information',
  // Add more routes and titles as needed
};

export default function HeaderBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const showBack = path !== '/';

  // Get title from map or fallback to capitalized path
  const title = PAGE_TITLES[path] || path.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <header className="header-bar">
      {showBack ? (
        <button className="header-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
      ) : (
        <span className="header-back-placeholder" />
      )}
      <span className="header-title">{title}</span>
      <span className="header-right-placeholder" />
    </header>
  );
} 