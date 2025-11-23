import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Recommendations from './pages/Recommendations';
import Tracker from './pages/Tracker';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/tracker" element={<Tracker />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

