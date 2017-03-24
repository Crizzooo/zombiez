import Prefab from './Prefab';
import throttle from 'lodash.throttle';

export default class Enemy extends Prefab {
  constructor (game, name, position, properties) {
    super (game, name, position, properties);

    this.animations.add('left', [9, 10, 11, 12, 9, 13, 14], 9, true);
    this.animations.add('dead', [1, 2, 3, 4, 5, 6, 7, 8, 0], 9, false);

    this.stats = {
      health: 10,
      movement: 10,
      attack: 5
    };

    this.currentTarget = null;
    this.hit = false;

    this.moveTo = throttle(this.moveTo, 1000)
	  this.acquireTarget = throttle(this.acquireTarget, 1000)

  }

  attackPlayer (player) {
    socket.emit('playerReceiveDamage', {
      socketId: socket.id,
      newDamage: this.stats.attack
    });
    player.receiveDamage(this.stats.attack);
  }

  receiveDamage (damage) {

  }

  moveTo (target) {
    if (this.hit === false) {
      this.gameState.pathfinding.findPath(this.position, target, this.followPath, this);
    }
  }

  followPath (path) {
    console.log('inside path', path);
    let movingTween, pathLength
    movingTween = this.game.tweens.create(this);
    pathLength = path.length;

    if (this.hit === false) {
	    //If path is 0, attack the current target
	    if (pathLength <= 0) {
	      this.attackPlayer(this.currentTarget)
	      } else {
					console.log(movingTween)
	        path.forEach( (position) => {
	          movingTween.to({x: position.x, y: position.y}, 350, Phaser.Easing.LINEAR);
	        });

	        movingTween.start();
		    console.log('starting tween', movingTween);
      }
    }
  }

  acquireTarget (playersAry) {
  	//console.log('this.x and this.x', this.x, this.y)

	  let newTarget = playersAry.getFirstAlive()
	  let distance = 0;

	  playersAry.forEachAlive((player) => {
			  let playerDistance = Math.pow((player.x - this.x), 2) + Math.pow((player.y - this.y), 2);

			  if (distance <= playerDistance) {
				  distance = playerDistance;
				  newTarget = player;
			  }
		  });

	  this.currentTarget = newTarget;
    return newTarget
  }
}
