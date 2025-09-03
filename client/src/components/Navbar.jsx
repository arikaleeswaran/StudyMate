
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ token, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">StudyMate</Link>
      <div className="nav-links">
        {token ? (
          <>
            <Link to="/my-roadmap" className="nav-link">My Roadmap</Link>
            <button onClick={handleLogout} className="nav-button">Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-button">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;