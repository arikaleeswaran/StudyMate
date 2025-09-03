// client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // <-- 1. Get the navigate function

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    };
    try {
      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      if (isLogin) {
        setToken(data.access_token);
        navigate('/');
      } else {
        setIsLogin(true);
        alert('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      {/* --- 2. ADD THE BACK BUTTON --- */}
      <button onClick={() => navigate(-1)} className="back-button">← Back</button>
      
      <div className="auth-form-container">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">{isLogin ? 'Login' : 'Create Account'}</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;