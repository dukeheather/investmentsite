import './App.css';
import { useRef, useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import LoginRegister from './LoginRegister';
import InvestmentPlans from './InvestmentPlans';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import ProtectedRoute from './ProtectedRoute';
import BottomNav from './BottomNav';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';

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
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  );
} 