import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.text(cx, cy - 120, '강의실 지각 러너', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '52px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, cy - 60, '제한 시간 내에 강의실까지 도착하라', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#aac8ff'
    }).setOrigin(0.5);

    const instructions = [
      '↑ ↓     : 레인 이동',
      'Space   : 점프',
      'S       : 슬라이드',
      'R       : 재시작'
    ];
    this.add.text(cx, cy + 10, instructions.join('\n'), {
      fontFamily: 'Consolas, monospace',
      fontSize: '18px',
      color: '#dddddd',
      align: 'center'
    }).setOrigin(0.5);

    const startText = this.add.text(cx, cy + 150, '▶ Space 또는 Enter 를 눌러 시작', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '22px',
      color: '#ffd166'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.4,
      yoyo: true,
      repeat: -1,
      duration: 700
    });

    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());
  }

  startGame() {
    this.scene.start('Game');
  }
}
