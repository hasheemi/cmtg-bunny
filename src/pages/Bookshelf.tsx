import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Bookshelf.css';

const Bookshelf: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fullscreen-container bookshelf-bg fade-in">
      <div className="top-nav">
        <button className="btn-back" onClick={() => navigate('/')}>
          &larr; Back to Home
        </button>
      </div>
      
      <div className="bookshelf-container">
        <h2 className="bookshelf-title">Select a Story</h2>
        
        <div className="books-grid">
          <div className="book-card clickable" onClick={() => navigate('/comic')}>
            <div className="book-cover bunny-cover">
              <h3>Coding Bunny</h3>
            </div>
            <div className="book-spine"></div>
          </div>
          
          <div className="book-card disabled">
            <div className="book-cover soon-cover">
              <h3>Coming Soon</h3>
            </div>
            <div className="book-spine"></div>
          </div>
        </div>
      </div>
      
      {/* Background shape */}
      <div className="bg-shape shape-3"></div>
    </div>
  );
};

export default Bookshelf;
