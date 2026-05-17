import Phaser from 'phaser';
import { OBSTACLE_TYPES, LANE_Y, GAME_WIDTH } from '../config/gameConfig.js';

export default class Obstacle {
  static spawn(scene, group, typeKey, laneIndex) {
    const def = OBSTACLE_TYPES[typeKey];
    const y = LANE_Y[laneIndex];

    const sprite = scene.physics.add.sprite(GAME_WIDTH + def.w, y, `obs_${def.key}`);
    sprite.setOrigin(0.5, 1);
    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);

    sprite.body.setSize(def.w * 0.8, def.h * 0.8);
    sprite.body.setOffset(def.w * 0.1, def.h * 0.1);

    sprite.setData('typeKey', typeKey);
    sprite.setData('dodge', def.dodge);
    sprite.setData('laneIndex', laneIndex);

    group.add(sprite);
    return sprite;
  }
}
