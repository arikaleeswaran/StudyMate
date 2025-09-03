
import { FaYoutube, FaFileAlt, FaGlobe } from 'react-icons/fa'; 

function ResourceCard({ resource, onSave, token }) {
  const getIcon = () => {
    switch (resource.type) {
      case 'video':
        return <FaYoutube className="card-icon youtube" />;
      case 'article':
        return <FaGlobe className="card-icon article" />;
      case 'document':
        return <FaFileAlt className="card-icon document" />;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="card-main-link">
        {resource.thumbnail && <img src={resource.thumbnail} alt={resource.title} />}
        <div className="card-content">
          <div className="card-header">
            {getIcon()}
            <h3>{resource.title}</h3>
          </div>
          <p className="card-snippet">{resource.snippet}</p>
        </div>
      </a>
      <div className="card-footer">
        <small>Source: {resource.source}</small>
        {token && <button onClick={() => onSave(resource)} className="save-button">Save</button>}
      </div>
    </div>
  );
}

export default ResourceCard;