
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MyRoadmapPage({ token }) {
  const [roadmap, setRoadmap] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchRoadmap = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/my-roadmap', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error('Failed to fetch roadmap');
        setRoadmap(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoadmap();
  }, [token, navigate]);

  if (isLoading) {
    return <div className="container"><p>Loading your roadmap...</p></div>;
  }

  return (
    <div className="container">
  
      <button onClick={() => navigate(-1)} className="back-button">← Back</button>
      
      <h1>My Roadmap</h1>
      <p>Your collection of saved learning resources.</p>
      <div className="results-container">
        {roadmap.length > 0 ? roadmap.map((item) => (
          <div key={item.id} className="card">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.thumbnail && <img src={item.thumbnail} alt={item.title} />}
              <h3>{item.type === 'document' ? '📄' : ''} {item.title}</h3>
            </a>
            <small>Type: {item.type}</small><br/>
            <small>Source: {item.source}</small>
          </div>
        )) : (
          <p>You haven't saved any resources yet. Start searching to build your roadmap!</p>
        )}
      </div>
    </div>
  );
}

export default MyRoadmapPage;