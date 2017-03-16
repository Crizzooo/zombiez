var PB = PB || {};

PB.Star = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'star')
  this.game.physics.arcade.enable(this);
  this.body.allowGravity = false;
  this.anchor.setTo(0.5);
  this.outOfBoundsCall = true;
  this.checkWorldBounds = true;
  this.game.physics.arcade.collide(this, PB.game.playersGroup)
}

PB.Star.prototype = Object.create(Phaser.Sprite.prototype);
PB.Star.prototype.constructor = PB.Star;


