import React from 'react';
import { FaHeadset, FaEnvelope, FaPhoneAlt, FaComments } from 'react-icons/fa';
import './App.css';

export default function ServicePage() {
  return (
    <div className="service-page-container">
      <div className="service-header">
        <FaHeadset className="service-header-icon" />
        <span>Customer Service & Support</span>
      </div>
      <div className="service-card">
        <div className="service-info">
          <p>Need help or have questions? Our support team is here for you 24/7.</p>
          <ul className="service-contact-list">
            <li><FaEnvelope className="service-icon" /> Email: <a href="mailto:support@astralinvest.com">support@astralinvest.com</a></li>
            <li><FaPhoneAlt className="service-icon" /> Phone: <a href="tel:+18001234567">+1 800 123 4567</a></li>
            <li><FaComments className="service-icon" /> Live Chat: <span className="service-coming-soon">(Coming Soon)</span></li>
          </ul>
        </div>
        <button className="service-contact-btn" onClick={() => window.location.href = 'mailto:support@astralinvest.com'}>
          Contact Support
        </button>
      </div>
    </div>
  );
} 