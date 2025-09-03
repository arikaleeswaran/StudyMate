// client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // <-- IMPORT TOAST

function LoginPage({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = isLogin ? { email, password } : { name, email, password };
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
        setName('');
        setEmail('');
        setPassword('');
        // --- UPDATED: Replace alert with toast.success ---
        toast.success('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      {/* ... (rest of the component is unchanged) ... */}
      <button onClick={() => navigate(-1)} className="back-button">← Back</button>
      <div className="auth-form-container">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
          )}
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