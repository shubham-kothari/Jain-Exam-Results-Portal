import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import CertificatePage from './pages/CertificatePage';
import AdminPage from './pages/AdminPage';
import MeritListPage from './pages/MeritListPage';
import './App.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>अखिल भारतीय सुधर्म जैन संस्कृति परीक्षा परिणाम (2025)</span>
      </div>
      <div className="navbar-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          परीक्षा परिणाम
        </NavLink>
        <NavLink 
          to="/meritlist" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          मेरिट लिस्ट
        </NavLink>
        <NavLink 
          to="/admin" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Admin
        </NavLink>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<CertificatePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/meritlist" element={<MeritListPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
