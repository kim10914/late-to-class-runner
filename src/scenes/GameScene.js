import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Obstacle from '../objects/Obstacle.js';
import {
  GAME_WIDTH, GAME_HEIGHT, LANE_Y,
  DIFFICULTIES, OBSTACLE_TYPES,
  ACCEL_FORWARD, BRAKE_BACKWARD, COAST_DECEL, MIN_SPEED, ACCEL_RAMP,
  MAX_STRIKES, COLLISION_PENALTY_SEC,
  COUNTDOWN_SEQUENCE, COUNTDOWN_STEP_MS,
  COLORS
} from '../config/gameConfig.js';

function formatTime(seconds) {
  if (seconds == null || !isFinite(seconds)) return '--:--.--';
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  const cs = Math.floor((safe * 100) % 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

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

    this.buildBackground();
    this.player = new Player(this);
    this.obstacles = this.physics.add.group();

    this.physics.add.overlap(
      this.player.sprite,
      this.obstacles,
      (_, obstacle) => this.handleHit(obstacle),
      null,
      this
    );

    this.bindInput();
    this.buildHud();
    this.startCountdown();
  }

  startCountdown() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const stageBanner = this.add.text(cx, GAME_HEIGHT * 0.25, this.diff.longLabel, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '60px',
      color: '#ffd166',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const countText = this.add.text(cx, cy, '', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '280px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);

    const showStep = (index) => {
      if (index >= COUNTDOWN_SEQUENCE.length) {
        countText.destroy();
        stageBanner.destroy();
        this.gameStarted = true;
        return;
      }
      const label = COUNTDOWN_SEQUENCE[index];
      const isGo = index === COUNTDOWN_SEQUENCE.length - 1;
      countText.setText(label)
        .setColor(isGo ? '#06d6a0' : '#ffffff')
        .setScale(0.5)
        .setAlpha(1);

      this.tweens.add({
        targets: countText,
        scale: isGo ? 1.4 : 1.1,
        duration: 250,
        ease: 'Back.easeOut'
      });
      this.tweens.add({
        targets: countText,
        alpha: 0,
        delay: COUNTDOWN_STEP_MS - 250,
        duration: 200,
        onComplete: () => showStep(index + 1)
      });
    };

    showStep(0);
  }

  buildBackground() {
    this.bgImage = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, this.diff.bgKey).setOrigin(0, 0);
    const tex = this.textures.get(this.diff.bgKey).getSourceImage();
    if (tex && tex.height) {
      const scale = GAME_HEIGHT / tex.height;
      this.bgImage.setTileScale(scale, scale);
    }

    const groundTop = LANE_Y[0] - 20;
    this.add.rectangle(0, groundTop, GAME_WIDTH, GAME_HEIGHT - groundTop, COLORS.ground, 0.5).setOrigin(0);

    this.laneLines = [];
    for (let i = 0; i < LANE_Y.length; i++) {
      const line = this.add.rectangle(0, LANE_Y[i] + 4, GAME_WIDTH, 4, COLORS.laneLine).setOrigin(0);
      this.laneLines.push(line);
    }

    this.scrollMarkers = this.add.group();
    for (let i = 0; i < 12; i++) {
      const x = (i / 12) * GAME_WIDTH;
      const mark = this.add.rectangle(x, GAME_HEIGHT - 12, 80, 8, 0x4a5466, 0.8).setOrigin(0, 0.5);
      this.scrollMarkers.add(mark);
    }
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
  }

  buildHud() {
    const style = {
      fontFamily: 'Consolas, monospace',
      fontSize: '40px',
      color: COLORS.ui
    };

    this.timeText   = this.add.text(40, 32, '', style);
    this.strikeText = this.add.text(GAME_WIDTH - 40, 32, '', { ...style, align: 'right' }).setOrigin(1, 0);
    this.speedText  = this.add.text(40, 88, '', { ...style, fontSize: '28px', color: '#aac8ff' });
    this.stageText  = this.add.text(GAME_WIDTH - 40, 88, this.diff.longLabel, {
      ...style, fontSize: '28px', color: '#aac8ff', align: 'right'
    }).setOrigin(1, 0);

    // 진행도 바
    const barW = GAME_WIDTH - 80;
    this.add.rectangle(40, 160, barW, 16, 0x000000, 0.35).setOrigin(0, 0.5);
    this.progressFill = this.add.rectangle(40, 160, 0, 16, 0xffd166).setOrigin(0, 0.5);
    this.progressMaxW = barW;

    this.banner = this.add.text(GAME_WIDTH / 2, 260, '', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '72px',
      color: '#ffd166',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);

    this.penaltyText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '80px',
      color: COLORS.danger,
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);

    this.updateHud();
  }

  flashBanner(text) {
    this.banner.setText(text).setAlpha(1).setScale(0.7);
    this.tweens.add({ targets: this.banner, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.banner, alpha: 0, delay: 1100, duration: 400 });
  }

  flashPenalty() {
    this.penaltyText.setText(`+${COLLISION_PENALTY_SEC}s`).setAlpha(1).setScale(1.4).setY(GAME_HEIGHT / 2);
    this.tweens.add({
      targets: this.penaltyText,
      scale: 1,
      y: GAME_HEIGHT / 2 - 160,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut'
    });
  }

  updateHud() {
    const totalTime = this.elapsedSec + this.penaltySec;
    const lateTime = this.diff.lateTimeSec;
    const remaining = Math.max(0, lateTime - totalTime);

    let timeLine = `TIME  ${formatTime(totalTime)}  /  지각 ${formatTime(lateTime)}`;
    if (this.penaltySec > 0) {
      timeLine += `  (+${this.penaltySec.toFixed(0)}s)`;
    }
    this.timeText.setText(timeLine);

    // 지각 임박 시 색상 경고
    const ratio = totalTime / lateTime;
    if (ratio >= 0.95)      this.timeText.setColor(COLORS.danger);
    else if (ratio >= 0.8)  this.timeText.setColor(COLORS.warn);
    else                    this.timeText.setColor(COLORS.ui);

    this.strikeText.setText(`충돌 ${this.strikes}/${MAX_STRIKES}`);
    this.strikeText.setColor(this.strikes >= 2 ? COLORS.danger : (this.strikes === 1 ? COLORS.warn : COLORS.ui));

    const speedPct = Math.round((this.playerSpeed / this.diff.maxSpeed) * 100);
    this.speedText.setText(`SPEED  ${speedPct}%   |   남은 ${remaining.toFixed(0)}s`);

    const progress = Math.min(1, this.distanceTraveled / this.diff.stageLengthPx);
    this.progressFill.width = progress * this.progressMaxW;
  }

  update(_, deltaMs) {
    if (this.isOver) return;
    if (!this.gameStarted) return;

    const dt = deltaMs / 1000;
    this.elapsedSec += dt;

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

    const moved = this.playerSpeed * dt;
    this.distanceTraveled += moved;

    this.bgImage.tilePositionX += moved * 0.3;

    this.scrollMarkers.children.iterate((m) => {
      if (!m) return;
      m.x -= moved;
      if (m.x < -m.width) m.x += GAME_WIDTH + m.width;
    });

    this.obstacles.children.iterate((obs) => {
      if (!obs) return;
      obs.x -= moved;
      if (obs.x < -obs.width) obs.destroy();
    });

    if (this.playerSpeed > 30) {
      this.spawnTimer += deltaMs;
      if (this.spawnTimer >= this.nextSpawnDelay) {
        this.spawnTimer = 0;
        this.spawnObstacle();
        const [minGap, maxGap] = this.diff.spawnGapMs;
        const speedRatio = this.playerSpeed / this.diff.maxSpeed;
        const gap = Phaser.Math.Between(minGap, maxGap) / Math.max(0.4, speedRatio);
        this.nextSpawnDelay = gap;
      }
    }

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

    this.updateHud();
  }

  spawnObstacle() {
    const allowed = this.diff.allowedObstacles;
    const typeKey = Phaser.Utils.Array.GetRandom(allowed);
    const def = OBSTACLE_TYPES[typeKey];
    const spans = def.spans || 1;
    // spans=2 인 장애물은 base 레인이 최소 (spans-1) 이상이어야 위로 spans개 차지 가능
    const baseLane = Phaser.Math.Between(spans - 1, LANE_Y.length - 1);
    Obstacle.spawn(this, this.obstacles, typeKey, baseLane);
  }

  handleHit(obstacle) {
    if (this.player.isInvulnerable()) return;
    if (obstacle.getData('scored')) return;

    const dodge = obstacle.getData('dodge');
    const state = this.player.state;

    if (dodge === 'jump' && state === 'jump') return; // 점프로 회피
    if (dodge === 'lane') {
      const blockedLanes = obstacle.getData('laneIndices') || [];
      if (!blockedLanes.includes(this.player.laneIndex)) return; // 다른 레인이라 안 맞음
    }

    this.strikes += 1;
    this.penaltySec += COLLISION_PENALTY_SEC;
    this.playerSpeed = 0;
    this.holdTime = 0;
    this.player.setInvulnerable(900);
    this.cameras.main.shake(180, 0.008);
    this.flashPenalty();

    obstacle.setData('scored', true);
  }

  endGame(result, reason = '') {
    if (this.isOver) return;
    this.isOver = true;
    this.physics.world.pause();
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
