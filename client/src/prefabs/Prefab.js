/**
 * Created by CharlieShi on 3/17/17.
 */

export default class Prefab extends Phaser.Sprite {
  constructor(game, name, position, properties) {
    super(game.game, position.x, position.y, properties.texture, properties.initial);

    this.gameState = game;
    this.name = name;

    //Add prefab to its group
    this.gameState.groups[properties.group].add(this);
    this.initial = +properties.initial;
    this.anchor.setTo(0.5);

    //Enable physics for each prefab
    this.game.physics.arcade.enable(this);
    //this.body.enable = true;


    this.gameState.prefabs[name] = this;
  }
}