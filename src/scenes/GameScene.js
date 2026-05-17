import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Obstacle from '../objects/Obstacle.js';
import Background from '../game/Background.js';
import Hud from '../game/Hud.js';
import { startCountdown } from '../game/Countdown.js';
import { AudioManager } from '../audio/AudioManager.js';
import {
  LANE_Y,
  DIFFICULTIES, OBSTACLE_TYPES,
  ACCEL_FORWARD, BRAKE_BACKWARD, COAST_DECEL, MIN_SPEED, ACCEL_RAMP,
  MAX_STRIKES, COLLISION_PENALTY_SEC
} from '../config/gameConfig.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.difficultyId = data.difficultyId || 'easy';
    this.diff = DIFFICULTIES[this.difficultyId];
  }

  create() {
    this.playerSpeed = 0;
    this.holdTime = 0;
    this.distanceTraveled = 0;
    this.elapsedSec = 0;
    this.penaltySec = 0;
    this.strikes = 0;
    this.isOver = false;
    this.gameStarted = false;
    this.spawnTimer = 0;
    this.nextSpawnDelay = 600;

    this.background = new Background(this, this.diff.bgKey);
    this.player = new Player(this);
    this.obstacles = this.physics.add.group();
    this.hud = new Hud(this, this.diff);

    this.physics.add.overlap(
      this.player.sprite,
      this.obstacles,
      (_, obstacle) => this.handleHit(obstacle),
      null,
      this
    );

    this.bindInput();
    this.refreshHud();

    startCountdown(this, this.diff.longLabel, () => { this.gameStarted = true; });

    AudioManager.playBgm(this, `bgm_${this.difficultyId}`);
  }

  bindInput() {
    const kb = this.input.keyboard;
    this.keys = kb.addKeys({
      LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
      RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT
    });
    const playable = (fn) => () => { if (this.gameStarted && !this.isOver) fn(); };
    kb.on('keydown-UP',    playable(() => this.player.changeLane(-1)));
    kb.on('keydown-DOWN',  playable(() => this.player.changeLane(+1)));
    kb.on('keydown-SPACE', playable(() => this.player.jump()));
    kb.on('keydown-R',     () => this.scene.restart({ difficultyId: this.difficultyId }));
    kb.on('keydown-ESC',   () => this.scene.start('Menu'));
    kb.on('keydown-M',     () => AudioManager.toggleMute());
  }

  update(_, deltaMs) {
    if (this.isOver) return;
    if (!this.gameStarted) return;

    const dt = deltaMs / 1000;
    this.elapsedSec += dt;

    this.updateSpeed(dt);
    const moved = this.playerSpeed * dt;
    this.distanceTraveled += moved;

    this.background.scroll(moved);
    this.scrollObstacles(moved);

    this.maybeSpawnObstacle(deltaMs);

    if (this.distanceTraveled >= this.diff.stageLengthPx) {
      this.endGame('clear');
      return;
    }
    if (this.strikes >= MAX_STRIKES) {
      this.endGame('fail', '충돌이 너무 많아요');
      return;
    }
    if (this.elapsedSec + this.penaltySec >= this.diff.lateTimeSec) {
      this.endGame('fail', '지각! 시간 초과');
      return;
    }

    this.refreshHud();
  }

  updateSpeed(dt) {
    const forward = this.keys.RIGHT.isDown;
    const brake   = this.keys.LEFT.isDown;

    if (forward) {
      this.holdTime += dt;
      const rampMul = 1 + Math.min(this.holdTime / 5, 1) * (ACCEL_RAMP - 1);
      this.playerSpeed += ACCEL_FORWARD * rampMul * dt;
    } else if (brake) {
      this.holdTime = 0;
      this.playerSpeed -= BRAKE_BACKWARD * dt;
    } else {
      this.holdTime = 0;
      this.playerSpeed -= COAST_DECEL * dt;
    }
    this.playerSpeed = Phaser.Math.Clamp(this.playerSpeed, MIN_SPEED, this.diff.maxSpeed);
  }

  scrollObstacles(moved) {
    this.obstacles.children.iterate((obs) => {
      if (!obs) return;
      obs.x -= moved;
      if (obs.x < -obs.width) obs.destroy();
    });
  }

  maybeSpawnObstacle(deltaMs) {
    if (this.playerSpeed <= 30) return;
    this.spawnTimer += deltaMs;
    if (this.spawnTimer < this.nextSpawnDelay) return;

    this.spawnTimer = 0;
    this.spawnObstacle();
    const [minGap, maxGap] = this.diff.spawnGapMs;
    const speedRatio = this.playerSpeed / this.diff.maxSpeed;
    this.nextSpawnDelay = Phaser.Math.Between(minGap, maxGap) / Math.max(0.4, speedRatio);
  }

  spawnObstacle() {
    const allowed = this.diff.allowedObstacles;
    const typeKey = Phaser.Utils.Array.GetRandom(allowed);
    const def = OBSTACLE_TYPES[typeKey];
    const spans = def.spans || 1;
    const baseLane = Phaser.Math.Between(spans - 1, LANE_Y.length - 1);
    Obstacle.spawn(this, this.obstacles, typeKey, baseLane);
  }

  handleHit(obstacle) {
    if (this.player.isInvulnerable()) return;
    if (obstacle.getData('scored')) return;

    const dodge = obstacle.getData('dodge');
    const state = this.player.state;

    if (dodge === 'jump' && state === 'jump') return;
    if (dodge === 'lane') {
      const blockedLanes = obstacle.getData('laneIndices') || [];
      if (!blockedLanes.includes(this.player.laneIndex)) return;
    }

    this.strikes += 1;
    this.penaltySec += COLLISION_PENALTY_SEC;
    this.playerSpeed = 0;
    this.holdTime = 0;
    this.player.setInvulnerable(900);
    this.cameras.main.shake(180, 0.008);
    this.hud.flashPenalty();
    AudioManager.playSfx(this, 'sfx_hit');

    obstacle.setData('scored', true);
  }

  refreshHud() {
    this.hud.update({
      elapsedSec: this.elapsedSec,
      penaltySec: this.penaltySec,
      strikes: this.strikes,
      playerSpeed: this.playerSpeed,
      distanceTraveled: this.distanceTraveled
    });
  }

  endGame(result, reason = '') {
    if (this.isOver) return;
    this.isOver = true;
    this.physics.world.pause();
    AudioManager.playSfx(this, result === 'clear' ? 'sfx_clear' : 'sfx_fail');
    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(450, () => {
      this.scene.start('GameOver', {
        result,
        reason,
        difficultyId: this.difficultyId,
        finishTime: this.elapsedSec + this.penaltySec,
        baseTime: this.elapsedSec,
        penaltySec: this.penaltySec,
        strikes: this.strikes
      });
    });
  }
}
