// client/src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyRoadmapPage from './pages/MyRoadmap';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // --- MOVED FROM HomePage ---
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  // --- MOVED FROM HomePage ---
  const handleSearch = async (event) => {
    event.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setResults(null);
    setError('');

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/search?topic=${topic}`);
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
      <Navbar token={token} setToken={handleSetToken} />
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