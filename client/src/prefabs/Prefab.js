/**
 * Created by CharlieShi on 3/17/17.
 */

export default class Prefab extends Phaser.Sprite {
  constructor(game, name, position, properties) {
    super(game.game, position.x, position.y, properties.texture);

    this.game_state = game;

    this.name = name;

    this.game_state.groups[properties.group].add(this);
    this.frame = +properties.frame;
    this.anchor.setTo(0.5);

    this.game_state.prefabs[name] = this;
  }
}