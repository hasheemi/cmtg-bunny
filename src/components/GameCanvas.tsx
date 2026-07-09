import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BootScene from '../game/BootScene';

interface GameCanvasProps {
  width?: number | string;
  height?: number | string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ width = 800, height = 600 }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent: gameRef.current,
      backgroundColor: '#000000',
      scene: [BootScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [width, height]);

  return <div ref={gameRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} />;
};

export default GameCanvas;
