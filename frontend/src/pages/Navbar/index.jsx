import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css'; 
const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-title">My Dashboard</h1>
      <div className="navbar-links">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;