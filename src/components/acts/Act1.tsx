import React, { useState } from 'react';
import './Act1.css';

const floatingItems = [
  { id: 'carrot', emoji: '🥕' },
  { id: 'search', emoji: '🔍' },
  { id: 'computer', emoji: '💻' },
  { id: 'idea', emoji: '💡' }
];

const Act1: React.FC = () => {
   const [inventory, setInventory] = useState<Array<{ id: string; emoji: string }>>([]);
  const [items, setItems] = useState<Array<{ id: string; emoji: string }>>(floatingItems);

  const handlePickItem = (item: { id: string; emoji: string }) => {
    setInventory((prev) => [...prev, item]);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleBackItem = (item: { id: string; emoji: string }) => {
    setInventory((prev) => prev.filter((i) => i !== item));
    setItems((prev) => [...prev, item]);
  }

  return (
    <>
      <div className="act-container">
        <h1 className="act-title">Act 1: The Discovery</h1>
      <p className="act-text">
        Pick up the items you find scattered around by clicking on them!
      </p>

      <div className="floating-area">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`floating-item item-pos-${item.id}`}
            onClick={() => handlePickItem(item)}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      <div className="inventory-bar">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="inventory-slot" onClick={() => inventory[i] && handleBackItem(inventory[i])}>
            {inventory[i]?.emoji || ''}
          </div>
        ))}
      </div>
      </div>
    </>
  );
};

export default Act1;
