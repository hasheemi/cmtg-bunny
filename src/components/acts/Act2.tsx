import React, { useState, useRef } from 'react';
import './Acts.css';

const collectionItems = [
  { id: 'crystal', emoji: '💎', name: 'Crystal' },
  { id: 'key', emoji: '🗝️', name: 'Ancient Key' },
  { id: 'map', emoji: '🗺️', name: 'Treasure Map' },
  { id: 'compass', emoji: '🧭', name: 'Compass' },
  { id: 'gem', emoji: '🔮', name: 'Magic Gem' }
];

interface PlacedItem {
  id: string;
  emoji: string;
  name: string;
  x: number;
  y: number;
  isNew?: boolean;
}

const Act2: React.FC = () => {
  const [inventory, setInventory] = useState(collectionItems);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);

  // For touch support
  const [touchDraggedItem, setTouchDraggedItem] = useState<{ id: string, source: 'inventory' | 'canvas' } | null>(null);
  const [ghostInfo, setGhostInfo] = useState<{ x: number, y: number, emoji: string } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- HTML5 Drag & Drop (Desktop) ---
  const handleDragStart = (e: React.DragEvent, id: string, source: 'inventory' | 'canvas') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, source }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dataString = e.dataTransfer.getData('text/plain');
    if (!dataString) return;

    try {
      const data = JSON.parse(dataString);
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left - 20; 
      const y = e.clientY - canvasRect.top - 20;

      placeItem(data.id, data.source, x, y);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Touch Events (Mobile) ---
  const handleTouchStart = (e: React.TouchEvent, id: string, source: 'inventory' | 'canvas') => {
    setTouchDraggedItem({ id, source });
    const item = source === 'inventory' 
      ? inventory.find(i => i.id === id) 
      : placedItems.find(i => i.id === id);
    if (item) {
      setGhostInfo({ x: e.touches[0].clientX, y: e.touches[0].clientY, emoji: item.emoji });
    }
  };

  const handleGlobalTouchMove = (e: React.TouchEvent) => {
    if (touchDraggedItem) {
      if (e.cancelable) e.preventDefault(); // prevent scrolling
      setGhostInfo(prev => prev ? { ...prev, x: e.touches[0].clientX, y: e.touches[0].clientY } : null);
    }
  };

  const handleGlobalTouchEnd = (e: React.TouchEvent) => {
    if (!touchDraggedItem) return;
    
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (canvasRef.current && canvasRef.current.contains(target)) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = touch.clientX - canvasRect.left - 20;
      const y = touch.clientY - canvasRect.top - 20;
      placeItem(touchDraggedItem.id, touchDraggedItem.source, x, y);
    }
    
    setTouchDraggedItem(null);
    setGhostInfo(null);
  };

  // --- Common Logic ---
  const placeItem = (id: string, source: string, x: number, y: number) => {
    if (source === 'inventory') {
      const item = inventory.find(i => i.id === id);
      if (item) {
        setInventory(prev => prev.filter(i => i.id !== id));
        setPlacedItems(prev => [...prev, { ...item, x, y, isNew: true }]);
        setTimeout(() => {
          // Remove pop animation class after placing
          setPlacedItems(prev => prev.map(i => i.id === id ? { ...i, isNew: false } : i));
        }, 500);
      }
    } else if (source === 'canvas') {
      setPlacedItems(prev => prev.map(i => i.id === id ? { ...i, x, y } : i));
    }
  };

  const handleCanvasItemClick = (e: React.MouseEvent | React.TouchEvent, itemId: string) => {
    e.stopPropagation();
    const item = placedItems.find(i => i.id === itemId);
    if (item) {
      setPlacedItems(prev => prev.filter(i => i.id !== itemId));
      setInventory(prev => [...prev, { id: item.id, emoji: item.emoji, name: item.name }]);
    }
  };

  return (
    <div 
      className="act-container" 
      style={{ position: 'relative' }}
      onTouchMove={handleGlobalTouchMove}
      onTouchEnd={handleGlobalTouchEnd}
      onTouchCancel={handleGlobalTouchEnd}
    >
      <div className="act2-header" style={{ marginTop: '1rem', position: 'relative', zIndex: 5 }}>
        <h1 className="act-title">Act 2: The Collection</h1>
        <p className="act-text">Items Collected: {placedItems.length}/{collectionItems.length}</p>
      </div>

      <div className="act2-inventory-panel">
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', borderBottom: '2px solid #8b8b8b', paddingBottom: '5px' }}>Inventory</h3>
        <div className="act2-inventory-items">
          {inventory.map(item => (
            <div
              key={item.id}
              className="act2-inventory-slot act2-draggable"
              draggable
              onDragStart={(e) => handleDragStart(e, item.id, 'inventory')}
              onTouchStart={(e) => handleTouchStart(e, item.id, 'inventory')}
              title={item.name}
            >
              {item.emoji}
            </div>
          ))}
        </div>
      </div>

      <div 
        className="act2-canvas" 
        ref={canvasRef}
        onDragOver={handleDragOver} 
        onDrop={handleDrop}
      >
        <div className="act2-canvas-text">CANVAS AREA<br/>(Drop items here)</div>
        
        {placedItems.map(item => (
          <div
            key={item.id}
            className={`act2-canvas-item act2-draggable ${item.isNew ? 'drop-animation' : ''}`}
            style={{ left: `${item.x}px`, top: `${item.y}px` }}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id, 'canvas')}
            onTouchStart={(e) => handleTouchStart(e, item.id, 'canvas')}
            onClick={(e) => handleCanvasItemClick(e, item.id)}
            title={item.name}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {ghostInfo && (
        <div style={{
          position: 'fixed',
          left: ghostInfo.x - 25,
          top: ghostInfo.y - 25,
          fontSize: '2.5rem',
          pointerEvents: 'none',
          zIndex: 9999,
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'
        }}>
          {ghostInfo.emoji}
        </div>
      )}
    </div>
  );
};

export default Act2;
