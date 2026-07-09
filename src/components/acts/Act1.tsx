import React, { useState } from 'react';
import './Acts.css';

const floatingItems = ['🥕', '🔍', '💻', '💡'];

const Act1: React.FC = () => {
  const [inventory, setInventory] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>(floatingItems);

  const handlePickItem = (item: string) => {
    setInventory((prev) => [...prev, item]);
    setItems((prev) => prev.filter((i) => i !== item));
  };

  return (
    <div className="act-container">
      <h1 className="act-title">Act 1: The Discovery</h1>
      <p className="act-text">
        Pick up the items you find scattered around by clicking on them!
      </p>

      <div className="floating-area">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`floating-item item-pos-${idx}`}
            onClick={() => handlePickItem(item)}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="inventory-bar">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="inventory-slot">
            {inventory[i] || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Act1;
