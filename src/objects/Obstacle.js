import Phaser from 'phaser';
import { OBSTACLE_TYPES, LANE_Y, GAME_WIDTH } from '../config/gameConfig.js';

export default class Obstacle {
  static spawn(scene, group, typeKey, baseLaneIndex) {
    const def = OBSTACLE_TYPES[typeKey];
    const y = LANE_Y[baseLaneIndex];

    const sprite = scene.physics.add.sprite(GAME_WIDTH + def.w, y, `obs_${def.key}`);
    sprite.setOrigin(0.5, 1);
    sprite.setDisplaySize(def.w, def.h);
    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);

    // body 크기는 텍스처 원본 픽셀 기준 (scaleX/scaleY가 자동 적용)
    const src = sprite.texture.getSourceImage();
    const nw = src.width;
    const nh = src.height;
    sprite.body.setSize(nw * 0.8, nh * 0.8);
    sprite.body.setOffset(nw * 0.1, nh * 0.1);

    // 차단하는 레인들 (base + spans만큼 위로). spans=2면 [base, base-1].
    const spans = def.spans || 1;
    const laneIndices = [];
    for (let i = 0; i < spans; i++) {
      const idx = baseLaneIndex - i;
      if (idx >= 0) laneIndices.push(idx);
    }

    sprite.setData('typeKey', typeKey);
    sprite.setData('dodge', def.dodge);
    sprite.setData('laneIndices', laneIndices);

    group.add(sprite);
    return sprite;
  }
}
