import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          EcoBite
        </Link>
        <ul className="nav-menu">
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/calculator" className={`nav-link ${isActive('/calculator')}`}>
              Calculator
            </Link>
          </li>
          <li>
            <Link to="/recommendations" className={`nav-link ${isActive('/recommendations')}`}>
              Recommendations
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link to="/tracker" className={`nav-link ${isActive('/tracker')}`}>
                  Tracker
                </Link>
              </li>
              <li>
                <Link to="/insights" className={`nav-link ${isActive('/insights')}`}>
                  Insights
                </Link>
              </li>
            </>
          )}
          {isAuthenticated ? (
            <li className="nav-user">
              <span className="nav-username">{user?.username}</span>
              <button onClick={handleLogout} className="nav-logout">
                Logout
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

