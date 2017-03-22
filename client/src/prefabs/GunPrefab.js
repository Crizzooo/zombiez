export default class GunPrefab extends Phaser.Sprite {
  constructor(game, name, position, properties) {
    super(game.game, position.x, position.y, properties.texture, +properties.initial);
    this.gameState = game;
    this.name = name;
    //Add prefab to its group
    //this.gameState.groups[properties.group].add(this);
    //this.gameState.groups[properties.group].children.push(this);
    this.initial = +properties.initial;
    //Enable physics for each prefab, we enable it in other prefabs but this is a check
    this.game.physics.arcade.enable(this);
    this.gameState.prefabs[name] = this;
  }
}