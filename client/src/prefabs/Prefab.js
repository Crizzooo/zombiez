/**
 * Created by CharlieShi on 3/17/17.
 */

export default class Prefab extends Phaser.Sprite {
  constructor(game, name, position, properties) {
    super(game.game, position.x, position.y, properties.texture, properties.initial);

    this.gameState = game;
    this.name = name;

    //Add prefab to its group
    console.log('inside prefab', this)
    this.gameState.groups[properties.group].add(this);
    this.initial = +properties.initial;
    this.anchor.setTo(0.5);

    //Enable physics for each prefab
    //TODO: could be this.game
    this.gameState.physics.arcade.enable(this);

    this.gameState.prefabs[name] = this;
  }
}



// Player = function (game,x,y)
// {	Phaser.Sprite.call(this,game,x,y,'GameAtlas','Player_Idle-0001.png');
// game.physics.enable(this, Phaser.Physics.ARCADE);
// this.animations.add('Idle',Phaser.Animation.generateFrameNames('Player_Idle-', 1, 18, '.png', 4),6,true);};
//
//
// Player.prototype = Object.create(Phaser.Sprite.prototype);
// Player.prototype.constructor = Player;
// player = new Player(game,game.world.centerX,game.world.height - 120);
// game.add.existing(player);//player.animations.add('Idle',Phaser.Animation.generateFrameNames('Player_Idle-', 1, 18, '.png', 4),6,true);player.animations.play('idle');