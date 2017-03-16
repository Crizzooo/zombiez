var PB = PB || {};


PB.IceBall = function(game, x, y, senderSocketId){
  Phaser.Sprite.call(this, game, x, y, 'iceBall');
  this.game = game;
  this.game.physics.arcade.enable(this);
  this.anchor.setTo(0.5);
  this.body.allowGravity = false;
  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;

  this.senderSocketId = senderSocketId;
}

PB.IceBall.prototype = Object.create(Phaser.Sprite.prototype);
PB.IceBall.prototype.constructor = PB.IceBall;

PB.IceBall.prototype.update = function() {

  if(this.x > this.game.world.width || this.x < 0){
    this.kill();
  }
  if(this.y > this.game.world.height || this.y < 0){
    this.kill();
  }

}
