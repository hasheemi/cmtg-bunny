import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Comic.css';
import Act1 from '../components/acts/Act1';
import Act2 from '../components/acts/Act2';
import Act3 from '../components/acts/Act3';
import Act4 from '../components/acts/Act4';

const acts = [
  <Act1 key="act1" />,
  <Act2 key="act2" />,
  <Act3 key="act3" />,
  <Act4 key="act4" />,
];

const Comic: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [animating, setAnimating] = useState(false);

  const turnPage = (direction: 'next' | 'prev') => {
    if (animating) return;
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    if (newPage >= 0 && newPage < acts.length) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentPage(newPage);
        setAnimating(false);
      }, 400);
    }
  };

  return (
    <div className="fullscreen-container comic-bg fade-in">
      <div className="top-nav">
        <button className="btn-back window-btn" onClick={() => navigate('/bookshelf')}>
          &larr; Back to Bookshelf
        </button>
      </div>

      <div className="comic-book-container">
        <div className={`book-layout ${animating ? 'turning' : ''}`}>
          <div className="fullscreen-page">
            <div className="page-content-wrapper">
              {acts[currentPage]}
            </div>
            <div className="page-number">Page {currentPage + 1}</div>
          </div>
        </div>

        <div className="comic-controls">
          <button 
            className="btn-primary mini" 
            onClick={() => turnPage('prev')}
            disabled={currentPage === 0 || animating}
          >
            &larr; Previous Page
          </button>
          
          <div className="page-indicator">
            {currentPage + 1} / {acts.length}
          </div>
          
          <button 
            className="btn-primary mini" 
            onClick={() => turnPage('next')}
            disabled={currentPage === acts.length - 1 || animating}
          >
            Next Page &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comic;
