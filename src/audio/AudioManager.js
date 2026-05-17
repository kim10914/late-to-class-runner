// 전역 BGM 매니저. 씬을 옮겨도 BGM이 끊기지 않고, 다른 트랙으로 바뀔 때 크로스페이드.
// 볼륨/음소거는 Phaser SoundManager 의 마스터에 적용되고 localStorage 에 저장된다.

const STORAGE_KEY = 'audio_settings';
const DEFAULT_SETTINGS = { volume: 0.5, muted: false };
const FADE_MS = 400;

// SFX는 BGM 대비 살짝 더 들리도록 마스터 위에 곱해지는 배수
const SFX_VOLUME = 0.7;

let game = null;
let currentTrackKey = null;
let currentSound = null;

function readSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (_) {
    return { ...DEFAULT_SETTINGS };
  }
}

function writeSettings(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (_) {}
}

export const AudioManager = {
  init(phaserGame) {
    game = phaserGame;
    const s = readSettings();
    game.sound.mute = s.muted;
    game.sound.volume = s.volume;
  },

  getSettings() {
    return readSettings();
  },

  setVolume(v) {
    const s = readSettings();
    s.volume = Math.max(0, Math.min(1, v));
    writeSettings(s);
    if (game) game.sound.volume = s.volume;
  },

  setMuted(muted) {
    const s = readSettings();
    s.muted = !!muted;
    writeSettings(s);
    if (game) game.sound.mute = s.muted;
  },

  toggleMute() {
    const s = readSettings();
    this.setMuted(!s.muted);
    return !s.muted;
  },

  playBgm(scene, key) {
    if (!key) return;
    if (currentTrackKey === key && currentSound) return;

    if (!scene.cache.audio.exists(key)) {
      // 파일이 아직 없는 경우 조용히 무시
      return;
    }

    const oldSound = currentSound;
    if (oldSound) {
      if (oldSound.isPlaying) {
        scene.tweens.add({
          targets: oldSound,
          volume: 0,
          duration: FADE_MS,
          onComplete: () => { try { oldSound.stop(); oldSound.destroy(); } catch (_) {} }
        });
      } else {
        try { oldSound.stop(); oldSound.destroy(); } catch (_) {}
      }
    }

    const next = scene.sound.add(key, { loop: true });
    next.setVolume(0);
    next.play();
    scene.tweens.add({
      targets: next,
      volume: 1,
      duration: FADE_MS
    });

    currentSound = next;
    currentTrackKey = key;
  },

  playSfx(scene, key, options = {}) {
    if (!key || !scene) return;
    if (!scene.cache.audio.exists(key)) return;
    const volume = (options.volume != null ? options.volume : 1) * SFX_VOLUME;
    try {
      scene.sound.play(key, { volume });
    } catch (_) {
      // 잠긴 오디오 컨텍스트 등은 조용히 무시
    }
  },

  stop(scene) {
    if (currentSound) {
      const old = currentSound;
      if (scene && old.isPlaying) {
        scene.tweens.add({
          targets: old,
          volume: 0,
          duration: FADE_MS,
          onComplete: () => { try { old.stop(); old.destroy(); } catch (_) {} }
        });
      } else {
        try { old.stop(); old.destroy(); } catch (_) {}
      }
      currentSound = null;
      currentTrackKey = null;
    }
  }
};
