import React, { useState, useEffect, useRef } from 'react';
import './Act4.css';

// Types
type PatternChar = 'A' | 'B';
type GameStatus = 'idle' | 'playing' | 'success' | 'failed';
type CharacterState = 'idle' | 'jump' | 'celebrate';

interface PatternLevel {
  id: number;
  pattern: PatternChar[];
  description: string;
}

// Level Configuration
const LEVELS: PatternLevel[] = [
  { id: 1, pattern: ['A', 'B'], description: 'Simple AB' },
  { id: 2, pattern: ['A', 'B', 'B'], description: 'ABB' },
  { id: 3, pattern: ['A', 'B', 'B', 'A'], description: 'ABBA' },
  { id: 4, pattern: ['A', 'B', 'B', 'A', 'B', 'B'], description: 'ABBABB' },
  { id: 5, pattern: ['A', 'B', 'A', 'B', 'B', 'A', 'B', 'B'], description: 'ABABBABB' },
];

const Act4: React.FC = () => {
  // Game State
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [currentPattern, setCurrentPattern] = useState<PatternChar[]>(LEVELS[0].pattern);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [message, setMessage] = useState<string>('Click Start to begin!');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [kittyState, setKittyState] = useState<CharacterState>('idle');
  const [bunnyState, setBunnyState] = useState<CharacterState>('idle');
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [isBunnyEnabled, setIsBunnyEnabled] = useState<boolean>(false);
  const [patternCompleteCount, setPatternCompleteCount] = useState<number>(0);
  
  // const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Console.log for game events
  const logEvent = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : '📋';
    console.log(`${prefix} ${message}`);
  };

  // Reset level
  const resetLevel = () => {
    setCurrentIndex(0);
    setStreak(0);
    setConfidence(3);
    setPatternCompleteCount(0);
    setGameStatus('idle');
    setMessage('Ready to start!');
    setKittyState('idle');
    setBunnyState('idle');
    setHighlightIndex(-1);
    setIsAnimating(false);
    setIsBunnyEnabled(false);
    isProcessingRef.current = false;
    logEvent(`Level ${currentLevel + 1} reset`, 'info');
  };

  // Check if pattern is complete
  const checkPatternComplete = () => {
    // Pattern selesai, tapi streak belum 3
    if (streak < 3) {
      const needed = 3 - streak;
      setMessage(`🔄 Pattern complete! Need ${needed} more correct!`);
      logEvent(`🔄 Pattern complete - Streak: ${streak}/3, repeating pattern`, 'info');
      
      // Reset index tapi PERTAHANKAN streak dan confidence
      setCurrentIndex(0);
      setHighlightIndex(-1);
      setIsBunnyEnabled(false);
      isProcessingRef.current = false;
      setPatternCompleteCount(prev => prev + 1);
      
      // useEffect akan handle next move
      return;
    }
    
    // Streak >= 3 - Level Complete!
    setGameStatus('success');
    setKittyState('celebrate');
    setBunnyState('celebrate');
    setIsBunnyEnabled(false);
    setMessage(`🎉 Level ${currentLevel + 1} Complete!`);
    logEvent(`🏆 Level ${currentLevel + 1} Complete!`, 'success');
    logEvent(`✨ Streak: ${streak}/3`, 'success');
    logEvent(`📊 Pattern completed ${patternCompleteCount + 1} times`, 'info');
    
    setTimeout(() => {
      setKittyState('idle');
      setBunnyState('idle');
    }, 2000);
  };

  // Process Ketty's automatic turn
  const processKettyTurn = () => {
    if (gameStatus !== 'playing' || isAnimating || currentIndex >= currentPattern.length || isProcessingRef.current) {
      return;
    }

    const currentChar = currentPattern[currentIndex];
    isProcessingRef.current = true;
    setIsAnimating(true);
    setKittyState('jump');
    logEvent(`🐱 Ketty moves (Auto) - Position ${currentIndex + 1} with ${currentChar}`, 'info');
    
    timerRef.current = setTimeout(() => {
      setKittyState('idle');
      setIsAnimating(false);
      isProcessingRef.current = false;
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      
      if (newIndex >= currentPattern.length) {
        timerRef.current = setTimeout(() => {
          checkPatternComplete();
        }, 300);
      }
    }, 600);
  };

  // Handle Player (Bunny) click
  const handlePlayerClick = (clickedChar: 'A' | 'B') => {
    if (gameStatus !== 'playing' || isAnimating || currentIndex >= currentPattern.length || isProcessingRef.current) {
      return;
    }

    // Checking if it's Bunny's turn (odd index)
    if (currentIndex % 2 === 0) {
      return; // Ketty's turn!
    }

    const expected = currentPattern[currentIndex];
    
    if (expected === clickedChar) {
      // Correct!
      setBunnyState('jump');
      setIsBunnyEnabled(false);
      logEvent(`✅ Correct! Bunny clicks ${clickedChar} (Position ${currentIndex + 1})`, 'success');
      
      timerRef.current = setTimeout(() => {
        setBunnyState('idle');
      }, 500);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setConfidence(prev => Math.min(prev + 1, 3));
      
      if (newStreak >= 3) {
        setMessage('🌟 Perfect streak!');
      } else {
        setMessage(`✅ Correct! Streak: ${newStreak}/3`);
      }
      
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      
      if (newIndex >= currentPattern.length) {
        timerRef.current = setTimeout(() => {
          checkPatternComplete();
        }, 500);
      }
    } else {
      // Wrong!
      setBunnyState('jump');
      setIsBunnyEnabled(false);
      logEvent(`❌ Wrong! Expected ${expected}, but clicked ${clickedChar}`, 'error');
      
      timerRef.current = setTimeout(() => {
        setBunnyState('idle');
      }, 500);

      const newConfidence = confidence - 1;
      setConfidence(newConfidence);
      setStreak(0);
      setPatternCompleteCount(0);
      setMessage('😅 Wrong! Try again!');
      
      if (newConfidence <= 0) {
        setGameStatus('failed');
        setMessage('😢 Game Over! You lost all confidence!');
      } else {
        timerRef.current = setTimeout(() => {
          setCurrentIndex(0);
          setHighlightIndex(-1);
          isProcessingRef.current = false;
        }, 800);
      }
    }
  };

  // Start game
  const startGame = () => {
    resetLevel();
    setGameStatus('playing');
    setMessage(`Pattern: ${currentPattern.join(' ')}`);
    setPatternCompleteCount(0);
    logEvent(`🎯 Level ${currentLevel + 1}: ${LEVELS[currentLevel].description}`, 'info');
    logEvent(`📋 Pattern: ${currentPattern.join(' ')}`, 'info');
    
    // Reset index dan biarkan useEffect handle first move
    setCurrentIndex(0);
    setHighlightIndex(0);
    setIsBunnyEnabled(false);
    isProcessingRef.current = false;
  };

  // Next level
  const nextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      const nextLevelIndex = currentLevel + 1;
      setCurrentLevel(nextLevelIndex);
      setCurrentPattern(LEVELS[nextLevelIndex].pattern);
      setPatternCompleteCount(0);
      logEvent(`➡️ Moving to Level ${nextLevelIndex + 1}`, 'info');
      setTimeout(() => {
        startGame();
      }, 500);
    } else {
      // All levels complete!
      setGameStatus('success');
      setMessage('🏆 You are a Pattern Master! 🎉');
      logEvent('🌟 YOU WIN! All levels complete!', 'success');
      setKittyState('celebrate');
      setBunnyState('celebrate');
    }
  };

  // Retry level
  const retryLevel = () => {
    setGameStatus('idle');
    resetLevel();
    setTimeout(() => {
      startGame();
    }, 500);
  };

  // Reset game
  const resetGame = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setGameStatus('idle');
    resetLevel();
    setPatternCompleteCount(0);
    setMessage('Click Start to begin!');
    console.clear();
    console.log('🔄 Game reset');
  };

  // EFFECT: Handle automatic progression
  useEffect(() => {
    if (gameStatus === 'playing' && !isAnimating && currentIndex < currentPattern.length) {
      setHighlightIndex(currentIndex);
      
      const isKettyTurn = currentIndex % 2 === 0;
      
      if (isKettyTurn) {
        setIsBunnyEnabled(false);
        setMessage('🐱 Ketty\'s turn! Watch what she does!');
        processKettyTurn();
      } else {
        setIsBunnyEnabled(true);
        setMessage('🐰 Your turn! Choose A or B for Bunny!');
      }
    }
  }, [currentIndex, gameStatus, isAnimating, currentPattern]);

  // Render confidence hearts
  const renderConfidence = () => {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      hearts.push(
        <span key={i} className={`heart ${i < confidence ? 'filled' : 'empty'}`}>
          {i < confidence ? '❤️' : '🖤'}
        </span>
      );
    }
    return hearts;
  };

  // Render pattern display
  const renderPattern = () => {
    return currentPattern.map((char, index) => (
      <div 
        key={index} 
        className={`pattern-char ${index === highlightIndex ? 'highlight' : ''} 
                    ${index < currentIndex ? 'done' : ''}
                    ${char === 'A' ? 'char-a' : 'char-b'}`}
      >
        {char}
        {index === highlightIndex && gameStatus === 'playing' && (
          <div className="pointer">👆</div>
        )}
      </div>
    ));
  };

  return (
    <>
      <div className="act-container">
        <h1 className="act-title">Act 4: Pattern Recognition</h1>
      
      <div className="game-wrapper">
        {/* Top Bar - Level & Pattern */}
        <div className="top-bar">
          <div className="level-info">
            <span className="level-badge">Level {currentLevel + 1}/{LEVELS.length}</span>
            <span className="level-desc">{LEVELS[currentLevel].description}</span>
          </div>
          
          <div className="pattern-display">
            <span className="pattern-label">🎯 Pattern</span>
            <div className="pattern-container">
              {renderPattern()}
            </div>
          </div>
        </div>

        {/* Main Scene - Full Width Car & Characters */}
        <div className="scene-full">
          <div className="characters-row">
            <div className={`character kitty ${kittyState}`}>
              <span className="emoji">🐱</span>
              <span className="label">Kitty (A)</span>
              {kittyState === 'jump' && <span className="action-label">⬆</span>}
            </div>
            <div className={`character bunny ${bunnyState}`}>
              <span className="emoji">🐰</span>
              <span className="label">Bunny (B)</span>
              {bunnyState === 'jump' && <span className="action-label">⬆</span>}
            </div>
          </div>
          
          <div className="car-full">
            <div className="car-body">
              <span className="car-emoji">🚗</span>
              <div className="car-wheels">
                <div className="wheel"></div>
                <div className="wheel"></div>
              </div>
            </div>
          </div>
          
          {/* Controls floating on car */}
          <div className="controls-float">
            <button 
              className={`btn-kitty ${isBunnyEnabled ? 'active' : ''}`}
              onClick={() => handlePlayerClick('A')}
              disabled={!isBunnyEnabled || isAnimating}
            >
              A {isBunnyEnabled ? '👆' : ''}
            </button>
            <button 
              className={`btn-bunny ${isBunnyEnabled ? 'active' : ''}`}
              onClick={() => handlePlayerClick('B')}
              disabled={!isBunnyEnabled || isAnimating}
            >
              B {isBunnyEnabled ? '👆' : ''}
            </button>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="bottom-bar">
          <div className="status-left">
            <div className="confidence-display">
              <span className="label">Confidence</span>
              <div className="hearts">{renderConfidence()}</div>
            </div>
            
            <div className="streak-display">
              <span className="label">Streak</span>
              <span className="streak-value">{streak}/3</span>
              {streak >= 3 && <span className="streak-star">⭐</span>}
            </div>
          </div>

          <div className="status-right">
            <div className="progress-display">
              <span className="label">Progress</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${currentPattern.length > 0 ? (currentIndex / currentPattern.length) * 100 : 0}%`,
                    background: streak >= 3 ? '#4CAF50' : '#4A90D9'
                  }}
                />
              </div>
              <span className="progress-text">{currentIndex}/{currentPattern.length}</span>
            </div>
          </div>
        </div>

        {/* Message & Controls */}
        <div className="controls-bottom">
          <div className="game-message">{message}</div>
          
          <div className="action-buttons">
            {gameStatus === 'idle' && (
              <button className="btn-start" onClick={startGame}>
                ▶️ Start
              </button>
            )}
            {gameStatus === 'success' && (
              <button className="btn-next" onClick={nextLevel}>
                {currentLevel < LEVELS.length - 1 ? '➡️ Next' : '🏆 Win!'}
              </button>
            )}
            {gameStatus === 'failed' && (
              <button className="btn-retry" onClick={retryLevel}>
                🔄 Retry
              </button>
            )}
            <button className="btn-reset" onClick={resetGame}>
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Act4;