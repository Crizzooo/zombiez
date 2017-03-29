/**
 * Created by CharlieShi on 3/21/17.
 */

export default class HealthHearts extends Phaser.Sprite {
  constructor(game, name, position, properties) {
    super(game.game, position.x, position.y, properties.texture, +properties.initial)

    this.gameState = game;
    this.name = name;

    //Add prefab to its group
    //this.gameState.groups[properties.group].add(this);
    this.gameState.groups[properties.group].children.push(this);
    this.initial = +properties.initial;

    this.fixedToCamera = true;

    this.gameState.prefabs[name] = this;
  }

  heartStatus() {
    if (this.frame === 0) return 'empty';
    if (this.frame === 1) return 'half';
    if (this.frame === 2) return 'full';
  }

  changeHeart(heart) {
    switch (heart) {
      case 'full':
        this.frame = 2;
        break;
      case 'half':
        this.frame = 1;
        break;
      case 'empty':
        this.frame = 0;
        break;
    }
    // console.log("FULL!!!!");
  }


}
