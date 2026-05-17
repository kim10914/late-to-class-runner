import {
  GAME_WIDTH, GAME_HEIGHT,
  MAX_STRIKES, COLLISION_PENALTY_SEC,
  COLORS
} from '../config/gameConfig.js';
import { formatTime } from '../util/format.js';

const BASE_STYLE = {
  fontFamily: 'Consolas, monospace',
  fontSize: '40px',
  color: COLORS.ui
};

// GameScene 상단 HUD + 진행도 바 + 배너 + 패널티 플래시까지 담당.
export default class Hud {
  constructor(scene, diff) {
    this.scene = scene;
    this.diff = diff;

    this.timeText   = scene.add.text(40, 32, '', BASE_STYLE);
    this.strikeText = scene.add.text(GAME_WIDTH - 40, 32, '', { ...BASE_STYLE, align: 'right' }).setOrigin(1, 0);
    this.speedText  = scene.add.text(40, 88, '', { ...BASE_STYLE, fontSize: '28px', color: '#aac8ff' });
    this.stageText  = scene.add.text(GAME_WIDTH - 40, 88, diff.longLabel, {
      ...BASE_STYLE, fontSize: '28px', color: '#aac8ff', align: 'right'
    }).setOrigin(1, 0);

    // 진행도 바
    const barW = GAME_WIDTH - 80;
    scene.add.rectangle(40, 160, barW, 16, 0x000000, 0.35).setOrigin(0, 0.5);
    this.progressFill = scene.add.rectangle(40, 160, 0, 16, 0xffd166).setOrigin(0, 0.5);
    this.progressMaxW = barW;

    this.banner = scene.add.text(GAME_WIDTH / 2, 260, '', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '72px',
      color: '#ffd166',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);

    this.penaltyText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '80px',
      color: COLORS.danger,
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);
  }

  flashBanner(text) {
    this.banner.setText(text).setAlpha(1).setScale(0.7);
    this.scene.tweens.add({ targets: this.banner, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.scene.tweens.add({ targets: this.banner, alpha: 0, delay: 1100, duration: 400 });
  }

  flashPenalty() {
    this.penaltyText.setText(`+${COLLISION_PENALTY_SEC}s`).setAlpha(1).setScale(1.4).setY(GAME_HEIGHT / 2);
    this.scene.tweens.add({
      targets: this.penaltyText,
      scale: 1,
      y: GAME_HEIGHT / 2 - 160,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut'
    });
  }

  // state = { elapsedSec, penaltySec, strikes, playerSpeed, distanceTraveled }
  update(state) {
    const totalTime = state.elapsedSec + state.penaltySec;
    const lateTime = this.diff.lateTimeSec;
    const remaining = Math.max(0, lateTime - totalTime);

    let timeLine = `TIME  ${formatTime(totalTime)}  /  지각 ${formatTime(lateTime)}`;
    if (state.penaltySec > 0) {
      timeLine += `  (+${state.penaltySec.toFixed(0)}s)`;
    }
    this.timeText.setText(timeLine);

    const ratio = totalTime / lateTime;
    if (ratio >= 0.95)      this.timeText.setColor(COLORS.danger);
    else if (ratio >= 0.8)  this.timeText.setColor(COLORS.warn);
    else                    this.timeText.setColor(COLORS.ui);

    this.strikeText.setText(`충돌 ${state.strikes}/${MAX_STRIKES}`);
    this.strikeText.setColor(state.strikes >= 2 ? COLORS.danger : (state.strikes === 1 ? COLORS.warn : COLORS.ui));

    const speedPct = Math.round((state.playerSpeed / this.diff.maxSpeed) * 100);
    this.speedText.setText(`SPEED  ${speedPct}%   |   남은 ${remaining.toFixed(0)}s`);

    const progress = Math.min(1, state.distanceTraveled / this.diff.stageLengthPx);
    this.progressFill.width = progress * this.progressMaxW;
  }
}
