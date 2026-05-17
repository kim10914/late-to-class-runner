import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.result = data.result || 'fail';
    this.score = data.score || 0;
    this.reason = data.reason || '';
    this.stageReached = data.stageReached || 1;
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const isWin = this.result === 'clear';
    const title = isWin ? '강의실 도착!' : '지각!';
    const titleColor = isWin ? '#06d6a0' : '#ef476f';

    this.add.text(cx, cy - 100, title, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '64px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    if (this.reason) {
      this.add.text(cx, cy - 40, this.reason, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '20px',
        color: '#cccccc'
      }).setOrigin(0.5);
    }

    this.add.text(cx, cy + 10, `점수 : ${this.score}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 50, `도달 스테이지 : ${this.stageReached}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#aac8ff'
    }).setOrigin(0.5);

    const hint = this.add.text(cx, cy + 130, 'R 다시 시작     Esc 메뉴', {
      fontFamily: 'Consolas, monospace',
      fontSize: '20px',
      color: '#ffd166'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.4,
      yoyo: true,
      repeat: -1,
      duration: 700
    });

    this.input.keyboard.once('keydown-R', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Menu'));
  }
}
