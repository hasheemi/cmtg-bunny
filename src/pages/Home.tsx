import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`fullscreen-container fade-in ${mounted ? 'active' : ''}`}>
      <div className="glass-panel home-panel">
        <div className="logo-placeholder">
          <h1>Bunny Tales</h1>
          <p>Interactive Storybook</p>
        </div>
        
        <button 
          className="btn-primary play-button"
          onClick={() => navigate('/bookshelf')}
        >
          Play Content
        </button>
      </div>
      
      {/* Placeholder background graphic elements */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
    </div>
  );
};

export default Home;
