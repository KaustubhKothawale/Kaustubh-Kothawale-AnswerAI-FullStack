import React, { useState } from 'react';
import { Routes, Route, Navigate, Router } from 'react-router-dom';
import Chat from './components/Chat';
import Register from './components/Register';
import Login from './components/Login';
import VerifyEmail from './components/VerifyEmail';
import './App.css';

const App = ({ initialToken = null }) => {
  const [token, setToken] = useState(initialToken);

  const handleLogin = (token) => {
    setToken(token);
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/chat"
          element={token ? <Chat token={token} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;
