export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const LANE_COUNT = 3;
export const LANE_Y = [GAME_HEIGHT * 0.55, GAME_HEIGHT * 0.7, GAME_HEIGHT * 0.85];

export const PLAYER_X = 180;
export const PLAYER_SIZE = 48;
export const PLAYER_SLIDE_HEIGHT = 24;

export const LANE_CHANGE_MS = 110;
export const JUMP_HEIGHT_PX = 90;
export const JUMP_DURATION_MS = 500;
export const SLIDE_DURATION_MS = 550;

export const BASE_SCROLL_SPEED = 360;
export const SPEED_RAMP_PER_SEC = 6;
export const MAX_SCROLL_SPEED = 720;

export const STARTING_TIME_SEC = 60;
export const MAX_STRIKES = 3;

export const OBSTACLE_MIN_GAP_MS = 700;
export const OBSTACLE_MAX_GAP_MS = 1400;

export const OBSTACLE_TYPES = {
  CROWD:    { key: 'crowd',    color: 0xe74c3c, w: 56, h: 80, dodge: 'lane'  },
  CART:     { key: 'cart',     color: 0xf39c12, w: 72, h: 56, dodge: 'jump'  },
  DOOR:     { key: 'door',     color: 0x8e44ad, w: 40, h: 96, dodge: 'lane'  },
  PUDDLE:   { key: 'puddle',   color: 0x3498db, w: 96, h: 20, dodge: 'jump'  },
  BANNER:   { key: 'banner',   color: 0xc0392b, w: 96, h: 24, dodge: 'slide' }
};

export const STAGES = [
  {
    id: 1,
    name: '복도',
    durationSec: 20,
    allowedObstacles: ['CROWD', 'CART'],
    speedMul: 1.0
  },
  {
    id: 2,
    name: '계단',
    durationSec: 20,
    allowedObstacles: ['CROWD', 'CART', 'BANNER'],
    speedMul: 1.15
  },
  {
    id: 3,
    name: '본관 앞',
    durationSec: 20,
    allowedObstacles: ['CROWD', 'CART', 'DOOR', 'PUDDLE', 'BANNER'],
    speedMul: 1.3
  }
];

export const COLORS = {
  bg:       0x202833,
  ground:   0x394454,
  laneLine: 0x2a313d,
  player:   0x4cc9f0,
  ui:       '#ffffff',
  warn:     '#ffd166',
  danger:   '#ef476f'
};
