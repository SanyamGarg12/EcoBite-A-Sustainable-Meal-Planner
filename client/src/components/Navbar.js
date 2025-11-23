import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
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
          <li>
            <Link to="/tracker" className={`nav-link ${isActive('/tracker')}`}>
              Tracker
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

