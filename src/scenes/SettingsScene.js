import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { AudioManager } from '../audio/AudioManager.js';

const TRACK_W = 600;
const TRACK_H = 14;
const HANDLE_RADIUS = 24;

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super('Settings');
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const settings = AudioManager.getSettings();

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a1f2b).setOrigin(0);

    this.add.text(cx, 140, '설정', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '96px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 볼륨 슬라이더
    const volY = GAME_HEIGHT * 0.42;
    this.add.text(cx, volY - 80, '볼륨', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '40px',
      color: '#aac8ff'
    }).setOrigin(0.5);

    this.volumeText = this.add.text(cx, volY - 80, '', {
      fontFamily: 'Consolas, monospace',
      fontSize: '32px',
      color: '#ffd166'
    }).setOrigin(0, 0.5).setX(cx + 70);

    this.buildVolumeSlider(cx, volY, settings.volume);

    // 음소거 토글
    const muteY = GAME_HEIGHT * 0.62;
    this.add.text(cx, muteY - 60, '음소거', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '40px',
      color: '#aac8ff'
    }).setOrigin(0.5);

    this.muteBg = this.add.rectangle(cx, muteY + 20, 320, 88, 0x2a313d)
      .setStrokeStyle(6, 0x4a5466);
    this.muteText = this.add.text(cx, muteY + 20, '', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.muteBg.setInteractive({ useHandCursor: true });
    this.muteBg.on('pointerdown', () => {
      AudioManager.toggleMute();
      AudioManager.playSfx(this, 'sfx_ui');
      this.refreshMute();
    });
    this.refreshMute();

    // 뒤로 가기
    const backBg = this.add.rectangle(cx, GAME_HEIGHT - 120, 480, 100, 0x2a313d)
      .setStrokeStyle(6, 0xffd166);
    this.add.text(cx, GAME_HEIGHT - 120, '돌아가기 (Esc)', {
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
    kb.on('keydown-LEFT',  () => this.nudgeVolume(-0.05));
    kb.on('keydown-RIGHT', () => this.nudgeVolume(+0.05));
    kb.on('keydown-M',     () => { AudioManager.toggleMute(); this.refreshMute(); });
  }

  buildVolumeSlider(cx, y, initialVolume) {
    const track = this.add.rectangle(cx, y, TRACK_W, TRACK_H, 0x4a5466).setOrigin(0.5);
    this.fill = this.add.rectangle(cx - TRACK_W / 2, y, TRACK_W * initialVolume, TRACK_H, 0xffd166).setOrigin(0, 0.5);
    this.handle = this.add.circle(cx - TRACK_W / 2 + TRACK_W * initialVolume, y, HANDLE_RADIUS, 0xffd166)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ draggable: true, useHandCursor: true });

    this.input.setDraggable(this.handle);
    this.handle.on('drag', (_pointer, dragX) => {
      const left = cx - TRACK_W / 2;
      const right = cx + TRACK_W / 2;
      const clamped = Phaser.Math.Clamp(dragX, left, right);
      const ratio = (clamped - left) / TRACK_W;
      this.setVolume(ratio);
    });

    // 트랙 클릭으로도 위치 이동
    track.setInteractive({ useHandCursor: true });
    track.on('pointerdown', (pointer) => {
      const left = cx - TRACK_W / 2;
      const ratio = Phaser.Math.Clamp((pointer.x - left) / TRACK_W, 0, 1);
      this.setVolume(ratio);
    });

    this.sliderCx = cx;
    this.sliderY = y;
    this.refreshVolumeDisplay(initialVolume);
  }

  setVolume(ratio) {
    AudioManager.setVolume(ratio);
    this.refreshVolumeDisplay(ratio);
  }

  nudgeVolume(delta) {
    const s = AudioManager.getSettings();
    this.setVolume(s.volume + delta);
  }

  refreshVolumeDisplay(ratio) {
    const left = this.sliderCx - TRACK_W / 2;
    this.handle.x = left + TRACK_W * ratio;
    this.fill.width = TRACK_W * ratio;
    this.volumeText.setText(`${Math.round(ratio * 100)}%`);
  }

  refreshMute() {
    const s = AudioManager.getSettings();
    if (s.muted) {
      this.muteText.setText('OFF (음소거 중)').setColor('#ef476f');
      this.muteBg.setFillStyle(0x3a1f25);
      this.muteBg.setStrokeStyle(6, 0xef476f);
    } else {
      this.muteText.setText('ON').setColor('#06d6a0');
      this.muteBg.setFillStyle(0x1f3a2f);
      this.muteBg.setStrokeStyle(6, 0x06d6a0);
    }
  }

  goBack() {
    AudioManager.playSfx(this, 'sfx_ui');
    this.scene.start('Title');
  }
}
