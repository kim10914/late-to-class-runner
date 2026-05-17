import Phaser from 'phaser';
import { IMAGE_MANIFEST, BGM_KEYS, SFX_KEYS, PLAYER_RUN_ANIM } from '../config/assets.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    for (const a of IMAGE_MANIFEST) {
      this.load.image(a.key, `assets/${a.key}.png`);
    }
    for (const key of BGM_KEYS) {
      this.load.audio(key, [`assets/${key}.mp3`]);
    }
    for (const key of SFX_KEYS) {
      this.load.audio(key, [`assets/${key}.mp3`]);
    }
    this.load.on('loaderror', (file) => {
      console.warn(`[BootScene] asset missing: ${file.src}`);
    });
  }

  create() {
    // 없는 이미지는 단색 사각형으로 fallback
    for (const a of IMAGE_MANIFEST) {
      if (!this.textures.exists(a.key)) {
        this.makeRectTexture(a.key, a.w, a.h, a.color);
      }
    }

    if (!this.anims.exists(PLAYER_RUN_ANIM.key)) {
      this.anims.create({
        key: PLAYER_RUN_ANIM.key,
        frames: PLAYER_RUN_ANIM.frames.map(key => ({ key })),
        frameRate: PLAYER_RUN_ANIM.frameRate,
        repeat: PLAYER_RUN_ANIM.repeat
      });
    }

    this.scene.start('Title');
  }

  makeRectTexture(key, w, h, color) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
