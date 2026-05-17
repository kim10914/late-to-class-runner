import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Obstacle from '../objects/Obstacle.js';
import {
  GAME_WIDTH, GAME_HEIGHT, LANE_Y,
  BASE_SCROLL_SPEED, SPEED_RAMP_PER_SEC, MAX_SCROLL_SPEED,
  STARTING_TIME_SEC, MAX_STRIKES,
  OBSTACLE_MIN_GAP_MS, OBSTACLE_MAX_GAP_MS,
  STAGES, COLORS
} from '../config/gameConfig.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.scrollSpeed = BASE_SCROLL_SPEED;
    this.elapsedSec = 0;
    this.timeLeftSec = STARTING_TIME_SEC;
    this.strikes = 0;
    this.score = 0;
    this.stageIndex = 0;
    this.stageTimeSec = 0;
    this.isOver = false;
    this.spawnTimer = 0;
    this.nextSpawnDelay = 1000;

    this.buildBackground();
    this.player = new Player(this);
    this.obstacles = this.physics.add.group();

    this.physics.add.overlap(
      this.player.sprite,
      this.obstacles,
      (playerSprite, obstacle) => this.handleHit(obstacle),
      null,
      this
    );

    this.bindInput();
    this.buildHud();

    this.flashBanner(`Stage ${STAGES[0].id} : ${STAGES[0].name}`);
  }

  buildBackground() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.bg).setOrigin(0);

    const groundTop = LANE_Y[0] - 10;
    this.add.rectangle(0, groundTop, GAME_WIDTH, GAME_HEIGHT - groundTop, COLORS.ground).setOrigin(0);

    this.laneLines = [];
    for (let i = 0; i < LANE_Y.length; i++) {
      const line = this.add.rectangle(0, LANE_Y[i] + 2, GAME_WIDTH, 2, COLORS.laneLine).setOrigin(0);
      this.laneLines.push(line);
    }

    this.scrollMarkers = this.add.group();
    for (let i = 0; i < 12; i++) {
      const x = (i / 12) * GAME_WIDTH;
      const mark = this.add.rectangle(x, GAME_HEIGHT - 6, 40, 4, 0x4a5466).setOrigin(0, 0.5);
      this.scrollMarkers.add(mark);
    }
  }

  bindInput() {
    const kb = this.input.keyboard;
    this.keys = kb.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      W: Phaser.Input.Keyboard.KeyCodes.W,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      R: Phaser.Input.Keyboard.KeyCodes.R
    });

    kb.on('keydown-LEFT',  () => this.player.changeLane(-1));
    kb.on('keydown-A',     () => this.player.changeLane(-1));
    kb.on('keydown-RIGHT', () => this.player.changeLane(+1));
    kb.on('keydown-D',     () => this.player.changeLane(+1));
    kb.on('keydown-SPACE', () => this.player.jump());
    kb.on('keydown-UP',    () => this.player.jump());
    kb.on('keydown-W',     () => this.player.jump());
    kb.on('keydown-DOWN',  () => this.player.slide());
    kb.on('keydown-S',     () => this.player.slide());
    kb.on('keydown-R',     () => this.scene.restart());
  }

  buildHud() {
    const style = {
      fontFamily: 'Consolas, monospace',
      fontSize: '20px',
      color: COLORS.ui
    };

    this.timeText   = this.add.text(20, 16, '', style);
    this.scoreText  = this.add.text(20, 44, '', style);
    this.stageText  = this.add.text(GAME_WIDTH - 20, 16, '', { ...style, align: 'right' }).setOrigin(1, 0);
    this.strikeText = this.add.text(GAME_WIDTH - 20, 44, '', { ...style, align: 'right' }).setOrigin(1, 0);

    this.banner = this.add.text(GAME_WIDTH / 2, 100, '', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '40px',
      color: '#ffd166',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);

    this.updateHud();
  }

  flashBanner(text) {
    this.banner.setText(text).setAlpha(1).setScale(0.7);
    this.tweens.add({
      targets: this.banner,
      scale: 1,
      duration: 250,
      ease: 'Back.easeOut'
    });
    this.tweens.add({
      targets: this.banner,
      alpha: 0,
      delay: 1100,
      duration: 400
    });
  }

  updateHud() {
    const t = Math.max(0, Math.ceil(this.timeLeftSec));
    const stage = STAGES[this.stageIndex];
    this.timeText.setText(`남은 시간 : ${t}s`);
    this.scoreText.setText(`점수 : ${this.score}`);
    this.stageText.setText(`Stage ${stage.id} - ${stage.name}`);
    this.strikeText.setText(`충돌 ${this.strikes}/${MAX_STRIKES}`);

    if (t <= 10) this.timeText.setColor(COLORS.danger);
    else if (t <= 20) this.timeText.setColor(COLORS.warn);
    else this.timeText.setColor(COLORS.ui);
  }

  update(_, deltaMs) {
    if (this.isOver) return;

    const dt = deltaMs / 1000;
    this.elapsedSec += dt;
    this.timeLeftSec -= dt;
    this.stageTimeSec += dt;

    this.scrollSpeed = Math.min(
      MAX_SCROLL_SPEED,
      BASE_SCROLL_SPEED * STAGES[this.stageIndex].speedMul + SPEED_RAMP_PER_SEC * this.elapsedSec
    );

    this.scrollMarkers.children.iterate((m) => {
      if (!m) return;
      m.x -= this.scrollSpeed * dt;
      if (m.x < -m.width) m.x = GAME_WIDTH + m.width;
    });

    this.obstacles.children.iterate((obs) => {
      if (!obs) return;
      obs.x -= this.scrollSpeed * dt;
      if (obs.x < -obs.width) {
        if (!obs.getData('scored')) {
          this.score += 10;
          obs.setData('scored', true);
        }
        obs.destroy();
      }
    });

    this.spawnTimer += deltaMs;
    if (this.spawnTimer >= this.nextSpawnDelay) {
      this.spawnTimer = 0;
      this.spawnObstacle();
      const gapMul = MAX_SCROLL_SPEED / this.scrollSpeed;
      this.nextSpawnDelay = Phaser.Math.Between(OBSTACLE_MIN_GAP_MS, OBSTACLE_MAX_GAP_MS) * gapMul;
    }

    if (this.stageTimeSec >= STAGES[this.stageIndex].durationSec) {
      this.advanceStage();
    }

    if (this.timeLeftSec <= 0) {
      this.endGame('fail', '시간 초과!');
      return;
    }
    if (this.strikes >= MAX_STRIKES) {
      this.endGame('fail', '충돌이 너무 많아요');
      return;
    }

    this.updateHud();
  }

  advanceStage() {
    if (this.stageIndex >= STAGES.length - 1) {
      this.endGame('clear', '강의실 도착!');
      return;
    }
    this.stageIndex += 1;
    this.stageTimeSec = 0;
    const stage = STAGES[this.stageIndex];
    this.timeLeftSec += 10;
    this.flashBanner(`Stage ${stage.id} : ${stage.name}`);
  }

  spawnObstacle() {
    const allowed = STAGES[this.stageIndex].allowedObstacles;
    const typeKey = Phaser.Utils.Array.GetRandom(allowed);
    const lane = Phaser.Math.Between(0, LANE_Y.length - 1);
    Obstacle.spawn(this, this.obstacles, typeKey, lane);
  }

  handleHit(obstacle) {
    if (this.player.isInvulnerable()) return;

    const dodge = obstacle.getData('dodge');
    const state = this.player.state;

    const dodged =
      (dodge === 'jump'  && state === 'jump')  ||
      (dodge === 'slide' && state === 'slide');

    if (dodged) return;
    if (dodge === 'lane' && obstacle.getData('laneIndex') !== this.player.laneIndex) return;

    this.strikes += 1;
    this.player.setInvulnerable(900);
    this.cameras.main.shake(120, 0.005);

    obstacle.setData('scored', true);
  }

  endGame(result, reason) {
    if (this.isOver) return;
    this.isOver = true;
    this.physics.world.pause();
    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(450, () => {
      this.scene.start('GameOver', {
        result,
        reason,
        score: this.score,
        stageReached: STAGES[this.stageIndex].id
      });
    });
  }
}
