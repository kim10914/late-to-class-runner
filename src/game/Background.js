import { GAME_WIDTH, GAME_HEIGHT, LANE_Y, COLORS } from '../config/gameConfig.js';

// 패럴랙스 배경 + 바닥 + 레인 선 + 속도감을 위한 바닥 마커 묶음.
export default class Background {
  constructor(scene, bgKey) {
    this.scene = scene;

    this.bgImage = scene.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, bgKey).setOrigin(0, 0);
    const tex = scene.textures.get(bgKey).getSourceImage();
    if (tex && tex.height) {
      const s = GAME_HEIGHT / tex.height;
      this.bgImage.setTileScale(s, s);
    }

    const groundTop = LANE_Y[0] - 20;
    scene.add.rectangle(0, groundTop, GAME_WIDTH, GAME_HEIGHT - groundTop, COLORS.ground, 0.5).setOrigin(0);

    for (let i = 0; i < LANE_Y.length; i++) {
      scene.add.rectangle(0, LANE_Y[i] + 4, GAME_WIDTH, 4, COLORS.laneLine).setOrigin(0);
    }

    this.scrollMarkers = scene.add.group();
    for (let i = 0; i < 12; i++) {
      const x = (i / 12) * GAME_WIDTH;
      const mark = scene.add.rectangle(x, GAME_HEIGHT - 12, 80, 8, 0x4a5466, 0.8).setOrigin(0, 0.5);
      this.scrollMarkers.add(mark);
    }
  }

  // moved: 이번 프레임에 월드가 이동한 픽셀 거리
  scroll(moved) {
    this.bgImage.tilePositionX += moved * 0.3;
    this.scrollMarkers.children.iterate((m) => {
      if (!m) return;
      m.x -= moved;
      if (m.x < -m.width) m.x += GAME_WIDTH + m.width;
    });
  }
}
