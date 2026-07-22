import React, { useState, useRef, useEffect } from 'react';
import './Act3.css';

// Types
type Direction = 'up' | 'down' | 'left' | 'right';

interface CommandBlock {
  id: string;
  type: 'move' | 'enter' | 'loop';
  direction?: Direction;
  count?: number;
  children?: CommandBlock[];
}

interface Position {
  x: number;
  y: number;
}

// Constants
const GRID_SIZE = 8;
const START_POS: Position = { x: 0, y: 0 };
const SHOPS: Position[] = [
  { x: 3, y: 3 },
  { x: 6, y: 3 }
];
const HOME: Position = { x: 0, y: 0 };

const DIRECTIONS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const Act3: React.FC = () => {
  // State
  const [commands, setCommands] = useState<CommandBlock[]>([]);
  const [character, setCharacter] = useState<Position & { direction: Direction }>({
    ...START_POS,
    direction: 'right'
  });
  const [visitedShops, setVisitedShops] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [isLoopMode, setIsLoopMode] = useState<boolean>(false);
  const [loopChildren, setLoopChildren] = useState<CommandBlock[]>([]);
  const [loopCount, setLoopCount] = useState<number>(2);
  
  const consoleRef = useRef<HTMLDivElement>(null);
  // const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isExecutingRef = useRef<boolean>(false);

  // Available commands
  const availableCommands = [
    { id: 'move-up', type: 'move' as const, direction: 'up' as Direction, label: '⬆ Up' },
    { id: 'move-down', type: 'move' as const, direction: 'down' as Direction, label: '⬇ Down' },
    { id: 'move-left', type: 'move' as const, direction: 'left' as Direction, label: '⬅ Left' },
    { id: 'move-right', type: 'move' as const, direction: 'right' as Direction, label: '➡ Right' },
    { id: 'enter', type: 'enter' as const, label: '🏪 Enter Shop' },
  ];

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Get command label
  const getCommandLabel = (cmd: CommandBlock): string => {
    switch (cmd.type) {
      case 'move':
        return cmd.direction === 'up' ? '⬆ Up' :
               cmd.direction === 'down' ? '⬇ Down' :
               cmd.direction === 'left' ? '⬅ Left' : '➡ Right';
      case 'enter':
        return '🏪 Enter Shop';
      case 'loop':
        return `🔄 Loop ${cmd.count || 2}x`;
      default:
        return 'Unknown';
    }
  };

  // Add log
  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  // Execute a single command - FIXED VERSION
  const executeCommand = (cmd: CommandBlock): Promise<boolean> => {
    return new Promise((resolve) => {
      switch (cmd.type) {
        case 'move': {
          if (!cmd.direction) {
            resolve(false);
            return;
          }
          
          const delta = DIRECTIONS[cmd.direction];
          
          setCharacter(prev => {
            const newX = prev.x + delta.x;
            const newY = prev.y + delta.y;
            
            if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
              addLog(`❌ Can't move ${cmd.direction}! Out of bounds!`);
              resolve(false);
              return prev;
            }
            
            addLog(`🚶 Moved ${cmd.direction} to (${newX}, ${newY})`);
            return {
              ...prev,
              x: newX,
              y: newY,
              direction: cmd.direction!
            };
          });
          
          resolve(true);
          break;
        }
        
        case 'enter': {
          setCharacter(prev => {
            const currentPos = { x: prev.x, y: prev.y };
            const shopIndex = SHOPS.findIndex(s => s.x === currentPos.x && s.y === currentPos.y);
            
            if (shopIndex === -1) {
              addLog(`❌ No shop at current position!`);
              resolve(false);
              return prev;
            }
            
            setVisitedShops(prevShops => {
              if (prevShops <= shopIndex) {
                const newCount = prevShops + 1;
                addLog(`🎉 Entered Shop ${shopIndex + 1}! (${newCount}/${SHOPS.length})`);
                return newCount;
              } else {
                addLog(`⏳ Shop ${shopIndex + 1} already visited!`);
                return prevShops;
              }
            });
            
            resolve(true);
            return prev;
          });
          break;
        }
        
        case 'loop': {
          const count = cmd.count || 2;
          addLog(`🔄 Starting loop (${count}x)`);
          
          const executeLoop = async () => {
            for (let i = 0; i < count; i++) {
              if (cmd.children) {
                for (const child of cmd.children) {
                  const success = await executeCommand(child);
                  if (!success) {
                    resolve(false);
                    return;
                  }
                }
              }
            }
            addLog(`✅ Loop completed`);
            resolve(true);
          };
          
          executeLoop();
          break;
        }
        
        default:
          resolve(false);
      }
    });
  };

  // Run all commands
  const runProgram = async () => {
    if (isRunning || commands.length === 0 || isExecutingRef.current) return;
    
    isExecutingRef.current = true;
    setIsRunning(true);
    
    // Reset state
    setCharacter({ ...START_POS, direction: 'right' });
    setVisitedShops(0);
    setCurrentStep(0);
    setGameComplete(false);
    addLog('🚀 Program started!');
    addLog('📋 Executing commands...');
    
    // Small delay for reset to take effect
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let success = true;
    
    for (let i = 0; i < commands.length; i++) {
      if (!isRunning) break;
      
      setCurrentStep(i + 1);
      addLog(`[Step ${i + 1}] ${getCommandLabel(commands[i])}`);
      
      // Execute command with await
      const cmdSuccess = await executeCommand(commands[i]);
      
      if (!cmdSuccess) {
        success = false;
        addLog(`❌ Program stopped at step ${i + 1}`);
        break;
      }
      
      // Check win condition after each step
      await new Promise(resolve => {
        setCharacter(prev => {
          if (visitedShops >= SHOPS.length && 
              prev.x === HOME.x && 
              prev.y === HOME.y) {
            setGameComplete(true);
            addLog('🏆 Mission Complete! All shops visited and returned home!');
          }
          return prev;
        });
        setTimeout(resolve, 300);
      });
    }
    
    if (success && !gameComplete) {
      if (visitedShops >= SHOPS.length) {
        addLog('⚠️ All shops visited but need to return home!');
      } else {
        addLog(`⚠️ Program finished but only visited ${visitedShops}/${SHOPS.length} shops!`);
      }
    }
    
    isExecutingRef.current = false;
    setIsRunning(false);
    addLog('⏹️ Program finished');
  };

  // Step through program
  const stepProgram = () => {
    if (isRunning || currentStep >= commands.length || isExecutingRef.current) return;
    
    if (currentStep === 0) {
      setCharacter({ ...START_POS, direction: 'right' });
      setVisitedShops(0);
      setGameComplete(false);
      addLog('📋 Starting step-by-step execution...');
    }
    
    const cmd = commands[currentStep];
    addLog(`[Step ${currentStep + 1}] ${getCommandLabel(cmd)}`);
    
    // Execute command and handle async
    executeCommand(cmd).then((success) => {
      if (!success) {
        addLog(`❌ Step ${currentStep + 1} failed`);
      }
      
      setCurrentStep(prev => prev + 1);
      
      // Check win condition
      setCharacter(prev => {
        if (visitedShops >= SHOPS.length && 
            prev.x === HOME.x && 
            prev.y === HOME.y) {
          setGameComplete(true);
          addLog('🏆 Mission Complete!');
        }
        return prev;
      });
      
      if (currentStep + 1 >= commands.length) {
        addLog(`⚠️ Program ended - Visited ${visitedShops}/${SHOPS.length} shops`);
      }
    });
  };

  // Add command
  const addCommand = (cmd: Omit<CommandBlock, 'id'>) => {
    if (isRunning) return;
    
    const newCmd = { ...cmd, id: `${cmd.type}-${Date.now()}` };
    
    if (isLoopMode) {
      setLoopChildren([...loopChildren, newCmd]);
      addLog(`Added to loop: ${getCommandLabel(newCmd)}`);
    } else {
      setCommands([...commands, newCmd]);
      addLog(`Added: ${getCommandLabel(newCmd)}`);
    }
  };

  // Remove command from program
  const removeCommand = (index: number) => {
    if (isRunning) return;
    const removed = commands[index];
    setCommands(commands.filter((_, i) => i !== index));
    if (removed) {
      addLog(`Removed: ${getCommandLabel(removed)}`);
    }
  };

  // Remove child from loop
  const removeLoopChild = (index: number) => {
    if (isRunning) return;
    const removed = loopChildren[index];
    setLoopChildren(loopChildren.filter((_, i) => i !== index));
    if (removed) {
      addLog(`Removed from loop: ${getCommandLabel(removed)}`);
    }
  };

  // Complete loop creation
  const completeLoop = () => {
    if (loopChildren.length === 0) {
      addLog('⚠️ Loop must have at least one command!');
      return;
    }
    
    const newLoop: CommandBlock = {
      id: `loop-${Date.now()}`,
      type: 'loop',
      count: loopCount,
      children: [...loopChildren]
    };
    
    setCommands([...commands, newLoop]);
    setLoopChildren([]);
    setIsLoopMode(false);
    addLog(`🔄 Added loop with ${loopChildren.length} commands (${loopCount}x)`);
  };

  // Reset game
  const resetGame = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    isExecutingRef.current = false;
    setIsRunning(false);
    setCommands([]);
    setCharacter({ ...START_POS, direction: 'right' });
    setVisitedShops(0);
    setCurrentStep(0);
    setGameComplete(false);
    setLogs([]);
    setLoopChildren([]);
    setIsLoopMode(false);
    addLog('🔄 Game reset!');
  };

  // Toggle loop mode
  const toggleLoopMode = () => {
    if (isRunning) return;
    setIsLoopMode(!isLoopMode);
    if (!isLoopMode) {
      setLoopChildren([]);
    }
  };

  return (
    <>
      <div className="act-container">
        <h1 className="act-title">Act 3: Coding Adventure</h1>
      <p className="act-text">
        Program your character to visit 2 shops and return home!
      </p>

      <div className="game-layout">
        {/* Command Palette */}
        <div className="command-palette">
          <h3>📦 Commands</h3>
          <p className="hint">Click to add to program</p>
          <div className="command-grid">
            {availableCommands.map((cmd) => (
              <div
                key={cmd.id}
                className={`command-block ${isLoopMode ? 'loop-mode' : ''}`}
                onClick={() => addCommand(cmd)}
              >
                <span className="command-label">{cmd.label}</span>
              </div>
            ))}
            
            <div
              className={`command-block loop-toggle ${isLoopMode ? 'active' : ''}`}
              onClick={toggleLoopMode}
            >
              <span className="command-label">🔄 {isLoopMode ? 'Close Loop' : 'Open Loop'}</span>
            </div>
          </div>

          {/* Loop Input */}
          {isLoopMode && (
            <div className="loop-input">
              <h4>🔄 Building Loop</h4>
              <div className="loop-controls">
                <label>Repeat:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={loopCount}
                  onChange={(e) => setLoopCount(parseInt(e.target.value) || 1)}
                />
                <span>times</span>
              </div>
              
              <div className="loop-children">
                <p className="hint">Commands inside loop ({loopChildren.length}):</p>
                {loopChildren.length === 0 ? (
                  <p className="empty-hint">Click commands above to add</p>
                ) : (
                  loopChildren.map((cmd, idx) => (
                    <div key={cmd.id} className="loop-child-item">
                      <span>{getCommandLabel(cmd)}</span>
                      <span 
                        className="remove-btn"
                        onClick={() => removeLoopChild(idx)}
                      >
                        ×
                      </span>
                    </div>
                  ))
                )}
              </div>
              
              <div className="loop-actions">
                <button 
                  onClick={completeLoop}
                  disabled={loopChildren.length === 0}
                >
                  ✅ Add Loop to Program
                </button>
                <button onClick={() => {
                  setIsLoopMode(false);
                  setLoopChildren([]);
                }}>
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Program Editor */}
        <div className="program-editor">
          <h3>📝 Program ({commands.length} commands)</h3>
          <div className="program-list">
            {commands.length === 0 ? (
              <p className="empty-hint">Click commands from palette to build program</p>
            ) : (
              commands.map((cmd, idx) => (
                <div
                  key={cmd.id}
                  className={`program-item ${currentStep > idx && isRunning ? 'executed' : ''}`}
                >
                  <span className="step-number">{idx + 1}.</span>
                  <span className="command-label">{getCommandLabel(cmd)}</span>
                  <span className="remove-btn" onClick={() => removeCommand(idx)}>×</span>
                </div>
              ))
            )}
          </div>
          
          <div className="program-controls">
            <button 
              onClick={runProgram} 
              disabled={isRunning || commands.length === 0}
              className="btn-run"
            >
              ▶️ Run
            </button>
            <button 
              onClick={stepProgram} 
              disabled={isRunning || currentStep >= commands.length}
              className="btn-step"
            >
              ⏭️ Step
            </button>
            <button 
              onClick={resetGame}
              className="btn-reset"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid-container">
          <div className="grid-header">
            <span>🏠 Start</span>
            <span>Shops: {visitedShops}/{SHOPS.length}</span>
            <span className={gameComplete ? 'complete' : 'in-progress'}>
              {gameComplete ? '✅ Complete!' : '⏳ In Progress'}
            </span>
          </div>
          <div className="grid">
            {Array.from({ length: GRID_SIZE }).map((_, y) => (
              <div key={y} className="grid-row">
                {Array.from({ length: GRID_SIZE }).map((_, x) => {
                  const isShop = SHOPS.some(s => s.x === x && s.y === y);
                  const isHome = x === HOME.x && y === HOME.y;
                  const isCharacter = x === character.x && y === character.y;
                  const shopIndex = SHOPS.findIndex(s => s.x === x && s.y === y);
                  const isVisited = shopIndex !== -1 && shopIndex < visitedShops;
                  
                  let cellContent = '';
                  let cellClass = 'grid-cell';
                  
                  if (isCharacter) {
                    cellContent = '🐰';
                    cellClass += ' character';
                  } else if (isShop) {
                    cellContent = isVisited ? '✅' : '🏪';
                    cellClass += ' shop';
                  } else if (isHome) {
                    cellContent = '🏠';
                    cellClass += ' home';
                  }
                  
                  return (
                    <div key={x} className={cellClass}>
                      {cellContent}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
    </>
  );
};

export default Act3;