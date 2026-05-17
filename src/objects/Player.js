import Phaser from 'phaser';
import {
  LANE_Y, PLAYER_X, PLAYER_SIZE,
  LANE_CHANGE_MS, JUMP_HEIGHT_PX, JUMP_DURATION_MS
} from '../config/gameConfig.js';

export default class Player {
  constructor(scene) {
    this.scene = scene;
    this.laneIndex = 1;
    this.isJumping = false;
    this.invulnUntil = 0;

    this.sprite = scene.physics.add.sprite(PLAYER_X, LANE_Y[this.laneIndex], 'player_run0');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDisplaySize(PLAYER_SIZE, PLAYER_SIZE);
    this.sprite.body.setAllowGravity(false);

    const src = this.sprite.texture.getSourceImage();
    this.nativeW = src.width;
    this.nativeH = src.height;
    this.applyStandingBody();

    if (scene.anims.exists('player_run')) {
      this.sprite.play('player_run');
    }

    this.baseY = LANE_Y[this.laneIndex];
  }

  applyStandingBody() {
    this.sprite.body.setSize(this.nativeW * 0.7, this.nativeH * 0.9);
    this.sprite.body.setOffset(this.nativeW * 0.15, this.nativeH * 0.1);
  }

  changeLane(direction) {
    const target = Phaser.Math.Clamp(this.laneIndex + direction, 0, LANE_Y.length - 1);
    if (target === this.laneIndex) return;
    this.laneIndex = target;
    this.baseY = LANE_Y[target];

    this.scene.tweens.add({
      targets: this.sprite,
      y: this.isJumping ? this.baseY - JUMP_HEIGHT_PX : this.baseY,
      duration: LANE_CHANGE_MS,
      ease: 'Sine.easeOut'
    });
  }

  jump() {
    if (this.isJumping) return;
    this.isJumping = true;

    this.scene.tweens.add({
      targets: this.sprite,
      y: this.baseY - JUMP_HEIGHT_PX,
      duration: JUMP_DURATION_MS / 2,
      ease: 'Sine.easeOut',
      yoyo: true,
      onYoyo: () => {
        this.scene.tweens.add({
          targets: this.sprite,
          y: this.baseY,
          duration: JUMP_DURATION_MS / 2,
          ease: 'Sine.easeIn'
        });
      },
      onComplete: () => {
        this.isJumping = false;
        this.sprite.y = this.baseY;
      }
    });
  }

  get state() {
    return this.isJumping ? 'jump' : 'run';
  }

  setInvulnerable(durationMs) {
    this.invulnUntil = this.scene.time.now + durationMs;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      yoyo: true,
      repeat: Math.floor(durationMs / 120),
      duration: 60,
      onComplete: () => { this.sprite.alpha = 1; }
    });
  }

  isInvulnerable() {
    return this.scene.time.now < this.invulnUntil;
  }
}
