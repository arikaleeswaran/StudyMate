
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyRoadmapPage from './pages/MyRoadmap'; 
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  return (
    <BrowserRouter>
      <Navbar token={token} setToken={handleSetToken} />
      <Routes>
        <Route path="/" element={<HomePage token={token} />} />
        <Route path="/login" element={<LoginPage setToken={handleSetToken} />} />
        <Route path="/my-roadmap" element={<MyRoadmapPage token={token} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;