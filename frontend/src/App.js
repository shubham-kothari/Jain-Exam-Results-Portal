import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CertificatePage from './pages/CertificatePage';
import AdminPage from './pages/AdminPage';
import MeritListPage from './pages/MeritListPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
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
