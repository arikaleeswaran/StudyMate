// client/src/pages/HomePage.jsx

// This component no longer needs useState
function HomePage({ token, topic, setTopic, results, isLoading, error, handleSearch }) {

  const handleSave = async (resource) => {
    // ... (this function is unchanged)
    if (!token) {
      alert('Please log in to save resources.');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:5000/api/save-resource', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resource)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || data.message || data.error || 'An unknown error occurred while saving.');
      }
      alert(data.message || 'Resource saved successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <h1>StudyMateHub 📚</h1>
      <p>Your one-stop hub for learning resources.</p>
      {/* The form now uses the handleSearch function passed down as a prop */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic to learn (e.g., Data Structures)"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {results && (
        <div className="results-container">
          <div className="results-section">
            <h2>Videos</h2>
            {results.videos?.map((video, index) => (
              <div key={`video-${index}`} className="card">
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  <img src={video.thumbnail} alt={video.title} />
                  <h3>{video.title}</h3>
                </a>
                <p>Source: {video.source}</p>
                <button onClick={() => handleSave(video)} className="save-button">Save</button>
              </div>
            ))}
          </div>

          <div className="results-section">
            <h2>Articles</h2>
            {results.articles?.map((article, index) => (
              <div key={`article-${index}`} className="card">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <h3>{article.title}</h3>
                </a>
                <p>{article.snippet}</p>
                <small>Source: {article.source}</small>
                <button onClick={() => handleSave(article)} className="save-button">Save</button>
              </div>
            ))}
          </div>

          <div className="results-section">
            <h2>Documents (PDFs)</h2>
            {results.documents?.map((doc, index) => (
              <div key={`doc-${index}`} className="card">
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <h3>📄 {doc.title}</h3>
                </a>
                <p>{doc.snippet}</p>
                <small>Source: {doc.source}</small>
                <button onClick={() => handleSave(doc)} className="save-button">Save</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;