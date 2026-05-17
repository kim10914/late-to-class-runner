import Phaser from 'phaser';
import {
  LANE_Y, PLAYER_X, PLAYER_SIZE, PLAYER_SLIDE_HEIGHT,
  LANE_CHANGE_MS, JUMP_HEIGHT_PX, JUMP_DURATION_MS, SLIDE_DURATION_MS
} from '../config/gameConfig.js';

export default class Player {
  constructor(scene) {
    this.scene = scene;
    this.laneIndex = 1;
    this.isJumping = false;
    this.isSliding = false;
    this.invulnUntil = 0;

    this.sprite = scene.physics.add.sprite(PLAYER_X, LANE_Y[this.laneIndex], 'player_rect');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setSize(PLAYER_SIZE * 0.7, PLAYER_SIZE * 0.9);
    this.sprite.body.setOffset(PLAYER_SIZE * 0.15, PLAYER_SIZE * 0.1);

    this.baseY = LANE_Y[this.laneIndex];
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
    if (this.isJumping || this.isSliding) return;
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

  slide() {
    if (this.isSliding || this.isJumping) return;
    this.isSliding = true;

    this.sprite.body.setSize(PLAYER_SIZE * 0.7, PLAYER_SLIDE_HEIGHT);
    this.sprite.body.setOffset(PLAYER_SIZE * 0.15, PLAYER_SIZE - PLAYER_SLIDE_HEIGHT);
    this.sprite.setScale(1, PLAYER_SLIDE_HEIGHT / PLAYER_SIZE);

    this.scene.time.delayedCall(SLIDE_DURATION_MS, () => {
      this.sprite.setScale(1, 1);
      this.sprite.body.setSize(PLAYER_SIZE * 0.7, PLAYER_SIZE * 0.9);
      this.sprite.body.setOffset(PLAYER_SIZE * 0.15, PLAYER_SIZE * 0.1);
      this.isSliding = false;
    });
  }

  get state() {
    if (this.isJumping) return 'jump';
    if (this.isSliding) return 'slide';
    return 'run';
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
