import './App.css';
import { useRef, useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import LoginRegister from './LoginRegister';
import InvestmentPlans from './InvestmentPlans';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import ProtectedRoute from './ProtectedRoute';
import BottomNav from './BottomNav';

function Spinner() {
  return <div className="global-spinner">Loading...</div>;
}

const API_URL = 'https://investmentsite-q1sz.onrender.com/api/auth';

export default function MainApp() {
  const plansSectionRef = useRef(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loadingUser, setLoadingUser] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
          localStorage.removeItem('token');
          setToken(null);
          setGlobalError('Session expired. Please log in again.');
        }
      } catch {
        setUser(null);
        localStorage.removeItem('token');
        setToken(null);
        setGlobalError('Network error. Please log in again.');
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setToken(null);
    setDropdownOpen(false);
  };

  const handleDropdown = () => setDropdownOpen((open) => !open);
  const closeDropdown = () => setDropdownOpen(false);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e) => {
      if (!e.target.closest('.user-dropdown') && !e.target.closest('.user-avatar')) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [dropdownOpen]);

  const handleHamburger = () => setMobileMenuOpen(open => !open);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (loadingUser) return <Spinner />;

  return (
    <>
      {globalError && <div className="global-error">{globalError}</div>}
      {!user && (
        <div className="modal-overlay">
          <div className="modal-center">
            <LoginRegister user={user} setUser={setUser} setToken={setToken} />
          </div>
        </div>
      )}
      <div className={user ? '' : 'blurred'}>
        <nav className="navbar">
          <div className="logo">Astral</div>
          <ul className={`nav-links${mobileMenuOpen ? ' open' : ''}`}>
            <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
            <li><Link to="/plans" onClick={closeMobileMenu}>Investment Plans</Link></li>
            <li><Link to="/dashboard" onClick={closeMobileMenu}>Dashboard</Link></li>
            <li><Link to="/admin" onClick={closeMobileMenu}>Admin</Link></li>
          </ul>
          <div className="navbar-right">
            <div className="navbar-auth">
              {user ? (
                <div className="user-avatar-wrapper">
                  <button className="user-avatar" onClick={handleDropdown} aria-label="User menu">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="16" fill="#6ee7b7" />
                      <circle cx="16" cy="13" r="6" fill="#232526" />
                      <ellipse cx="16" cy="24.5" rx="8" ry="4.5" fill="#232526" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="user-dropdown">
                      <button onClick={handleLogout}>Logout</button>
                      <button onClick={() => {closeDropdown(); alert('Edit Profile coming soon!')}}>Edit Profile</button>
                      <button onClick={() => {closeDropdown(); alert('Help coming soon!')}}>Help</button>
                      <button onClick={() => {closeDropdown(); alert('Ticket system coming soon!')}}>Ticket</button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <button className="hamburger" onClick={handleHamburger} aria-label="Open menu">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={
            <main className="hero-section">
              <div className="hero-content">
                <h1>
                  Invest Smarter, <span className="green">Grow Faster</span>
                </h1>
                <p className="subtitle">
                  Join thousands of investors who trust our platform for secure, profitable, and hassle-free investment opportunities.
                </p>
                <button className="get-started" onClick={() => navigate('/plans')}>Get Started</button>
                <div className="stats">
                  <div className="stat">
                    <span className="stat-value">15%+</span>
                    <span className="stat-label">Average Returns</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">100%</span>
                    <span className="stat-label">Secure Platform</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">24/7</span>
                    <span className="stat-label">Support</span>
                  </div>
                </div>
              </div>
              <div className="plans-card">
                <h2>Explore Our Investment Plans</h2>
                <p>Find the perfect plan for your goals and start investing with ease.</p>
                <button className="view-plans" onClick={() => navigate('/plans')}>View Plans</button>
              </div>
            </main>
          } />
          <Route path="/plans" element={<InvestmentPlans user={user} token={token} />} />
          <Route path="/dashboard" element={<Dashboard user={user} token={token} />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute user={user}>
                <AdminDashboard token={token} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      <BottomNav />
    </>
  );
} 