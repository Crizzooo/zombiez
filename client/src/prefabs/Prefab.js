/**
 * Created by CharlieShi on 3/17/17.
 */

export default class Prefab extends Phaser.Sprite {
  constructor(game, name, position, properties) {
    super(game.game, position.x, position.y, properties.texture);

    this.gameState = game;

    this.name = name;

    //Add prefab to its group
    this.gameState.groups[properties.group].add(this);
    this.frame = +properties.frame;
    this.anchor.setTo(0.5);

    //Enable physics for each prefab
    this.physics.arcade.enable(playerSprite);

    this.gameState.prefabs[name] = this;
  }
}