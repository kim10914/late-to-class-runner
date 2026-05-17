import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE, OBSTACLE_TYPES, COLORS } from './gameConfig.js';

// 이미지 슬롯 정의. public/assets/{key}.png 가 있으면 사용, 없으면 해당 크기·색의
// 단색 사각형이 자동으로 fallback 텍스처로 생성됨.
const STATIC_IMAGE_MANIFEST = [
  { key: 'player_run0', w: PLAYER_SIZE, h: PLAYER_SIZE, color: COLORS.player },
  { key: 'player_run1', w: PLAYER_SIZE, h: PLAYER_SIZE, color: COLORS.player },
  { key: 'item_circle', w: 28, h: 28, color: 0xffd166 },
  { key: 'bg_stage1',   w: GAME_WIDTH, h: GAME_HEIGHT, color: 0x2c3e50 },
  { key: 'bg_stage2',   w: GAME_WIDTH, h: GAME_HEIGHT, color: 0x34495e },
  { key: 'bg_stage3',   w: GAME_WIDTH, h: GAME_HEIGHT, color: 0x1e3a5f }
];

const OBSTACLE_IMAGES = Object.values(OBSTACLE_TYPES).map(def => ({
  key: `obs_${def.key}`,
  w: def.w,
  h: def.h,
  color: def.color
}));

export const IMAGE_MANIFEST = [...STATIC_IMAGE_MANIFEST, ...OBSTACLE_IMAGES];

// BGM — 메뉴용 1 + 난이도별 3
export const BGM_KEYS = ['bgm_menu', 'bgm_easy', 'bgm_normal', 'bgm_hard'];

// SFX. sfx_count 는 의도적으로 제외 — 카운트다운 비프 없음.
// (Countdown 에서 호출은 남아있지만 파일 없으면 자동 무시되어 향후 재추가 시 파일만 넣으면 동작)
export const SFX_KEYS = [
  'sfx_jump', 'sfx_lane', 'sfx_hit',
  'sfx_go',
  'sfx_clear', 'sfx_fail',
  'sfx_ui'
];

// 플레이어 달리기 애니메이션 정의
export const PLAYER_RUN_ANIM = {
  key: 'player_run',
  frames: ['player_run0', 'player_run1'],
  frameRate: 8,
  repeat: -1
};
