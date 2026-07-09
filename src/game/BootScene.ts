import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Colored background matching the premium theme
    this.cameras.main.setBackgroundColor('#1e1b4b');

    // Text display
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Phaser Ready',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Outfit, sans-serif'
      }
    ).setOrigin(0.5);
  }
}
