import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

const ROWS = [
  { keys: '↑ ↓',   desc: '레인 이동 (상 / 중 / 하)' },
  { keys: '→',     desc: '가속 (오래 누를수록 더 빨라짐)' },
  { keys: '←',     desc: '브레이크 (감속 / 정지)' },
  { keys: 'Space', desc: '점프 — 카트, 물웅덩이 회피' },
  { keys: 'R',     desc: '재시작 (현재 난이도 유지)' },
  { keys: 'Esc',   desc: '메뉴로 돌아가기' }
];

const TIPS = [
  '• 사람 무리 / 닫히는 문 같은 큰 장애물은 2개 레인을 막아요 — 더 위 레인으로 피하세요',
  '• 충돌하면 +3초 패널티 + 즉시 정지. 3회 충돌 시 실패',
  '• 가속을 유지하려면 →를 계속 눌러야 함',
  '• 난이도별 베스트 기록은 자동 저장됩니다'
];

export default class ControlsScene extends Phaser.Scene {
  constructor() {
    super('Controls');
  }

  create() {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a1f2b).setOrigin(0);

    this.add.text(cx, 100, '조작법', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '80px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const startY = 220;
    const lineH = 64;
    const keyColX = GAME_WIDTH * 0.32;
    const descColX = GAME_WIDTH * 0.4;

    ROWS.forEach((row, i) => {
      const y = startY + i * lineH;
      this.add.text(keyColX, y, row.keys, {
        fontFamily: 'Consolas, monospace',
        fontSize: '40px',
        color: '#ffd166',
        align: 'right'
      }).setOrigin(1, 0.5);

      this.add.text(descColX, y, row.desc, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '36px',
        color: '#dddddd'
      }).setOrigin(0, 0.5);
    });

    const tipsStartY = startY + ROWS.length * lineH + 60;
    this.add.text(cx, tipsStartY, '— 팁 —', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '32px',
      color: '#aac8ff'
    }).setOrigin(0.5);

    TIPS.forEach((tip, i) => {
      this.add.text(GAME_WIDTH * 0.15, tipsStartY + 52 + i * 44, tip, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '28px',
        color: '#aaaaaa'
      });
    });

    const backBg = this.add.rectangle(cx, GAME_HEIGHT - 100, 520, 100, 0x2a313d)
      .setStrokeStyle(6, 0xffd166);
    this.add.text(cx, GAME_HEIGHT - 100, '돌아가기 (Esc / Enter)', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '36px',
      color: '#ffd166',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    backBg.setInteractive({ useHandCursor: true });
    backBg.on('pointerdown', () => this.goBack());

    const kb = this.input.keyboard;
    kb.on('keydown-ESC',   () => this.goBack());
    kb.on('keydown-ENTER', () => this.goBack());
    kb.on('keydown-SPACE', () => this.goBack());
  }

  goBack() {
    this.scene.start('Title');
  }
}
