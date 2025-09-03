// client/src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyRoadmapPage from './pages/MyRoadmap';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok) {
            setCurrentUser(data);
          } else {
            handleSetToken(null);
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      } else {
        setCurrentUser(null);
      }
    };
    fetchUserProfile();
  }, [token]);

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setResults(null);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/search?topic=${topic}`);
      if (!response.ok) {
        throw new Error('The server had an issue, please try again!');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar token={token} setToken={handleSetToken} currentUser={currentUser} />
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              token={token}
              topic={topic}
              setTopic={setTopic}
              results={results}
              isLoading={isLoading}
              error={error}
              handleSearch={handleSearch}
            />
          } 
        />
        <Route path="/login" element={<LoginPage setToken={handleSetToken} />} />
        <Route path="/my-roadmap" element={<MyRoadmapPage token={token} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;