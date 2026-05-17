// 해상도 스케일. 모든 픽셀 단위 상수는 이 값에 곱해진다.
// 1.0 = 960×540, 2.0 = 1920×1080 (선명함 ↑)
const SCALE = 2;

export const GAME_WIDTH = 960 * SCALE;
export const GAME_HEIGHT = 540 * SCALE;

export const LANE_COUNT = 3;
// 3층(상) / 2층(중) / 1층(하). 1층 바닥 가깝게, 층 간 간격 1.2배 좁게.
export const LANE_Y = [GAME_HEIGHT * 0.61, GAME_HEIGHT * 0.77, GAME_HEIGHT * 0.93];

export const PLAYER_X = 180 * SCALE;
export const PLAYER_SIZE = 72 * SCALE;

export const LANE_CHANGE_MS = 110;
export const JUMP_HEIGHT_PX = 130 * SCALE;
export const JUMP_DURATION_MS = 500;

// 좌우 가속/감속 (px/s²) — 스케일에 비례해 동일 시간 내 동일 비율로 이동
export const ACCEL_FORWARD = 320 * SCALE;
export const BRAKE_BACKWARD = 1500 * SCALE;
export const COAST_DECEL = 150 * SCALE;
export const MIN_SPEED = 0;
export const ACCEL_RAMP = 1.6;

export const MAX_STRIKES = 3;
export const COLLISION_PENALTY_SEC = 3;

export const COUNTDOWN_SEQUENCE = ['3', '2', '1', '시작!'];
export const COUNTDOWN_STEP_MS = 700;

// 장애물 정의. spans = 차지하는 레인 수 (1=한 레인, 2=base 레인 + 위쪽 1레인까지 차단)
export const OBSTACLE_TYPES = {
  CROWD:    { key: 'crowd',  color: 0xe74c3c, w: 84  * SCALE, h: 120 * SCALE, dodge: 'lane', spans: 2 },
  CART:     { key: 'cart',   color: 0xf39c12, w: 108 * SCALE, h: 84  * SCALE, dodge: 'jump', spans: 1 },
  DOOR:     { key: 'door',   color: 0x8e44ad, w: 60  * SCALE, h: 144 * SCALE, dodge: 'lane', spans: 2 },
  PUDDLE:   { key: 'puddle', color: 0x3498db, w: 144 * SCALE, h: 30  * SCALE, dodge: 'jump', spans: 1 }
};

// 난이도별 설정. 최소 클리어 시간 목표: 하 60초 / 중 180초 / 상 300초.
// lateTimeSec = 이 시간을 (penalty 포함 총 시간이) 넘기면 지각으로 실패.
// spawnGapMs 는 1.3배 자주 등장하도록 이전 값에서 /1.3 적용.
export const DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: '하',
    longLabel: '하 - 복도',
    stageName: '복도',
    bgKey: 'bg_stage1',
    stageLengthPx: 39000 * SCALE,
    maxSpeed: 650 * SCALE,
    lateTimeSec: 90,
    allowedObstacles: ['CROWD', 'CART'],
    spawnGapMs: [770, 1310]
  },
  normal: {
    id: 'normal',
    label: '중',
    longLabel: '중 - 계단',
    stageName: '계단',
    bgKey: 'bg_stage2',
    stageLengthPx: 153000 * SCALE,
    maxSpeed: 850 * SCALE,
    lateTimeSec: 210,
    allowedObstacles: ['CROWD', 'CART'],
    spawnGapMs: [580, 1000]
  },
  hard: {
    id: 'hard',
    label: '상',
    longLabel: '상 - 본관 앞',
    stageName: '본관 앞',
    bgKey: 'bg_stage3',
    stageLengthPx: 330000 * SCALE,
    maxSpeed: 1100 * SCALE,
    lateTimeSec: 330,
    allowedObstacles: ['CROWD', 'CART', 'DOOR', 'PUDDLE'],
    spawnGapMs: [385, 690]
  }
};

export const DIFFICULTY_ORDER = ['easy', 'normal', 'hard'];

export const COLORS = {
  bg:       0x202833,
  ground:   0x394454,
  laneLine: 0x2a313d,
  player:   0x4cc9f0,
  ui:       '#ffffff',
  warn:     '#ffd166',
  danger:   '#ef476f',
  good:     '#06d6a0'
};
