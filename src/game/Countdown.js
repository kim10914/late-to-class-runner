import { GAME_WIDTH, GAME_HEIGHT, COUNTDOWN_SEQUENCE, COUNTDOWN_STEP_MS } from '../config/gameConfig.js';
import { AudioManager } from '../audio/AudioManager.js';

// 게임 시작 전 3-2-1-시작! 카운트다운. onDone 콜백을 통해 게임 시작 신호를 알려줌.
export function startCountdown(scene, stageLabel, onDone) {
  const cx = GAME_WIDTH / 2;
  const cy = GAME_HEIGHT / 2;

  const stageBanner = scene.add.text(cx, GAME_HEIGHT * 0.25, stageLabel, {
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: '60px',
    color: '#ffd166',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  const countText = scene.add.text(cx, cy, '', {
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: '280px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5).setAlpha(0);

  const showStep = (index) => {
    if (index >= COUNTDOWN_SEQUENCE.length) {
      countText.destroy();
      stageBanner.destroy();
      onDone();
      return;
    }
    const label = COUNTDOWN_SEQUENCE[index];
    const isGo = index === COUNTDOWN_SEQUENCE.length - 1;

    countText.setText(label)
      .setColor(isGo ? '#06d6a0' : '#ffffff')
      .setScale(0.5)
      .setAlpha(1);

    AudioManager.playSfx(scene, isGo ? 'sfx_go' : 'sfx_count');

    scene.tweens.add({
      targets: countText,
      scale: isGo ? 1.4 : 1.1,
      duration: 250,
      ease: 'Back.easeOut'
    });
    scene.tweens.add({
      targets: countText,
      alpha: 0,
      delay: COUNTDOWN_STEP_MS - 250,
      duration: 200,
      onComplete: () => showStep(index + 1)
    });
  };

  showStep(0);
}
