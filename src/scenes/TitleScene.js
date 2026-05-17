import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { AudioManager } from '../audio/AudioManager.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a1f2b).setOrigin(0);

    this.add.text(cx, GAME_HEIGHT * 0.28, '강의실 지각 러너', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '120px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, GAME_HEIGHT * 0.28 + 120, '제한 시간 안에 강의실로 — 스피드런 모드', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '36px',
      color: '#aac8ff'
    }).setOrigin(0.5);

    this.buttons = [
      this.buildButton(cx, GAME_HEIGHT * 0.54,        '게임 시작',         () => this.scene.start('Menu')),
      this.buildButton(cx, GAME_HEIGHT * 0.54 + 140,  '조작법 알아보기',    () => this.scene.start('Controls')),
      this.buildButton(cx, GAME_HEIGHT * 0.54 + 280,  '설정',             () => this.scene.start('Settings'))
    ];

    this.selectedIndex = 0;
    this.refreshSelection();

    this.add.text(cx, GAME_HEIGHT - 60, '↑ ↓ 선택   Enter 확인   M 음소거', {
      fontFamily: 'Consolas, monospace',
      fontSize: '28px',
      color: '#666'
    }).setOrigin(0.5);

    const kb = this.input.keyboard;
    kb.on('keydown-UP',    () => this.moveSelection(-1));
    kb.on('keydown-DOWN',  () => this.moveSelection(+1));
    kb.on('keydown-ENTER', () => this.activate());
    kb.on('keydown-SPACE', () => this.activate());
    kb.on('keydown-M',     () => AudioManager.toggleMute());

    AudioManager.playBgm(this, 'bgm_menu');
  }

  buildButton(x, y, label, onClick) {
    const w = 640;
    const h = 128;
    const bg = this.add.rectangle(x, y, w, h, 0x2a313d).setStrokeStyle(6, 0x4a5466);
    const text = this.add.text(x, y, label, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      this.selectedIndex = this.buttons.findIndex(b => b && b.bg === bg);
      this.refreshSelection();
    });
    bg.on('pointerdown', onClick);

    return { bg, text, onClick };
  }

  moveSelection(direction) {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + direction, 0, this.buttons.length);
    this.refreshSelection();
    AudioManager.playSfx(this, 'sfx_ui', { volume: 0.5 });
  }

  refreshSelection() {
    this.buttons.forEach((btn, i) => {
      const selected = i === this.selectedIndex;
      btn.bg.setStrokeStyle(selected ? 8 : 4, selected ? 0xffd166 : 0x4a5466);
      btn.bg.setFillStyle(selected ? 0x3a4254 : 0x2a313d);
      btn.text.setColor(selected ? '#ffd166' : '#ffffff');
    });
  }

  activate() {
    const btn = this.buttons[this.selectedIndex];
    if (btn && btn.onClick) {
      AudioManager.playSfx(this, 'sfx_ui');
      btn.onClick();
    }
  }
}
