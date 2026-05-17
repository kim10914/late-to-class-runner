import Phaser from 'phaser';
import { OBSTACLE_TYPES, COLORS, PLAYER_SIZE } from '../config/gameConfig.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.makeRectTexture('player_rect', PLAYER_SIZE, PLAYER_SIZE, COLORS.player);

    for (const def of Object.values(OBSTACLE_TYPES)) {
      this.makeRectTexture(`obs_${def.key}`, def.w, def.h, def.color);
    }

    this.makeRectTexture('item_circle', 28, 28, 0xffd166);
  }

  create() {
    this.scene.start('Menu');
  }

  makeRectTexture(key, w, h, color) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
