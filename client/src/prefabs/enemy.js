import Prefab from './Prefab';
import _ from 'lodash';
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
    this.playSound = _.throttle(this.playSound,5000);

    this.moveTo = throttle(this.moveTo, 1000)
	  this.acquireTarget = throttle(this.acquireTarget, 1000)

  }

  playSound (game, whatSound, volume)  {
    game[whatSound].play('',0,volume,false);
  }

  attackPlayer (player) {
    this.playSound(this.game.state.callbackContext, 'zombieHit', 1);
    player.receiveDamage(this.stats.attack);
    
    //NOTE: No longer using sockets like this
    // socket.emit('playerReceiveDamage', {
    //   socketId: socket.id,
    //   newDamage: this.stats.attack
    // });
  }

  receiveDamage (damage) {

  }

  moveTo (position) {
    //putting sound in here for now, with dropoff
    //sound continues one time after zombie dies...

    const distX = this.position.x - this.game.state.callbackContext.currentPlayerSprite.x;
    const distY = this.position.y - this.game.state.callbackContext.currentPlayerSprite.y;
    const distance = Math.sqrt(Math.pow(distX,2)+Math.pow(distY,2));
    const perc = 1 - ((distance-30)/150) - 0.2;

    if (perc > 1) thisplaySound(this.game.state.callbackContext,'zombieSound',0.8);
    else if(perc <= 0);
    else this.playSound(this.game.state.callbackContext,'zombieSound',perc);

    if (this.hit === false) {
      this.gameState.pathfinding.findPath(this.position, position, this.followPath, this);
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
