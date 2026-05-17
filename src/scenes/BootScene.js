import Phaser from 'phaser';
import { OBSTACLE_TYPES, COLORS, PLAYER_SIZE } from '../config/gameConfig.js';

// 슬롯별 size · fallback 색 정의. PNG 파일이 public/assets/{key}.png 로 있으면 사용,
// 없으면 makeRectTexture() 가 동일한 key 로 단색 사각형을 만들어준다.
const ASSET_MANIFEST = [
  { key: 'player_run0', w: PLAYER_SIZE, h: PLAYER_SIZE, color: COLORS.player },
  { key: 'player_run1', w: PLAYER_SIZE, h: PLAYER_SIZE, color: COLORS.player },
  { key: 'item_circle', w: 28, h: 28, color: 0xffd166 }
];

for (const def of Object.values(OBSTACLE_TYPES)) {
  ASSET_MANIFEST.push({
    key: `obs_${def.key}`,
    w: def.w,
    h: def.h,
    color: def.color
  });
}

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    for (const a of ASSET_MANIFEST) {
      this.load.image(a.key, `assets/${a.key}.png`);
    }
    this.load.on('loaderror', (file) => {
      console.warn(`[BootScene] asset missing: ${file.src} — using rectangle placeholder`);
    });
  }

  create() {
    for (const a of ASSET_MANIFEST) {
      if (!this.textures.exists(a.key)) {
        this.makeRectTexture(a.key, a.w, a.h, a.color);
      }
    }

    if (!this.anims.exists('player_run')) {
      this.anims.create({
        key: 'player_run',
        frames: [
          { key: 'player_run0' },
          { key: 'player_run1' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }

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
