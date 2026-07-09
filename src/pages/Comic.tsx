import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Comic.css';

const pagesData = [
  { id: 0, title: "Cover", content: "Bunny Tales: The Coding Adventure", image: "🐰" },
  { id: 1, title: "Prologue", content: "Once upon a time, a small bunny discovered a laptop.", image: "💻" },
  { id: 2, title: "Act 1", content: "The bunny learned to type 'Hello World'.", image: "⌨️" },
  { id: 3, title: "Act 2", content: "Bugs appeared! The bunny had to debug the forest.", image: "🐛" },
  { id: 4, title: "Ending", content: "The codebase was clean, and the bunny lived happily ever after.", image: "✨" }
];

const Comic: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [animating, setAnimating] = useState(false);

  const turnPage = (direction: 'next' | 'prev') => {
    if (animating) return;
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    if (newPage >= 0 && newPage < pagesData.length) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentPage(newPage);
        setAnimating(false);
      }, 400);
    }
  };

  const rightPageData = pagesData[currentPage];

  return (
    <div className="fullscreen-container comic-bg fade-in">
      <div className="top-nav">
        <button className="btn-back window-btn" onClick={() => navigate('/bookshelf')}>
          &larr; Back to Bookshelf
        </button>
      </div>

      <div className="comic-book-container">
        <div className={`book-layout ${animating ? 'turning' : ''}`}>
          
          <div className="page left-page">
            <div className="page-content">
              {currentPage > 0 ? (
                <>
                  <div className="page-header">{pagesData[currentPage - 1].title}</div>
                  <div className="page-text muted">Go to next page to continue reading...</div>
                </>
              ) : (
                <div className="page-header empty">Open to read</div>
              )}
            </div>
          </div>
          
          <div className="page-divider"></div>
          
          <div className="page right-page">
            <div className="page-content">
              <div className="page-header">{rightPageData.title}</div>
              <div className="illustration">{rightPageData.image}</div>
              <div className="page-text">{rightPageData.content}</div>
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
            {currentPage + 1} / {pagesData.length}
          </div>
          
          <button 
            className="btn-primary mini" 
            onClick={() => turnPage('next')}
            disabled={currentPage === pagesData.length - 1 || animating}
          >
            Next Page &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comic;
