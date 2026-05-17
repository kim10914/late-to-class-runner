import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DIFFICULTIES, COLORS } from '../config/gameConfig.js';

const BEST_TIME_PREFIX = 'best_time_';

function formatTime(seconds) {
  if (seconds == null || !isFinite(seconds)) return '--:--.--';
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  const cs = Math.floor((safe * 100) % 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function loadBestTime(difficultyId) {
  const raw = localStorage.getItem(BEST_TIME_PREFIX + difficultyId);
  if (!raw) return null;
  const n = parseFloat(raw);
  return isFinite(n) ? n : null;
}

function saveBestTime(difficultyId, time) {
  localStorage.setItem(BEST_TIME_PREFIX + difficultyId, String(time));
}

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.result = data.result || 'fail';
    this.reason = data.reason || '';
    this.difficultyId = data.difficultyId || 'easy';
    this.finishTime = data.finishTime || 0;
    this.baseTime = data.baseTime || 0;
    this.penaltySec = data.penaltySec || 0;
    this.strikes = data.strikes || 0;
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const diff = DIFFICULTIES[this.difficultyId];
    const isWin = this.result === 'clear';

    const title = isWin ? '강의실 도착!' : '지각!';
    this.add.text(cx, 160, title, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '112px',
      color: isWin ? COLORS.good : COLORS.danger,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, 260, `${diff.longLabel} (난이도 ${diff.label})`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '36px',
      color: '#aac8ff'
    }).setOrigin(0.5);

    if (this.reason && !isWin) {
      this.add.text(cx, 316, this.reason, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '32px',
        color: '#cccccc'
      }).setOrigin(0.5);
    }

    let newRecord = false;
    if (isWin) {
      const prevBest = loadBestTime(this.difficultyId);
      if (prevBest == null || this.finishTime < prevBest) {
        saveBestTime(this.difficultyId, this.finishTime);
        newRecord = true;
      }
    }

    const timeLabel = isWin ? '기록' : '도달 시간';
    this.add.text(cx, cy - 60, timeLabel, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '36px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 24, formatTime(this.finishTime), {
      fontFamily: 'Consolas, monospace',
      fontSize: '128px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    if (this.penaltySec > 0) {
      this.add.text(cx, cy + 120,
        `(주행 ${formatTime(this.baseTime)} + 패널티 +${this.penaltySec.toFixed(0)}s · 충돌 ${this.strikes}회)`,
        {
          fontFamily: 'Consolas, monospace',
          fontSize: '28px',
          color: '#888'
        }
      ).setOrigin(0.5);
    }

    if (newRecord) {
      const rec = this.add.text(cx, cy + 200, '★ NEW RECORD ★', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '48px',
        color: COLORS.good,
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.tweens.add({ targets: rec, scale: 1.1, yoyo: true, repeat: -1, duration: 500 });
    } else if (isWin) {
      const best = loadBestTime(this.difficultyId);
      this.add.text(cx, cy + 200, `Best  ${formatTime(best)}`, {
        fontFamily: 'Consolas, monospace',
        fontSize: '36px',
        color: '#ffd166'
      }).setOrigin(0.5);
    }

    const hint = this.add.text(cx, GAME_HEIGHT - 100, 'R 다시 시작     Esc 메뉴', {
      fontFamily: 'Consolas, monospace',
      fontSize: '36px',
      color: '#ffd166'
    }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.4, yoyo: true, repeat: -1, duration: 700 });

    this.input.keyboard.once('keydown-R',   () => this.scene.start('Game', { difficultyId: this.difficultyId }));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Menu'));
  }
}
