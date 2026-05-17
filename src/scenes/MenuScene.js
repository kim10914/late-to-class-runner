import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DIFFICULTIES, DIFFICULTY_ORDER } from '../config/gameConfig.js';

const BEST_TIME_PREFIX = 'best_time_';

function formatTime(seconds) {
  if (seconds == null || !isFinite(seconds)) return '--:--.--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds * 100) % 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function loadBestTime(difficultyId) {
  const raw = localStorage.getItem(BEST_TIME_PREFIX + difficultyId);
  if (!raw) return null;
  const n = parseFloat(raw);
  return isFinite(n) ? n : null;
}

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a1f2b).setOrigin(0);

    this.add.text(cx, 120, '난이도 선택', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '80px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, 210, '← → 선택  ·  Enter 시작  ·  Esc 뒤로', {
      fontFamily: 'Consolas, monospace',
      fontSize: '28px',
      color: '#888'
    }).setOrigin(0.5);

    this.selectedIndex = 0;
    this.cards = DIFFICULTY_ORDER.map((id, i) => this.buildCard(id, i));
    this.refreshSelection();

    this.buildStartButton();

    const kb = this.input.keyboard;
    kb.on('keydown-LEFT',  () => this.moveSelection(-1));
    kb.on('keydown-RIGHT', () => this.moveSelection(+1));
    kb.on('keydown-ENTER', () => this.startGame());
    kb.on('keydown-SPACE', () => this.startGame());
    kb.on('keydown-ESC',   () => this.scene.start('Title'));
  }

  buildStartButton() {
    const cx = GAME_WIDTH / 2;
    const y = GAME_HEIGHT - 100;
    const bg = this.add.rectangle(cx, y, 480, 104, 0xffd166)
      .setStrokeStyle(6, 0xc9a13b);
    const text = this.add.text(cx, y, '게임 시작', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '44px',
      color: '#1a1f2b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.startGame());

    this.tweens.add({
      targets: [bg, text],
      scaleY: 1.03,
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: 'Sine.easeInOut'
    });
  }

  buildCard(difficultyId, index) {
    const diff = DIFFICULTIES[difficultyId];
    const gap = 520;
    const startX = GAME_WIDTH / 2 - gap;
    const x = startX + gap * index;
    const y = GAME_HEIGHT / 2 + 20;

    const bg = this.add.rectangle(x, y, 440, 440, 0x2a313d)
      .setStrokeStyle(6, 0x4a5466);

    const label = this.add.text(x, y - 140, diff.label, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '128px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const name = this.add.text(x, y - 10, diff.stageName, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '44px',
      color: '#aac8ff'
    }).setOrigin(0.5);

    const best = loadBestTime(difficultyId);
    const bestLabel = this.add.text(x, y + 70, `Best  ${formatTime(best)}`, {
      fontFamily: 'Consolas, monospace',
      fontSize: '32px',
      color: '#ffd166'
    }).setOrigin(0.5);

    const obstacleCount = diff.allowedObstacles.length;
    const lateSec = diff.lateTimeSec;
    const meta = this.add.text(x, y + 150,
      `장애물 ${obstacleCount}종 · 지각 ${lateSec}초`,
      {
        fontFamily: 'Consolas, monospace',
        fontSize: '24px',
        color: '#888'
      }
    ).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => { this.selectedIndex = index; this.refreshSelection(); });
    bg.on('pointerdown', () => { this.selectedIndex = index; this.startGame(); });

    return { difficultyId, bg, label, name, bestLabel, meta };
  }

  moveSelection(direction) {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + direction, 0, this.cards.length);
    this.refreshSelection();
  }

  refreshSelection() {
    this.cards.forEach((card, i) => {
      const selected = i === this.selectedIndex;
      card.bg.setStrokeStyle(selected ? 8 : 4, selected ? 0xffd166 : 0x4a5466);
      card.bg.setFillStyle(selected ? 0x3a4254 : 0x2a313d);
      card.label.setColor(selected ? '#ffd166' : '#ffffff');
    });
  }

  startGame() {
    const difficultyId = this.cards[this.selectedIndex].difficultyId;
    this.scene.start('Game', { difficultyId });
  }
}
